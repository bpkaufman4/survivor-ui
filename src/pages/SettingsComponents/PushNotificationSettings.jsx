import React, { useState } from 'react';
import { 
  isNotificationSupported, 
  initializeFCM,
  requestNotificationPermission 
} from '../../firebase';

const PushNotificationSettings = () => {
  const [notificationStatus, setNotificationStatus] = useState(() => {
    if (!isNotificationSupported()) return 'not-supported';
    return Notification.permission;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const token = await initializeFCM();
      if (token) {
        setNotificationStatus('granted');
      } else {
        setNotificationStatus('denied');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setNotificationStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setNotificationStatus('granted');
      } else {
        setNotificationStatus('denied');
      }
    } catch (error) {
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
          <div className="alert alert-danger">
            <i className="fas fa-times-circle me-2"></i>
            Push notifications are blocked. To enable them, please allow notifications in your browser settings and refresh the page.
          </div>
        );
      
      default:
        return null;
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationSettings;
