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
        
        // For foreground messages, we'll just log them and NOT show a notification
        // The service worker will handle showing notifications to prevent duplicates
        // In the future, you could show an in-app toast/banner here instead
        
        if (payload.notification) {
          console.log('[FCMInitializer] Foreground notification received:', {
            title: payload.notification.title,
            body: payload.notification.body,
            data: payload.data
          });
          
          // TODO: Show in-app notification banner/toast instead of system notification
          // This prevents duplicate notifications when app is in foreground
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
