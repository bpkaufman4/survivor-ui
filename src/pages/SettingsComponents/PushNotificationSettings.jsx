import React, { useState, useEffect } from 'react';
import { 
  isNotificationSupported, 
  initializeFCM,
  requestNotificationPermission,
  sendTokenToServer
} from '../../firebase';

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
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (registration && registration.active) {
          // Try to communicate with service worker to get log
          const messageChannel = new MessageChannel();
          
          messageChannel.port1.onmessage = function(event) {
            if (event.data && event.data.type === 'notification-log') {
              setSwLog(event.data.log || []);
            }
          };
          
          registration.active.postMessage({
            type: 'get-notification-log'
          }, [messageChannel.port2]);
        }
      }
    } catch (error) {
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
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={fetchServiceWorkerLog}
              >
                <i className="fas fa-bug me-1"></i>
                Check Notification Log
              </button>
              
              {swLog.length > 0 && (
                <div className="mt-2">
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
