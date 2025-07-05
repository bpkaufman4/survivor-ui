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
        const isPageVisible = !document.hidden;
        
        // Enhanced logging for foreground messages
        console.log('[FCMInitializer] Foreground notification details:', {
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data,
          serverNotificationId: payload.data?.serverNotificationId,
          isIOS: isIOS,
          isPWA: isPWA,
          isPageVisible: isPageVisible,
          timestamp: Date.now(),
          userAgent: navigator.userAgent.substring(0, 100)
        });
        
        // Store this in localStorage so we can track foreground vs background
        const foregroundLog = JSON.parse(localStorage.getItem('foregroundNotifications') || '[]');
        foregroundLog.unshift({
          timestamp: Date.now(),
          action: isPageVisible ? 'FOREGROUND_MESSAGE_RECEIVED' : 'BACKGROUND_VIA_FOREGROUND_HANDLER',
          title: payload.notification?.title,
          body: payload.notification?.body,
          serverNotificationId: payload.data?.serverNotificationId,
          data: payload.data,
          isIOS: isIOS,
          isPWA: isPWA,
          isPageVisible: isPageVisible
        });
        
        // Keep only last 20 entries
        if (foregroundLog.length > 20) {
          foregroundLog.splice(20);
        }
        
        localStorage.setItem('foregroundNotifications', JSON.stringify(foregroundLog));
        
        if (isIOS) {
          if (isPageVisible) {
            console.log('[FCMInitializer] 📱 iOS foreground message - not showing system notification');
          } else {
            console.log('[FCMInitializer] 📱 iOS background message via foreground handler - notification should be shown');
          }
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
