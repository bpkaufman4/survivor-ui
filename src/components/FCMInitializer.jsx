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
    console.log('[FCMInitializer] Setting up foreground message listener...');
    
    const messageListener = onMessageListener();
    
    messageListener
      .then((payload) => {
        console.log('🔥 FOREGROUND message received:', payload);
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        
        // Enhanced logging for foreground messages
        console.log('[FCMInitializer] Foreground notification details:', {
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data,
          serverNotificationId: payload.data?.serverNotificationId,
          isIOS: isIOS,
          isPWA: isPWA,
          timestamp: Date.now(),
          userAgent: navigator.userAgent.substring(0, 100)
        });
        
        // Store this in localStorage so we can track foreground vs background
        const foregroundLog = JSON.parse(localStorage.getItem('foregroundNotifications') || '[]');
        foregroundLog.unshift({
          timestamp: Date.now(),
          action: 'FOREGROUND_MESSAGE_RECEIVED',
          title: payload.notification?.title,
          body: payload.notification?.body,
          serverNotificationId: payload.data?.serverNotificationId,
          data: payload.data,
          isIOS: isIOS,
          isPWA: isPWA
        });
        
        // Keep only last 20 entries
        if (foregroundLog.length > 20) {
          foregroundLog.splice(20);
        }
        
        localStorage.setItem('foregroundNotifications', JSON.stringify(foregroundLog));
        
        // For iOS, we might need to explicitly prevent system notification
        if (isIOS && payload.notification) {
          console.log('[FCMInitializer] 📱 iOS foreground message - system might still show notification');
          
          // TODO: Show in-app notification banner/toast instead of system notification
          // This prevents duplicate notifications when app is in foreground
        }
      })
      .catch((err) => {
        console.error('[FCMInitializer] Failed to listen for messages:', err);
      });

    return () => {
      // The onMessageListener doesn't return an unsubscribe function in current implementation
      console.log('[FCMInitializer] Cleaning up foreground message listener');
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default FCMInitializer;
