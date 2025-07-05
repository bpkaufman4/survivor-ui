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
    if (!isNotificationSupported()) {
      return null;
    }

    // Register service worker first
    await registerServiceWorker();

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Add a small delay for iOS
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Get the FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          // Automatically send to server
          const success = await sendTokenToServer(token);
          if (success) {
            return token;
          } else {
            return token; // Return token anyway, server issue is separate
          }
        } else {
          return null;
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in requestNotificationPermission:', error);
    return null;
  }
};

// Function to send FCM token to your backend
export const sendTokenToServer = async (token) => {
  try {
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
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to send FCM token to server:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending FCM token to server:', error);
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

// Function to check and register token if permission already granted
export const checkExistingPermissionAndRegisterToken = async () => {
  try {
    if (!isNotificationSupported()) {
      return null;
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      try {
        // Register service worker if needed
        await registerServiceWorker();
        
        // Try to get existing token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          // Send to server (this will update if token already exists)
          const success = await sendTokenToServer(token);
          return token;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error getting existing token:', error);
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error checking existing permission:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      // Check if the page is currently visible (app in foreground)
      const isPageVisible = !document.hidden;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS && !isPageVisible) {
        // On iOS, when page is hidden, we need to show the notification manually
        // because the service worker isn't getting background messages
        const notificationTitle = payload.notification?.title || payload.data?.notificationTitle || 'React Survivor';
        const notificationBody = payload.notification?.body || payload.data?.notificationBody || 'You have a new notification';
        
        // Show notification using the Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/android/android-launchericon-192-192.png',
            badge: '/android/android-launchericon-96-96.png',
            tag: payload.data?.serverNotificationId || `notification_${Date.now()}`,
            data: payload.data,
            requireInteraction: false
          });
          
          notification.onclick = function() {
            window.focus();
            notification.close();
            
            // Handle navigation based on notification type
            if (payload.data?.url) {
              window.location.href = payload.data.url;
            } else if (payload.data?.type) {
              switch (payload.data.type) {
                case 'draft':
                  window.location.href = '/draft';
                  break;
                case 'survey':
                  window.location.href = '/surveys';
                  break;
                case 'admin_note':
                  window.location.href = '/notes';
                  break;
                case 'league':
                  window.location.href = '/leagues';
                  break;
                default:
                  window.location.href = '/';
              }
            }
          };
        }
      }
      
      resolve(payload);
    });
  });

export { app, analytics, messaging };