import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// GOOGLE_APPLICATION_CREDENTIALS might be relative to agent/ or absolute
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? (process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('/') 
      ? process.env.GOOGLE_APPLICATION_CREDENTIALS 
      : join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS))
  : join(__dirname, '..', 'serviceAccountKey.json');

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`
});

export const db = getFirestore();
export const rtdb = getDatabase();
