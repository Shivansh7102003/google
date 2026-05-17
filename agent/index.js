import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import http from 'http';

const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

healthServer.listen(8080, () => {
  console.log('Health check server running on port 8080');
});

import { poll } from './poller.js';
import { detectEvents } from './eventDetector.js';
import { checkRelevance } from './relevanceFilter.js';
import { generateInsight } from './gemini.js';
import { writeInsightAndFanout } from './writer.js';

let running = true;

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  running = false;
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

const POLL_INTERVAL = 3000;

async function main() {
  console.log('Analyst\'s Dugout agent starting...');
  console.log(`Poll interval: ${POLL_INTERVAL}ms`);
  console.log('Press Ctrl+C to stop\n');

  let lastStateHash = null;

  while (running) {
    const startTime = Date.now();
    
    try {
      const state = await poll();
      
      if (state) {
        const stateHash = JSON.stringify({ score: state.score, wickets: state.wickets, overs: state.overs });
        
        if (stateHash !== lastStateHash) {
          lastStateHash = stateHash;
          
          console.log(`[${new Date().toISOString()}] State: ${state.battingTeam} ${state.score}/${state.wickets} (${state.overs} overs)`);
          
          const trigger = detectEvents();
          
          if (trigger) {
            console.log(`  → Trigger: ${trigger.triggerType}`);
            
            const relevance = checkRelevance(trigger.triggerType);
            
            if (relevance.allowed) {
              console.log(`  → Generating insight...`);
              
              try {
                const insight = await generateInsight(trigger, state);
                console.log(`  ✓ Insight: "${insight.headline}"`);
                console.log(`    Key player: ${insight.keyPlayer}`);
                
                // Phase 3: Persist to Firebase
                await writeInsightAndFanout({ insight, matchState: state });
              } catch (err) {
                console.error(`  ✗ Insight generation/persistence failed: ${err.message}`);
              }
            } else {
              console.log(`  → Blocked: ${relevance.reason}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    }

    const elapsed = Date.now() - startTime;
    const sleepTime = Math.max(0, POLL_INTERVAL - elapsed);
    
    await new Promise(resolve => setTimeout(resolve, sleepTime));
  }

  console.log('Agent stopped.');
}

main();