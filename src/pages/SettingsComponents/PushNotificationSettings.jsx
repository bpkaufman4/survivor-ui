import React, { useState, useEffect } from 'react';
import { 
  isNotificationSupported, 
  initializeFCM,
  requestNotificationPermission,
  sendTokenToServer
} from '../../firebase';
import apiUrl from '../../apiUrls';

const PushNotificationSettings = () => {
  const [notificationStatus, setNotificationStatus] = useState(() => {
    if (!isNotificationSupported()) return 'not-supported';
    return Notification.permission;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const [swLog, setSwLog] = useState([]);

  const addDebugInfo = (message) => {
    console.log('[PushNotifications]', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Function to get service worker notification log
  const fetchServiceWorkerLog = async () => {
    try {
      addDebugInfo('Attempting to fetch service worker log...');
      
      if (!('serviceWorker' in navigator)) {
        addDebugInfo('❌ Service Worker not supported');
        return;
      }

      // Get the registration
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        addDebugInfo('❌ Service Worker not registered');
        return;
      }

      addDebugInfo('✅ Service Worker registration found');

      const serviceWorker = registration.active;
      if (!serviceWorker) {
        addDebugInfo('❌ No active service worker');
        return;
      }

      addDebugInfo('✅ Active service worker found, requesting log...');

      // Create a message channel for communication
      const messageChannel = new MessageChannel();
      
      // Set up response handler
      const responsePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Service worker response timeout'));
        }, 5000);

        messageChannel.port1.onmessage = function(event) {
          clearTimeout(timeout);
          addDebugInfo('✅ Received response from service worker');
          
          if (event.data && event.data.type === 'notification-log') {
            resolve(event.data.log || []);
          } else {
            reject(new Error('Invalid response from service worker'));
          }
        };
      });
      
      // Send message to service worker
      serviceWorker.postMessage({
        type: 'get-notification-log'
      }, [messageChannel.port2]);

      // Wait for response
      const log = await responsePromise;
      addDebugInfo(`✅ Received ${log.length} log entries`);
      setSwLog(log);
      
    } catch (error) {
      addDebugInfo(`❌ Error fetching service worker log: ${error.message}`);
      console.error('Error fetching service worker log:', error);
    }
  };

  useEffect(() => {
    // Check if we're in a PWA
    const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    addDebugInfo(`Environment: ${isPWA ? 'PWA' : 'Browser'}`);
    addDebugInfo(`Platform: ${navigator.platform}`);
    addDebugInfo(`User Agent: ${navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Other'}`);
    addDebugInfo(`Notification support: ${isNotificationSupported()}`);
    addDebugInfo(`Current permission: ${Notification.permission}`);
    
    // Fetch service worker log on mount
    fetchServiceWorkerLog();
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    setDebugInfo([]); // Clear previous debug info
    
    try {
      addDebugInfo('Starting permission request...');
      
      // Check if notifications are supported
      if (!isNotificationSupported()) {
        addDebugInfo('❌ Notifications not supported');
        setNotificationStatus('not-supported');
        return;
      }

      addDebugInfo('✅ Notifications supported');
      
      // Request permission
      addDebugInfo('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      addDebugInfo(`Permission result: ${permission}`);
      
      if (permission !== 'granted') {
        addDebugInfo('❌ Permission denied');
        setNotificationStatus('denied');
        return;
      }

      addDebugInfo('✅ Permission granted, getting FCM token...');
      
      // Get FCM token
      const token = await requestNotificationPermission();
      addDebugInfo(`FCM Token received: ${token ? 'Yes' : 'No'}`);
      
      if (token) {
        addDebugInfo('Sending token to server...');
        const success = await sendTokenToServer(token);
        addDebugInfo(`Server response: ${success ? 'Success' : 'Failed'}`);
        
        if (success) {
          setNotificationStatus('granted');
          addDebugInfo('✅ Push notifications enabled successfully!');
        } else {
          addDebugInfo('❌ Failed to save token to server');
        }
      } else {
        addDebugInfo('❌ Failed to get FCM token');
        setNotificationStatus('denied');
      }
    } catch (error) {
      addDebugInfo(`❌ Error: ${error.message}`);
      console.error('Failed to request permission:', error);
      setNotificationStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotificationStatus = () => {
    switch (notificationStatus) {
      case 'not-supported':
        return (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Push notifications are not supported in this browser.
          </div>
        );
      
      case 'default':
        return (
          <div>
            <p className="text-muted mb-3 small">
              Enable push notifications to get real-time updates about drafts, surveys, and admin notes.
            </p>
            <div className="d-grid">
              <button 
                className="btn btn-primary" 
                onClick={handleRequestPermission}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enabling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bell me-2"></i>
                    Enable Push Notifications
                  </>
                )}
              </button>
            </div>
          </div>
        );
      
      case 'granted':
        return (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            Push notifications are enabled! You'll receive real-time updates.
          </div>
        );
      
      case 'denied':
        return (
          <div>
            <div className="alert alert-danger">
              <i className="fas fa-times-circle me-2"></i>
              Push notifications are blocked. To enable them, please allow notifications in your browser settings and refresh the page.
            </div>
            {debugInfo.length > 0 && (
              <div className="mt-3">
                <h6>Debug Information:</h6>
                <div className="alert alert-secondary">
                  <small>
                    {debugInfo.map((info, index) => (
                      <div key={index}>{info}</div>
                    ))}
                  </small>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div>
            {debugInfo.length > 0 && (
              <div className="alert alert-info">
                <h6>Debug Information:</h6>
                <small>
                  {debugInfo.map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
                </small>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-bell me-2"></i>
          Push Notifications
        </h5>
      </div>
      <div className="card-body">
        {renderNotificationStatus()}
        
        {notificationStatus === 'granted' && (
          <div className="mt-3">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              You can manage notification types in the Email Preferences section above.
            </small>
            
            {/* Service Worker Debug Log */}
            <div className="mt-3">
              <div className="d-flex gap-2 flex-wrap">
                <button 
                  className="btn btn-outline-secondary btn-sm" 
                  onClick={fetchServiceWorkerLog}
                >
                  <i className="fas fa-bug me-1"></i>
                  Check Notification Log
                </button>
                
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('🔍 Checking for duplicate notifications...');
                      await fetchServiceWorkerLog();
                      
                      // Filter for duplicate-related entries
                      const duplicateEntries = swLog.filter(entry => 
                        entry.action === 'DUPLICATE_DETECTED_SKIPPED' ||
                        entry.action === 'SHOWING_NOTIFICATION' ||
                        entry.action === 'RECEIVED_BACKGROUND_MESSAGE'
                      );
                      
                      addDebugInfo(`Found ${duplicateEntries.length} notification-related entries`);
                      
                      const receivedCount = duplicateEntries.filter(e => e.action === 'RECEIVED_BACKGROUND_MESSAGE').length;
                      const shownCount = duplicateEntries.filter(e => e.action === 'SHOWING_NOTIFICATION').length;
                      const duplicateCount = duplicateEntries.filter(e => e.action === 'DUPLICATE_DETECTED_SKIPPED').length;
                      
                      addDebugInfo(`📥 Received: ${receivedCount}, ✅ Shown: ${shownCount}, 🚫 Duplicates Blocked: ${duplicateCount}`);
                      
                      if (shownCount > 1 && duplicateCount === 0) {
                        addDebugInfo('⚠️  Multiple notifications shown with no duplicates blocked - deduplication may not be working');
                      } else if (duplicateCount > 0) {
                        addDebugInfo('✅ Deduplication is working - some notifications were blocked');
                      }
                    } catch (error) {
                      addDebugInfo(`❌ Error checking duplicates: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-search me-1"></i>
                  Check for Duplicates
                </button>
                
                <button 
                  className="btn btn-outline-info btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('🔍 Checking foreground notification log...');
                      
                      const foregroundLog = JSON.parse(localStorage.getItem('foregroundNotifications') || '[]');
                      addDebugInfo(`Found ${foregroundLog.length} foreground notification entries`);
                      
                      if (foregroundLog.length > 0) {
                        addDebugInfo('📱 Recent foreground notifications:');
                        foregroundLog.slice(0, 5).forEach((entry, index) => {
                          const time = new Date(entry.timestamp).toLocaleTimeString();
                          const visibility = entry.isPageVisible ? 'Visible' : 'Hidden';
                          const action = entry.action === 'BACKGROUND_VIA_FOREGROUND_HANDLER' ? 'Background' : 'Foreground';
                          addDebugInfo(`  ${index + 1}. ${time}: ${entry.title} (${action}, Page: ${visibility}, Server ID: ${entry.serverNotificationId})`);
                        });
                        
                        // Analyze visibility patterns
                        const visibleCount = foregroundLog.filter(e => e.isPageVisible).length;
                        const hiddenCount = foregroundLog.filter(e => !e.isPageVisible).length;
                        
                        addDebugInfo(`📊 Notification Summary:`);
                        addDebugInfo(`  �️  Page Visible (Foreground): ${visibleCount}`);
                        addDebugInfo(`  🙈 Page Hidden (Background): ${hiddenCount}`);
                        addDebugInfo(`  🔥 Total Foreground Handler: ${foregroundLog.length}`);
                        
                        // Compare with service worker log
                        await fetchServiceWorkerLog();
                        const backgroundCount = swLog.filter(e => e.action === 'RECEIVED_BACKGROUND_MESSAGE').length;
                        addDebugInfo(`  🔔 Service Worker Background: ${backgroundCount}`);
                        
                        if (hiddenCount > 0 && backgroundCount === 0) {
                          addDebugInfo('✅ iOS Workaround: Background notifications routed through foreground handler');
                          addDebugInfo('This is normal for iOS - no duplicates should occur now');
                        } else if (hiddenCount > 0 && backgroundCount > 0) {
                          addDebugInfo('⚠️  Both foreground AND service worker handling notifications!');
                          addDebugInfo('This could cause duplicates');
                        } else if (visibleCount > 0 && backgroundCount === 0) {
                          addDebugInfo('ℹ️  Only true foreground notifications detected');
                        }
                      } else {
                        addDebugInfo('No foreground notifications found');
                      }
                    } catch (error) {
                      addDebugInfo(`❌ Error checking foreground log: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-fire me-1"></i>
                  Check Foreground Log
                </button>
                
                <button 
                  className="btn btn-outline-info btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('🔍 Checking service worker and FCM status...');
                      
                      if (!('serviceWorker' in navigator)) {
                        addDebugInfo('❌ Service Worker not supported');
                        return;
                      }
                      
                      // Check current registration
                      const registration = await navigator.serviceWorker.getRegistration();
                      if (registration) {
                        addDebugInfo(`✅ SW Registration found: ${registration.scope}`);
                        addDebugInfo(`SW State: ${registration.active?.state || 'none'}`);
                        addDebugInfo(`SW Script URL: ${registration.active?.scriptURL || 'none'}`);
                        
                        // Check if it's the right service worker
                        if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
                          addDebugInfo('✅ Firebase messaging service worker is active');
                        } else {
                          addDebugInfo('⚠️  Different service worker is active');
                        }
                        
                        // Check for waiting or installing workers
                        if (registration.waiting) {
                          addDebugInfo('⚠️  Service worker update waiting');
                        }
                        if (registration.installing) {
                          addDebugInfo('⚠️  Service worker installing');
                        }
                      } else {
                        addDebugInfo('❌ No service worker registration found');
                      }
                      
                      // Try to register the service worker if missing
                      if (!registration) {
                        addDebugInfo('Attempting to register firebase-messaging-sw.js...');
                        try {
                          const newReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                          addDebugInfo(`✅ Service worker registered: ${newReg.scope}`);
                        } catch (regError) {
                          addDebugInfo(`❌ Failed to register: ${regError.message}`);
                        }
                      }
                      
                    } catch (error) {
                      addDebugInfo(`❌ SW check error: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-cog me-1"></i>
                  Check SW & FCM Status
                </button>
                
                <button 
                  className="btn btn-outline-warning btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('🔄 Force re-registering service worker...');
                      
                      // Unregister existing service worker first
                      const registration = await navigator.serviceWorker.getRegistration();
                      if (registration) {
                        addDebugInfo('Unregistering existing service worker...');
                        await registration.unregister();
                        addDebugInfo('✅ Unregistered existing service worker');
                        
                        // Wait a moment
                        await new Promise(resolve => setTimeout(resolve, 1000));
                      }
                      
                      // Register fresh service worker
                      addDebugInfo('Registering fresh service worker...');
                      const newRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                      addDebugInfo(`✅ Fresh service worker registered: ${newRegistration.scope}`);
                      
                      // Wait for it to become active
                      if (newRegistration.installing) {
                        addDebugInfo('Waiting for service worker to activate...');
                        await new Promise(resolve => {
                          newRegistration.installing.addEventListener('statechange', () => {
                            if (newRegistration.installing.state === 'activated') {
                              resolve();
                            }
                          });
                        });
                      }
                      
                      addDebugInfo('✅ Service worker refresh complete - try sending another test notification');
                      
                    } catch (error) {
                      addDebugInfo(`❌ SW refresh error: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-sync me-1"></i>
                  Refresh Service Worker
                </button>
                
                <button 
                  className="btn btn-outline-warning btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('🧪 Sending test notification to yourself...');
                      
                      // Add iOS-specific debugging
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                      const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
                      
                      if (isIOS) {
                        addDebugInfo(`📱 iOS device detected (PWA: ${isPWA})`);
                        addDebugInfo(`Permission status: ${Notification.permission}`);
                        
                        // Check service worker registration
                        if ('serviceWorker' in navigator) {
                          try {
                            const registration = await navigator.serviceWorker.getRegistration();
                            if (registration) {
                              addDebugInfo(`✅ Service worker: ${registration.active?.state || 'none'}`);
                            } else {
                              addDebugInfo('❌ No service worker registration found');
                            }
                          } catch (swError) {
                            addDebugInfo(`❌ SW check error: ${swError.message}`);
                          }
                        }
                      }
                      
                      const response = await fetch(`${apiUrl}user/test-push`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'authorization': localStorage.getItem('jwt')
                        },
                        body: JSON.stringify({
                          title: '🧪 Test Notification',
                          body: `Test sent at ${new Date().toLocaleTimeString()} from ${isIOS ? 'iOS' : 'Desktop'}`,
                          type: 'debug'
                        })
                      });
                      
                      const result = await response.json();
                      addDebugInfo(`Response status: ${response.status}`);
                      addDebugInfo(`Response: ${JSON.stringify(result)}`);
                      
                      if (response.ok && result.status === 'success') {
                        addDebugInfo('✅ Test notification sent successfully');
                        addDebugInfo(`Devices notified: ${result.devicesNotified || 0}`);
                        
                        if (isIOS) {
                          addDebugInfo('📱 iOS: If no notification appeared:');
                          addDebugInfo('  • Check Settings > Notifications > Safari');
                          addDebugInfo('  • Disable Do Not Disturb');
                          addDebugInfo('  • Pull down notification center');
                          addDebugInfo('  • Try the "Check Notification Log" button');
                        }
                      } else {
                        addDebugInfo(`❌ Failed to send test notification: ${result.message}`);
                      }
                    } catch (error) {
                      addDebugInfo(`❌ Test notification error: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-vial me-1"></i>
                  Send Test Notification
                </button>
                
                <button 
                  className="btn btn-outline-primary btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('Fetching your FCM token info...');
                      
                      // Get current user ID from JWT
                      const jwt = localStorage.getItem('jwt');
                      if (!jwt) {
                        addDebugInfo('❌ No JWT token found');
                        return;
                      }
                      
                      // Decode JWT to get user ID (simple decode, not verification)
                      const payload = JSON.parse(atob(jwt.split('.')[1]));
                      const userId = payload.id;
                      addDebugInfo(`Using user ID: ${userId}`);
                      
                      const response = await fetch(`${apiUrl}user/admin-fcm-debug?userId=${userId}`, {
                        method: 'GET',
                        headers: {
                          'authorization': jwt
                        }
                      });
                      
                      const result = await response.json();
                      addDebugInfo(`FCM Debug Response: ${response.status}`);
                      
                      if (response.ok && result.status === 'success') {
                        const tokens = result.fcmTokens || [];
                        addDebugInfo(`✅ Found ${tokens.length} FCM tokens for your account:`);
                        
                        tokens.forEach((token, index) => {
                          const device = token.deviceInfo || {};
                          addDebugInfo(`Token ${index + 1}: ${token.fcmToken.substring(0, 20)}... (${device.platform || 'Unknown'}, iOS: ${device.isIOS || false}, PWA: ${device.isPWA || false})`);
                        });
                        
                        // Check if current device matches any token
                        const currentPlatform = navigator.platform;
                        const currentIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                        const currentIsPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
                        const currentUserAgent = navigator.userAgent;
                        
                        addDebugInfo(`Current device:`);
                        addDebugInfo(`  Platform: ${currentPlatform}`);
                        addDebugInfo(`  User Agent: ${currentUserAgent.substring(0, 100)}...`);
                        addDebugInfo(`  iOS: ${currentIsIOS}`);
                        addDebugInfo(`  PWA: ${currentIsPWA}`);
                        
                        // More flexible matching - prioritize iOS detection and user agent similarity
                        const matchingToken = tokens.find(t => {
                          const d = t.deviceInfo || {};
                          
                          // For iOS devices, match based on iOS flag and user agent similarity
                          if (currentIsIOS && d.isIOS) {
                            // Check if user agents contain similar iOS version info
                            const currentIOSMatch = currentUserAgent.match(/OS (\d+)_(\d+)/);
                            const storedIOSMatch = (d.userAgent || '').match(/OS (\d+)_(\d+)/);
                            
                            if (currentIOSMatch && storedIOSMatch) {
                              // Same iOS major version is good enough
                              return currentIOSMatch[1] === storedIOSMatch[1];
                            }
                            
                            // Fallback: if both are iOS and PWA status matches
                            return d.isPWA === currentIsPWA;
                          }
                          
                          // For non-iOS devices, use the original strict matching
                          return d.platform === currentPlatform && d.isIOS === currentIsIOS && d.isPWA === currentIsPWA;
                        });
                        
                        if (matchingToken) {
                          addDebugInfo(`✅ Current device matches Token ID: ${matchingToken.id}`);
                          const d = matchingToken.deviceInfo || {};
                          addDebugInfo(`  Matched token platform: ${d.platform}, iOS: ${d.isIOS}, PWA: ${d.isPWA}`);
                        } else {
                          addDebugInfo(`⚠️  Current device doesn't match any registered tokens`);
                          addDebugInfo(`All registered tokens:`);
                          tokens.forEach((token, index) => {
                            const d = token.deviceInfo || {};
                            addDebugInfo(`  Token ${index + 1}: Platform=${d.platform}, iOS=${d.isIOS}, PWA=${d.isPWA}, UserAgent=${(d.userAgent || '').substring(0, 60)}...`);
                          });
                        }
                      } else {
                        addDebugInfo(`❌ Failed to fetch FCM info: ${result.message}`);
                      }
                    } catch (error) {
                      addDebugInfo(`❌ FCM debug error: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-mobile-alt me-1"></i>
                  Check My FCM Tokens
                </button>
              </div>
              
              {(swLog.length > 0 || debugInfo.some(info => info.includes('service worker'))) && (
                <div className="mt-2">
                  {swLog.length > 0 && (
                    <details open>
                      <summary className="text-primary" style={{cursor: 'pointer'}}>
                        <small>🔍 Service Worker Log ({swLog.length} entries) - Check for Duplicates</small>
                      </summary>
                      <div className="alert alert-info mt-2" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        <small>
                          {swLog.map((entry, index) => {
                            const isDuplicate = entry.action === 'DUPLICATE_DETECTED_SKIPPED';
                            const isShowing = entry.action === 'SHOWING_NOTIFICATION';
                            const isReceived = entry.action === 'RECEIVED_BACKGROUND_MESSAGE';
                            
                            return (
                              <div key={index} className={`mb-2 border-bottom pb-1 ${isDuplicate ? 'bg-warning' : isShowing ? 'bg-success' : isReceived ? 'bg-info' : ''}`}>
                                <strong>{new Date(entry.timestamp).toLocaleTimeString()}</strong> - 
                                <span className={isDuplicate ? 'text-dark' : isShowing ? 'text-light' : isReceived ? 'text-light' : ''}> {entry.action}</span>
                                {isDuplicate && <span className="text-danger"> 🚫 DUPLICATE</span>}
                                {isShowing && <span className="text-light"> ✅ SHOWN</span>}
                                {isReceived && <span className="text-light"> 📥 RECEIVED</span>}
                                <br />
                                <code className={`small ${isDuplicate ? 'text-dark' : isShowing ? 'text-light' : isReceived ? 'text-light' : 'text-muted'}`}>
                                  {typeof entry.data === 'object' ? JSON.stringify(entry.data, null, 2) : entry.data}
                                </code>
                              </div>
                            );
                          })}
                        </small>
                      </div>
                    </details>
                  )}
                  
                  {swLog.length === 0 && debugInfo.some(info => info.includes('service worker')) && (
                    <div className="alert alert-warning mt-2">
                      <small>
                        No service worker log entries found. Check the debug info below for connection issues.
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {debugInfo.length > 0 && (
              <div className="mt-2">
                <details>
                  <summary className="text-primary" style={{cursor: 'pointer'}}>
                    <small>Show Debug Info</small>
                  </summary>
                  <div className="alert alert-secondary mt-2">
                    <small>
                      {debugInfo.map((info, index) => (
                        <div key={index}>{info}</div>
                      ))}
                    </small>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationSettings;
