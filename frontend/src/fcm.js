import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // In a real app, you'd send this to your server/Firestore
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
