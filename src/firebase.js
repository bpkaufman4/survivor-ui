// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import apiUrl from "./apiUrls";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCy0bYLg-rvHlAbwp8f_3j7tHjpua04qz4",
  authDomain: "react-survivor.firebaseapp.com",
  projectId: "react-survivor",
  storageBucket: "react-survivor.firebasestorage.app",
  messagingSenderId: "992945813938",
  appId: "1:992945813938:web:415e5fed3b3c629aac0cab",
  measurementId: "G-8CE0K0GRF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

// VAPID key
const VAPID_KEY = 'BJsc5HoZKnoNfyrlq9LOuFAhN3GY_fZS5sp_1OFyoZAMMAh2DL_uvz1BE3qf3Ia_MqiaPQkoLiXqkncQe4YT-EM'

// Function to check if the browser supports notifications
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Function to register service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Worker not supported');
  }
};

// Function to request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    console.log('[Firebase] Starting requestNotificationPermission...');
    
    if (!isNotificationSupported()) {
      console.log('[Firebase] Notifications not supported in this browser');
      return null;
    }

    // Register service worker first
    console.log('[Firebase] Registering service worker...');
    await registerServiceWorker();
    console.log('[Firebase] Service worker registered successfully');

    // Check current permission
    console.log('[Firebase] Current permission:', Notification.permission);

    const permission = await Notification.requestPermission();
    console.log('[Firebase] Permission request result:', permission);
    
    if (permission === 'granted') {
      console.log('[Firebase] Notification permission granted, getting FCM token...');
      
      // Add a small delay for iOS
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Get the FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          console.log('[Firebase] FCM Token received:', token.substring(0, 20) + '...');
          
          // Automatically send to server
          const success = await sendTokenToServer(token);
          if (success) {
            console.log('[Firebase] Token sent to server successfully');
            return token;
          } else {
            console.error('[Firebase] Failed to send token to server');
            return token; // Return token anyway, server issue is separate
          }
        } else {
          console.log('[Firebase] No registration token available.');
          return null;
        }
      } catch (tokenError) {
        console.error('[Firebase] Error getting FCM token:', tokenError);
        return null;
      }
    } else {
      console.log('[Firebase] Notification permission denied:', permission);
      return null;
    }
  } catch (error) {
    console.error('[Firebase] Error in requestNotificationPermission:', error);
    return null;
  }
};

// Function to send FCM token to your backend
export const sendTokenToServer = async (token) => {
  try {
    console.log('[Firebase] Sending token to server...');
    
    // Collect device information
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lastSeen: new Date().toISOString(),
      isPWA: window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    };

    console.log('[Firebase] Device info:', deviceInfo);

    const response = await fetch(`${apiUrl}user/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('jwt')
      },
      body: JSON.stringify({ 
        fcmToken: token,
        deviceInfo: deviceInfo
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[Firebase] FCM token sent to server successfully:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error('[Firebase] Failed to send FCM token to server:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('[Firebase] Error sending FCM token to server:', error);
    return false;
  }
};

// Function to initialize FCM for the current user
export const initializeFCM = async () => {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      await sendTokenToServer(token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Failed to initialize FCM:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });

export { app, analytics, messaging };