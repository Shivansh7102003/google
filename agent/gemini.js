import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a cricket expert commentator. Generate a brief insight card for a live cricket match.

OUTPUT STRICT JSON with these fields:
{
  "headline": "string under 60 characters",
  "beginner": "string - what happened for casual cricket fans (2-3 sentences)",
  "expert": "string - tactical insight for cricket enthusiasts (2-3 sentences)",  
  "keyPlayer": "string - player name most relevant to this moment",
  "triggerType": "string - the trigger type (WICKET, POWERPLAY_END, BOWLING_CHANGE, DEATH_OVERS, NEW_BATTER, PARTNERSHIP_100, SIX_HIT, PARTNERSHIP_50, NEW_OVER)"
}

RULES:
- Use real player names from the match data provided
- Include specific numbers (runs, overs, wickets)
- Keep headline under 60 characters
- Make beginner explanation accessible to non-cricket-fans
- Make expert explanation show tactical depth
- Output ONLY valid JSON, no markdown, no explanation`;

export async function generateInsight(event, matchState) {
  if (!event || !matchState) {
    throw new Error('Missing event or matchState');
  }

  const prompt = `${SYSTEM_PROMPT}

MATCH CONTEXT:
- Teams: ${matchState.battingTeam} vs ${matchState.bowlingTeam}
- Score: ${matchState.score}/${matchState.wickets} in ${matchState.overs} overs
- Status: ${matchState.status}

EVENT: ${event.triggerType}
${event.details ? JSON.stringify(event.details) : ''}

Generate the insight card now. Output ONLY valid JSON.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7, -3);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3, -3);
    }

    const insight = JSON.parse(jsonStr);

    if (!insight.headline || !insight.beginner || !insight.expert || !insight.keyPlayer || !insight.triggerType) {
      throw new Error('Missing required fields in Gemini response');
    }

    if (insight.headline.length > 60) {
      throw new Error('Headline exceeds 60 characters');
    }

    return insight;
  } catch (error) {
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
}