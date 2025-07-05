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

// Add initial test entries to verify logging is working
logNotification('SERVICE_WORKER_INITIALIZED', {
  timestamp: Date.now(),
  message: 'Service worker loaded and Firebase initialized',
  messagingInstance: !!messaging,
  onBackgroundMessageRegistered: typeof messaging.onBackgroundMessage === 'function'
});

// Test if onBackgroundMessage is properly set up
console.log('[firebase-messaging-sw.js] Messaging instance:', messaging);
console.log('[firebase-messaging-sw.js] onBackgroundMessage function:', messaging.onBackgroundMessage);

// Add a test to see if the background message handler is working
setTimeout(() => {
  logNotification('SERVICE_WORKER_READY_CHECK', {
    timestamp: Date.now(),
    message: 'Service worker ready for background messages',
    messagingReady: !!messaging,
    handlerRegistered: true
  });  }, 1000);

// Global error handlers to catch any FCM issues
self.addEventListener('error', function(event) {
  console.error('[firebase-messaging-sw.js] Service worker error:', event.error);
  logNotification('SERVICE_WORKER_ERROR', {
    error: event.error?.message || 'Unknown error',
    filename: event.filename,
    lineno: event.lineno,
    timestamp: Date.now()
  });
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('[firebase-messaging-sw.js] Unhandled promise rejection:', event.reason);
  logNotification('UNHANDLED_PROMISE_REJECTION', {
    reason: event.reason?.message || event.reason,
    timestamp: Date.now()
  });
});

// Check if FCM is working by listening to all messaging events
try {
  // Try to register a message handler with additional logging
  console.log('[firebase-messaging-sw.js] Registering background message handler...');
  
  // Alternative approach - check if messages are coming through differently
  self.addEventListener('push', function(event) {
    console.log('[firebase-messaging-sw.js] 🔔 RAW PUSH EVENT RECEIVED!');
    console.log('[firebase-messaging-sw.js] Push event data:', event.data ? event.data.text() : 'No data');
    
    logNotification('RAW_PUSH_EVENT_RECEIVED', {
      hasData: !!event.data,
      data: event.data ? event.data.text() : null,
      timestamp: Date.now(),
      message: 'Raw push event - bypassing FCM handler?'
    });
  });
  
} catch (error) {
  console.error('[firebase-messaging-sw.js] Error setting up message handlers:', error);
  logNotification('HANDLER_SETUP_ERROR', {
    error: error.message,
    timestamp: Date.now()
  });
}

