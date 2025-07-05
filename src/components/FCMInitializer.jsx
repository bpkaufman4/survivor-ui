import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { checkExistingPermissionAndRegisterToken, onMessageListener } from '../firebase';

const FCMInitializer = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      console.log('[FCMInitializer] User authenticated, checking for existing FCM permission...');
      
      // Check for existing permission and register token if available
      checkExistingPermissionAndRegisterToken()
        .then((token) => {
          if (token) {
            console.log('[FCMInitializer] FCM token found and registered');
          } else {
            console.log('[FCMInitializer] No existing FCM token found - user needs to enable notifications in settings');
          }
        })
        .catch((error) => {
          console.error('[FCMInitializer] Failed to check/register FCM token:', error);
        });
    }
  }, [user]);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log('Received foreground message:', payload);
        
        // Show a notification or update UI
        if (payload.notification) {
          // You can use a toast library or custom notification component here
          if ('Notification' in window && Notification.permission === 'granted') {
            // Create a unique tag to prevent notification deduplication
            const timestamp = Date.now();
            const uniqueTag = payload.data?.notificationId || 
                             `${payload.data?.type || 'general'}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            
            const notification = new Notification(payload.notification.title || 'React Survivor', {
              body: payload.notification.body,
              icon: payload.notification.icon || '/android/android-launchericon-192-192.png',
              tag: uniqueTag,
              data: {
                ...payload.data,
                timestamp: payload.data?.timestamp || timestamp.toString(),
                notificationId: uniqueTag
              },
              silent: false,
              renotify: true
            });
            
            // Handle notification click
            notification.onclick = function(event) {
              event.preventDefault();
              window.focus();
              
              // Navigate to appropriate page
              const data = payload.data;
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
              
              window.location.href = url;
              notification.close();
            };
          }
        }
      })
      .catch((err) => console.log('Failed to listen for messages:', err));

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default FCMInitializer;
