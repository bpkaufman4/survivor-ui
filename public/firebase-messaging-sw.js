// Firebase messaging service worker for handling background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCy0bYLg-rvHlAbwp8f_3j7tHjpua04qz4",
  authDomain: "react-survivor.firebaseapp.com",
  projectId: "react-survivor",
  storageBucket: "react-survivor.firebasestorage.app",
  messagingSenderId: "992945813938",
  appId: "1:992945813938:web:415e5fed3b3c629aac0cab",
  measurementId: "G-8CE0K0GRF6"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Keep track of recent notifications to prevent duplicates
const recentNotifications = new Map();
const DUPLICATE_WINDOW_MS = 5000; // 5 seconds

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentNotifications.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentNotifications.delete(key);
    }
  }
}, 10000); // Clean up every 10 seconds

// Service worker lifecycle events
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  // Detect if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Extract notification details
  // For iOS data-only messages, title/body are in the data payload
  const notificationTitle = payload.notification?.title || payload.data?.notificationTitle || 'React Survivor';
  const notificationBody = payload.notification?.body || payload.data?.notificationBody || 'You have a new notification';
  const notificationType = payload.data?.type || 'general';
  const serverNotificationId = payload.data?.serverNotificationId || 'unknown';
  const timestamp = Date.now();
  
  // Create deduplication key based on server notification ID
  const dedupeKey = serverNotificationId !== 'unknown' 
    ? serverNotificationId  // Use server ID directly
    : `${notificationType}_${notificationTitle}_${notificationBody}`.replace(/\s+/g, '_');
  
  // For browser notification tag, use the server notification ID to ensure
  // multiple notifications from the same server event replace each other
  const browserNotificationTag = serverNotificationId !== 'unknown' 
    ? serverNotificationId 
    : dedupeKey;
  
  // Check if we've recently shown this notification
  if (recentNotifications.has(dedupeKey)) {
    const lastShown = recentNotifications.get(dedupeKey);
    const timeSinceLastShown = timestamp - lastShown;
    
    if (timeSinceLastShown < DUPLICATE_WINDOW_MS) {
      return; // Skip duplicate
    }
  }
  
  // Record this notification
  recentNotifications.set(dedupeKey, timestamp);
  
  // Use the server notification ID as the notification tag for browser-level deduplication
  const uniqueTag = browserNotificationTag;
  
  // Notification options
  const notificationOptions = {
    body: notificationBody,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: uniqueTag,
    data: {
      ...payload.data,
      timestamp: payload.data?.timestamp || timestamp.toString(),
      notificationId: uniqueTag,
      source: 'service-worker',
      dedupeKey: dedupeKey,
      receivedAt: timestamp,
      isIOS: isIOS
    },
    actions: payload.data?.actions ? JSON.parse(payload.data.actions) : undefined,
    requireInteraction: false,
    silent: false,
    renotify: true,
    vibrate: isIOS ? undefined : [200, 100, 200], // iOS handles vibration differently
    timestamp: timestamp
  };
  
  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const notificationType = notificationData.type || 'general';
  
  // Determine the URL to open based on notification type
  let targetUrl = '/';
  if (notificationData.url) {
    targetUrl = notificationData.url;
  } else {
    switch (notificationType) {
      case 'draft':
        targetUrl = '/draft';
        break;
      case 'survey':
        targetUrl = '/surveys';
        break;
      case 'admin_note':
        targetUrl = '/notes';
        break;
      case 'league':
        targetUrl = '/leagues';
        break;
      default:
        targetUrl = '/';
    }
  }

  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          if (targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});