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
                  className="btn btn-outline-info btn-sm" 
                  onClick={async () => {
                    try {
                      const registration = await navigator.serviceWorker.getRegistration();
                      addDebugInfo(`SW Registration: ${registration ? 'Found' : 'Not found'}`);
                      if (registration) {
                        addDebugInfo(`SW State: ${registration.active ? 'Active' : 'Not active'}`);
                        addDebugInfo(`SW Scope: ${registration.scope}`);
                      }
                    } catch (error) {
                      addDebugInfo(`SW Check Error: ${error.message}`);
                    }
                  }}
                >
                  <i className="fas fa-cog me-1"></i>
                  Check SW Status
                </button>
                
                <button 
                  className="btn btn-outline-warning btn-sm" 
                  onClick={async () => {
                    try {
                      addDebugInfo('Sending test notification to yourself...');
                      
                      const response = await fetch(`${apiUrl}user/test-push`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'authorization': localStorage.getItem('jwt')
                        },
                        body: JSON.stringify({
                          title: '🧪 Duplicate Test',
                          body: `Test notification sent at ${new Date().toLocaleTimeString()}`,
                          type: 'debug'
                        })
                      });
                      
                      const result = await response.json();
                      addDebugInfo(`Response status: ${response.status}`);
                      addDebugInfo(`Response: ${JSON.stringify(result)}`);
                      
                      if (response.ok && result.status === 'success') {
                        addDebugInfo('✅ Test notification sent successfully');
                        addDebugInfo('Wait a few seconds, then check the notification log to see if duplicates appear');
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
                      
                      const response = await fetch(`${apiUrl}user/admin-fcm-debug?userId=${localStorage.getItem('userId') || 'current'}`, {
                        method: 'GET',
                        headers: {
                          'authorization': localStorage.getItem('jwt')
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
                        
                        addDebugInfo(`Current device: Platform=${currentPlatform}, iOS=${currentIsIOS}, PWA=${currentIsPWA}`);
                        
                        const matchingToken = tokens.find(t => {
                          const d = t.deviceInfo || {};
                          return d.platform === currentPlatform && d.isIOS === currentIsIOS && d.isPWA === currentIsPWA;
                        });
                        
                        if (matchingToken) {
                          addDebugInfo(`✅ Current device matches Token ID: ${matchingToken.id}`);
                        } else {
                          addDebugInfo(`⚠️  Current device doesn't match any registered tokens - may need to re-register`);
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
                    <details>
                      <summary className="text-primary" style={{cursor: 'pointer'}}>
                        <small>Service Worker Notification Log ({swLog.length} entries)</small>
                      </summary>
                      <div className="alert alert-info mt-2" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <small>
                          {swLog.map((entry, index) => (
                            <div key={index} className="mb-2 border-bottom pb-1">
                              <strong>{new Date(entry.timestamp).toLocaleTimeString()}</strong> - {entry.action}
                              <br />
                              <code className="small text-muted">
                                {JSON.stringify(entry.data, null, 2)}
                              </code>
                            </div>
                          ))}
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
