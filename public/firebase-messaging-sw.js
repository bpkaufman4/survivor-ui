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

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'React Survivor';
  
  // Create a unique tag to prevent notification deduplication
  const timestamp = Date.now();
  const uniqueTag = payload.data?.notificationId || 
                   `${payload.data?.type || 'general'}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: uniqueTag,
    data: {
      ...payload.data,
      timestamp: payload.data?.timestamp || timestamp.toString(),
      notificationId: uniqueTag
    },
    actions: payload.data?.actions ? JSON.parse(payload.data.actions) : undefined,
    requireInteraction: payload.data?.requireInteraction === 'true',
    silent: false,
    renotify: true // Force showing notification even if similar ones exist
  };

  console.log('[firebase-messaging-sw.js] Showing notification with tag:', uniqueTag);
  self.registration.showNotification(notificationTitle, notificationOptions);
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
