// ─────────────────────────────────────────────────────────────
//  firebase-config.js  — Fill values from Firebase Console
//  Project Settings → Your Apps → Web → SDK setup & config
// ─────────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            "API_KEY_FROM_FIREBASE_CONSOLE",
  authDomain:        "analysts-dugout.firebaseapp.com",
  projectId:         "analysts-dugout",
  storageBucket:     "analysts-dugout.appspot.com",
  messagingSenderId: "SENDER_ID_FROM_FIREBASE_CONSOLE",
  appId:             "APP_ID_FROM_FIREBASE_CONSOLE",
  databaseURL:       "https://analysts-dugout-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// VAPID key for FCM Web Push (Firebase Console → Cloud Messaging → Web push certificates)
const VAPID_KEY = "VITE_FIREBASE_VAPID_KEY";

// Match ID to listen on (set from your CricketData.org /currentMatches response)
const MATCH_ID = "d0401bb9-aa19-478c-8579-e275afd174cc";

// Initialise Firebase (compat SDK loaded via CDN in index.html)
firebase.initializeApp(FIREBASE_CONFIG);

const db       = firebase.firestore();
const rtdb     = firebase.database();
const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;
