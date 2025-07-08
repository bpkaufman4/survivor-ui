import React, { useState } from 'react';
import { 
  isNotificationSupported, 
  requestNotificationPermission
} from '../../firebase';
import apiUrl from '../../apiUrls';
import Swal from 'sweetalert2';
import { useUser } from '../../contexts/UserContext';

const PushNotificationSettings = ({ user }) => {
  const { refreshUser } = useUser();
  const [notificationStatus, setNotificationStatus] = useState(() => {
    if (!isNotificationSupported()) return 'not-supported';
    return Notification.permission;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize push notification preferences with defaults (true for backwards compatibility)
  const [draftNotifications, setDraftNotifications] = useState(user.pushNotificationPreferences?.draftNotifications !== false);
  const [latestUpdates, setLatestUpdates] = useState(user.pushNotificationPreferences?.latestUpdates !== false);
  const [pollReminders, setPollReminders] = useState(user.pushNotificationPreferences?.pollReminders !== false);
  const [isChanged, setIsChanged] = useState(false);

  // Check if any preferences have changed
  const checkForChanges = (draft, updates, polls) => {
    const originalPrefs = user.pushNotificationPreferences || {};
    const changed = 
      draft !== (originalPrefs.draftNotifications !== false) ||
      updates !== (originalPrefs.latestUpdates !== false) ||
      polls !== (originalPrefs.pollReminders !== false);
    setIsChanged(changed);
  };

  const handleDraftChange = (e) => {
    const newValue = e.target.checked;
    setDraftNotifications(newValue);
    checkForChanges(newValue, latestUpdates, pollReminders);
  };

  const handleUpdatesChange = (e) => {
    const newValue = e.target.checked;
    setLatestUpdates(newValue);
    checkForChanges(draftNotifications, newValue, pollReminders);
  };

  const handlePollsChange = (e) => {
    const newValue = e.target.checked;
    setPollReminders(newValue);
    checkForChanges(draftNotifications, latestUpdates, newValue);
  };

  const updatePushNotificationPreferences = () => {
    const pushNotificationPreferences = {
      draftNotifications,
      latestUpdates,
      pollReminders
    };

    fetch(`${apiUrl}user/me`, {
      method: 'PATCH',
      body: JSON.stringify({ pushNotificationPreferences }),
      headers: {
        authorization: localStorage.getItem('jwt'),
        "Content-type": "application/json"
      }
    })
    .then(response => response.json())
    .then(reply => {
      if(reply.status === 'success') {
        Swal.fire({
          text: 'Push notification preferences updated',
          icon: 'success', 
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          position: 'top'
        });
        refreshUser(); // Refresh user data
        setIsChanged(false);
      } else {
        Swal.fire({
          text: 'Something went wrong',
          icon: 'error',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          position: 'top'
        });
      }
    })
    .catch(err => {
      console.log(err);
      Swal.fire({
        text: 'Something went wrong',
        toast: true,
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        position: 'top'
      });
    });
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

  const hasAnyEnabled = draftNotifications || latestUpdates || pollReminders;

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
          <div>
            <div className="alert alert-success mb-3">
              <i className="fas fa-check-circle me-2"></i>
              Push notifications are enabled! You can customize which notifications you receive below.
            </div>
            
            <div className="mb-3">
              <small className="text-muted mb-2 d-block">Choose which types of push notifications you'd like to receive:</small>
              
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="pushDraftNotifications"
                  checked={draftNotifications}
                  onChange={handleDraftChange}
                />
                <label className="form-check-label" htmlFor="pushDraftNotifications">
                  <strong>🏆 Draft Notifications</strong>
                  <div className="small text-muted">Get notified about draft starts, your pick turns, and draft results</div>
                </label>
              </div>

              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="pushLatestUpdates"
                  checked={latestUpdates}
                  onChange={handleUpdatesChange}
                />
                <label className="form-check-label" htmlFor="pushLatestUpdates">
                  <strong>📰 Latest Updates</strong>
                  <div className="small text-muted">Receive league updates, episode recaps, and important announcements</div>
                </label>
              </div>

              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="pushPollReminders"
                  checked={pollReminders}
                  onChange={handlePollsChange}
                />
                <label className="form-check-label" htmlFor="pushPollReminders">
                  <strong>📊 Poll Reminders</strong>
                  <div className="small text-muted">Get reminders when new polls are available and before they close</div>
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <small className="text-muted">
                {hasAnyEnabled ? (
                  <span className="text-success">✅ You'll receive push notifications for the selected categories above</span>
                ) : (
                  <span className="text-warning">⚠️ All push notifications are disabled</span>
                )}
              </small>
            </div>
            
            {isChanged && (
              <div className="d-grid">
                <button 
                  type="button" 
                  onClick={updatePushNotificationPreferences} 
                  className="btn btn-primary btn-sm"
                >
                  Save Preferences
                </button>
              </div>
            )}
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
      </div>
    </div>
  );
};

export default PushNotificationSettings;