// Service worker lifecycle events for debugging
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  logNotification('SERVICE_WORKER_INSTALLING', {
    timestamp: Date.now(),
    message: 'Service worker install event triggered'
  });
  // Immediately take control
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  logNotification('SERVICE_WORKER_ACTIVATING', {
    timestamp: Date.now(),
    message: 'Service worker activate event triggered'
  });
  // Become available to all pages
  event.waitUntil(self.clients.claim());
});

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] ⚡ BACKGROUND MESSAGE HANDLER TRIGGERED!');
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  // Detect if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isPWA = self.location.protocol === 'https:' && self.location.hostname !== 'localhost';
  
  // Extract notification details
  const notificationTitle = payload.notification?.title || 'React Survivor';
  const notificationBody = payload.notification?.body || 'You have a new notification';
  const notificationType = payload.data?.type || 'general';
  const serverNotificationId = payload.data?.serverNotificationId || 'unknown';
  const timestamp = Date.now();
  
  // Detailed logging for debugging duplicates
  console.log('[firebase-messaging-sw.js] Notification details:', {
    title: notificationTitle,
    body: notificationBody,
    type: notificationType,
    serverNotificationId: serverNotificationId,
    timestamp: timestamp,
    payloadData: payload.data
  });
  
  logNotification('RECEIVED_BACKGROUND_MESSAGE', {
    title: payload.notification?.title,
    body: payload.notification?.body,
    data: payload.data,
    serverNotificationId: payload.data?.serverNotificationId,
    isIOS: isIOS,
    isPWA: isPWA,
    userAgent: navigator.userAgent.substring(0, 100),
    fullPayload: payload
  });
  
  // Create deduplication key based on server notification ID (most reliable)
  // Use server notification ID as the deduplication key AND browser notification tag
  const dedupeKey = serverNotificationId !== 'unknown' 
    ? serverNotificationId  // Use server ID directly
    : `${notificationType}_${notificationTitle}_${notificationBody}`.replace(/\s+/g, '_');
  
  // For browser notification tag, use the server notification ID to ensure
  // multiple notifications from the same server event replace each other
  const browserNotificationTag = serverNotificationId !== 'unknown' 
    ? serverNotificationId 
    : dedupeKey;
  
  console.log(`[firebase-messaging-sw.js] DEDUPLICATION CHECK:`);
  console.log(`  Server Notification ID: ${serverNotificationId}`);
  console.log(`  Dedupe Key: ${dedupeKey}`);
  console.log(`  Browser Tag: ${browserNotificationTag}`);
  console.log(`  Recent notifications map size: ${recentNotifications.size}`);
  console.log(`  Recent notifications keys:`, Array.from(recentNotifications.keys()));
  
  // Check if we've recently shown this notification
  if (recentNotifications.has(dedupeKey)) {
    const lastShown = recentNotifications.get(dedupeKey);
    const timeSinceLastShown = timestamp - lastShown;
    console.log(`[firebase-messaging-sw.js] DUPLICATE DETECTED!`);
    console.log(`  Last shown: ${lastShown}`);
    console.log(`  Current time: ${timestamp}`);
    console.log(`  Time since last: ${timeSinceLastShown}ms`);
    console.log(`  Duplicate window: ${DUPLICATE_WINDOW_MS}ms`);
    
    if (timeSinceLastShown < DUPLICATE_WINDOW_MS) {
      logNotification('DUPLICATE_DETECTED_SKIPPED', {
        dedupeKey,
        browserNotificationTag,
        serverNotificationId,
        timeSinceLastShown: timeSinceLastShown,
        duplicateWindowMs: DUPLICATE_WINDOW_MS,
        action: 'SKIPPED - Within duplicate window'
      });
      console.log(`[firebase-messaging-sw.js] SKIPPING DUPLICATE NOTIFICATION`);
      return;
    } else {
      console.log(`[firebase-messaging-sw.js] Outside duplicate window, allowing notification`);
    }
  } else {
    console.log(`[firebase-messaging-sw.js] First time seeing this notification`);
  }
  
  // Record this notification
  recentNotifications.set(dedupeKey, timestamp);
  console.log(`[firebase-messaging-sw.js] Added to recent notifications map. New size: ${recentNotifications.size}`);
  
  // Use the server notification ID as the notification tag for browser-level deduplication
  const uniqueTag = browserNotificationTag;
  
  // iOS-specific notification options (iOS has stricter requirements)
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
      isIOS: isIOS,
      isPWA: isPWA
    },
    actions: payload.data?.actions ? JSON.parse(payload.data.actions) : undefined,
    requireInteraction: false, // iOS doesn't support this well
    silent: false,
    renotify: true,
    // iOS-specific enhancements
    vibrate: isIOS ? undefined : [200, 100, 200], // iOS handles vibration differently
    timestamp: timestamp
  };

  logNotification('SHOWING_NOTIFICATION', {
    uniqueTag,
    dedupeKey,
    browserNotificationTag,
    serverNotificationId,
    isIOS,
    isPWA,
    notificationTitle,
    notificationBody,
    message: `Using tag: ${uniqueTag} for deduplication`,
    notificationOptions: {
      tag: uniqueTag,
      renotify: notificationOptions.renotify
    }
  });
  
  console.log(`[firebase-messaging-sw.js] SHOWING NOTIFICATION:`);
  console.log(`  Title: ${notificationTitle}`);
  console.log(`  Body: ${notificationBody}`);
  console.log(`  Tag: ${uniqueTag}`);
  console.log(`  iOS: ${isIOS}, PWA: ${isPWA}`);
  console.log(`  Renotify: ${notificationOptions.renotify}`);
  
  // On iOS, sometimes we need to explicitly request notification display
  const showNotificationPromise = self.registration.showNotification(notificationTitle, notificationOptions);
  
  if (isIOS) {
    // Additional iOS-specific logging
    showNotificationPromise.then(() => {
      console.log(`[firebase-messaging-sw.js] iOS Notification shown successfully: ${uniqueTag}`);
      logNotification('NOTIFICATION_SHOWN_SUCCESS_IOS', {
        uniqueTag,
        timestamp: Date.now(),
        message: 'iOS notification displayed successfully'
      });
    }).catch((error) => {
      console.error(`[firebase-messaging-sw.js] iOS Notification show error: ${error.message}`);
      logNotification('NOTIFICATION_SHOW_ERROR_IOS', {
        uniqueTag,
        error: error.message,
        timestamp: Date.now()
      });
    });
  } else {
    showNotificationPromise.then(() => {
      console.log(`[firebase-messaging-sw.js] Desktop Notification shown successfully: ${uniqueTag}`);
    }).catch((error) => {
      console.error(`[firebase-messaging-sw.js] Desktop Notification show error: ${error.message}`);
    });
  }
  
  return showNotificationPromise;
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
  console.log('[firebase-messaging-sw.js] Received message from main thread:', event.data);
  
  if (event.data && event.data.type === 'get-notification-log') {
    console.log('[firebase-messaging-sw.js] Sending notification log, entries:', notificationLog.length);
    
    // Add a test entry when log is requested to verify logging is working
    logNotification('LOG_REQUESTED', {
      requestTime: new Date().toISOString(),
      currentLogSize: notificationLog.length,
      serviceWorkerActive: true
    });
    
    // Send notification log back to main thread
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        type: 'notification-log',
        log: notificationLog,
        timestamp: Date.now()
      });
      console.log('[firebase-messaging-sw.js] Notification log sent via MessageChannel');
    } else {
      console.error('[firebase-messaging-sw.js] No message port available');
    }
  }
});
