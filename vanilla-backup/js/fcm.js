// ─────────────────────────────────────────────────────────────
//  fcm.js  — Firebase Cloud Messaging (Push Notifications)
//  Depends on: firebase-config.js (messaging object)
// ─────────────────────────────────────────────────────────────

(async function initFCM() {
  // FCM requires a service worker and browser support
  if (!messaging) {
    console.log('[FCM] Messaging not supported in this browser.');
    return;
  }

  try {
    // Register the FCM service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM] Service worker registered:', registration.scope);

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied.');
      return;
    }

    // Get FCM token
    const token = await messaging.getToken({
      vapidKey:           VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('[FCM] Token obtained:', token);
      // Subscribe to match topic via your agent's HTTP endpoint (optional)
      // await subscribeToTopic(token, MATCH_ID);
    }

    // Foreground message handler — show in-app toast
    messaging.onMessage(payload => {
      console.log('[FCM] Foreground message:', payload);
      const title = payload.notification?.title || '🏏 New Insight';
      const body  = payload.notification?.body  || '';
      showToast(`${title} — ${body}`);
    });

  } catch (err) {
    console.error('[FCM] Init error:', err);
  }
})();
