// firebase-messaging-sw.js — FCM background push handler
// Must be served from the root of the domain

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Must match firebase-config.js
firebase.initializeApp({
  apiKey:            "VITE_FIREBASE_API_KEY",
  authDomain:        "VITE_FIREBASE_AUTH_DOMAIN",
  projectId:         "VITE_FIREBASE_PROJECT_ID",
  storageBucket:     "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId:             "VITE_FIREBASE_APP_ID",
  databaseURL:       "VITE_FIREBASE_DATABASE_URL",
});

const messaging = firebase.messaging();

// Background push — show system notification
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || "Analyst's Dugout";
  const body  = payload.notification?.body  || 'New tactical insight';
  const icon  = '/icons/icon-192.png';

  self.registration.showNotification(title, { body, icon, badge: icon });
});

// App shell cache for offline support
const CACHE_NAME = 'analysts-dugout-v1';
const SHELL = ['/', '/index.html', '/css/style.css', '/js/firebase-config.js', '/js/app.js', '/js/fcm.js'];

self.addEventListener('install',  e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Notification click — focus or open the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    const existing = list.find(c => c.url.includes(self.location.origin));
    if (existing) return existing.focus();
    return clients.openWindow('/');
  }));
});
