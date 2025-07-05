// Firebase messaging service worker for handling background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('[firebase-messaging-sw.js] Service worker script loaded');

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

console.log('[firebase-messaging-sw.js] Firebase initialized in service worker');

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Keep track of recent notifications to prevent duplicates
const recentNotifications = new Map();
const notificationLog = []; // Store detailed logs for debugging
const DUPLICATE_WINDOW_MS = 5000; // 5 seconds
const MAX_LOG_ENTRIES = 50; // Keep last 50 notifications

// Function to add notification to log
const logNotification = (action, data) => {
  const logEntry = {
    timestamp: Date.now(),
    action: action,
    data: data
  };
  
  notificationLog.unshift(logEntry);
  if (notificationLog.length > MAX_LOG_ENTRIES) {
    notificationLog.pop();
  }
  
  console.log(`[firebase-messaging-sw.js] ${action}:`, data);
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentNotifications.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentNotifications.delete(key);
    }
  }
}, 10000); // Clean up every 10 seconds

// Expose notification log for debugging (can be accessed from main thread)
self.getNotificationLog = () => notificationLog;

// Service worker lifecycle events for debugging
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  // Immediately take control
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  // Become available to all pages
  event.waitUntil(self.clients.claim());
});

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  logNotification('RECEIVED_BACKGROUND_MESSAGE', {
    title: payload.notification?.title,
    body: payload.notification?.body,
    data: payload.data,
    serverNotificationId: payload.data?.serverNotificationId
  });
  
  // Create a unique identifier for this notification to prevent duplicates
  const notificationTitle = payload.notification?.title || 'React Survivor';
  const notificationBody = payload.notification?.body || 'You have a new notification';
  const notificationType = payload.data?.type || 'general';
  const serverNotificationId = payload.data?.serverNotificationId || 'unknown';
  const timestamp = Date.now();
  
  // Create deduplication key based on server notification ID (most reliable)
  // Fallback to content-based deduplication if no server ID
  const dedupeKey = serverNotificationId !== 'unknown' 
    ? `server_${serverNotificationId}`
    : `${notificationType}_${notificationTitle}_${notificationBody}`.replace(/\s+/g, '_');
  
  // Check if we've recently shown this notification
  if (recentNotifications.has(dedupeKey)) {
    const lastShown = recentNotifications.get(dedupeKey);
    if (timestamp - lastShown < DUPLICATE_WINDOW_MS) {
      logNotification('DUPLICATE_DETECTED_SKIPPED', {
        dedupeKey,
        serverNotificationId,
        timeSinceLastShown: timestamp - lastShown
      });
      return;
    }
  }
  
  // Record this notification
  recentNotifications.set(dedupeKey, timestamp);
  
  // Create a unique tag for the browser notification system
  const uniqueTag = payload.data?.notificationId || 
                   `${notificationType}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  
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
      receivedAt: timestamp
    },
    actions: payload.data?.actions ? JSON.parse(payload.data.actions) : undefined,
    requireInteraction: payload.data?.requireInteraction === 'true',
    silent: false,
    renotify: true
  };

  logNotification('SHOWING_NOTIFICATION', {
    uniqueTag,
    dedupeKey,
    serverNotificationId,
    notificationOptions
  });
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Handle different notification types
  const data = event.notification.data;
  let url = '/';
  
  if (data?.url) {
    url = data.url;
  } else if (data?.type) {
    switch (data.type) {
      case 'draft':
        url = '/draft';
        break;
      case 'survey':
        // Default fallback if no specific URL provided
        url = '/surveys';
        break;
      case 'admin_note':
        url = '/notes';
        break;
      case 'league':
        url = '/leagues';
        break;
      default:
        url = '/';
    }
  }
  
  // Open the app and navigate to the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ action: 'navigate', url: url });
          return client.focus();
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + url);
      }
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'get-notification-log') {
    // Send notification log back to main thread
    event.ports[0].postMessage({
      type: 'notification-log',
      log: notificationLog
    });
  }
});
