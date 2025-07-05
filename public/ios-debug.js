// iOS Push Notification Debug Script
// Run this in the browser console on iOS to debug notification issues

window.debugIOSNotifications = async function() {
  console.log('🔍 Starting iOS Push Notification Debug...');
  
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isPWA: window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
    notificationPermission: Notification.permission,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    pushManagerSupported: 'PushManager' in window
  };
  
  console.log('📱 Device Info:', results);
  
  // Check service worker registration
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        results.serviceWorker = {
          scope: registration.scope,
          state: registration.active?.state || 'none',
          updatefound: registration.updatefound,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
          active: !!registration.active
        };
        console.log('✅ Service Worker:', results.serviceWorker);
        
        // Try to get notification log from service worker
        if (registration.active) {
          console.log('📋 Requesting notification log from service worker...');
          
          const messageChannel = new MessageChannel();
          const logPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Service worker response timeout'));
            }, 5000);

            messageChannel.port1.onmessage = function(event) {
              clearTimeout(timeout);
              if (event.data && event.data.type === 'notification-log') {
                resolve(event.data.log || []);
              } else {
                reject(new Error('Invalid response from service worker'));
              }
            };
          });
          
          registration.active.postMessage({
            type: 'get-notification-log'
          }, [messageChannel.port2]);

          try {
            const notificationLog = await logPromise;
            results.notificationLog = notificationLog;
            console.log('📋 Recent Notifications:', notificationLog);
          } catch (error) {
            console.log('❌ Could not get notification log:', error.message);
            results.notificationLogError = error.message;
          }
        }
      } else {
        results.serviceWorker = null;
        console.log('❌ No service worker registration found');
      }
    } catch (error) {
      results.serviceWorkerError = error.message;
      console.log('❌ Service worker check failed:', error.message);
    }
  }
  
  // Check notification permission details
  if (results.notificationPermission === 'granted') {
    console.log('✅ Notification permission granted');
    
    // Try to show a test notification directly
    try {
      const testNotification = new Notification('iOS Debug Test', {
        body: 'Direct notification test - ' + new Date().toLocaleTimeString(),
        icon: '/android/android-launchericon-192-192.png',
        tag: 'ios-debug-test',
        requireInteraction: false
      });
      
      testNotification.onclick = function() {
        console.log('✅ Direct notification clicked');
        testNotification.close();
      };
      
      testNotification.onshow = function() {
        console.log('✅ Direct notification shown');
      };
      
      testNotification.onerror = function(error) {
        console.log('❌ Direct notification error:', error);
      };
      
      results.directNotificationTest = 'attempted';
      console.log('📧 Direct notification attempted');
    } catch (error) {
      results.directNotificationError = error.message;
      console.log('❌ Direct notification failed:', error.message);
    }
  } else {
    console.log('❌ Notification permission not granted:', results.notificationPermission);
  }
  
  // Check PWA manifest
  const manifestLinks = document.querySelectorAll('link[rel="manifest"]');
  if (manifestLinks.length > 0) {
    results.manifestFound = true;
    results.manifestHref = manifestLinks[0].href;
    console.log('✅ PWA manifest found:', results.manifestHref);
  } else {
    results.manifestFound = false;
    console.log('❌ No PWA manifest found');
  }
  
  // Check iOS-specific settings
  const metaTags = Array.from(document.querySelectorAll('meta')).map(meta => ({
    name: meta.name || meta.property,
    content: meta.content
  })).filter(meta => meta.name && (
    meta.name.includes('apple') || 
    meta.name.includes('mobile') || 
    meta.name.includes('viewport')
  ));
  
  results.iOSMetaTags = metaTags;
  console.log('📱 iOS-related meta tags:', metaTags);
  
  console.log('🔍 Debug complete. Full results:', results);
  return results;
};

console.log('📱 iOS Debug script loaded. Run: debugIOSNotifications()');
