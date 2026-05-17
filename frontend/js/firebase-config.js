// ─────────────────────────────────────────────────────────────
//  firebase-config.js  — Fill values from Firebase Console
//  Project Settings → Your Apps → Web → SDK setup & config
// ─────────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            "VITE_FIREBASE_API_KEY",
  authDomain:        "VITE_FIREBASE_AUTH_DOMAIN",
  projectId:         "VITE_FIREBASE_PROJECT_ID",
  storageBucket:     "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId:             "VITE_FIREBASE_APP_ID",
  databaseURL:       "VITE_FIREBASE_DATABASE_URL",
};

// VAPID key for FCM Web Push (Firebase Console → Cloud Messaging → Web push certificates)
const VAPID_KEY = "VITE_FIREBASE_VAPID_KEY";

// Match ID to listen on (set from your CricketData.org /currentMatches response)
const MATCH_ID = "YOUR_MATCH_ID";

// Initialise Firebase (compat SDK loaded via CDN in index.html)
firebase.initializeApp(FIREBASE_CONFIG);

const db       = firebase.firestore();
const rtdb     = firebase.database();
const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;
