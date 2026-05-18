import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
let config = {};

if (existsSync(serviceAccountPath)) {
  console.log('Firebase: Using serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  config = {
    credential: cert(serviceAccount)
  };
} else {
  console.log('Firebase: serviceAccountKey.json not found, using default credentials');
  // In Cloud Run, initializeApp() with no args uses the Metadata Server automatically
}

const projectId = process.env.FIREBASE_PROJECT_ID || 'analysts-dugout';
config.databaseURL = `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

initializeApp(config);

export const db = getFirestore();
export const rtdb = getDatabase();
export const messaging = getMessaging();
