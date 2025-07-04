import { useState } from "react";
import apiUrl from "../../apiUrls";
import Swal from "sweetalert2";
import { useUser } from "../../contexts/UserContext";

export default function EmailPreferences({ user }) {
  const { refreshUser } = useUser();
  // Initialize preferences with defaults (true for backwards compatibility)
  const [draftNotifications, setDraftNotifications] = useState(user.emailPreferences?.draftNotifications !== false);
  const [latestUpdates, setLatestUpdates] = useState(user.emailPreferences?.latestUpdates !== false);
  const [pollReminders, setPollReminders] = useState(user.emailPreferences?.pollReminders !== false);
  const [isChanged, setIsChanged] = useState(false);

  // Check if any preferences have changed
  const checkForChanges = (draft, updates, polls) => {
    const originalPrefs = user.emailPreferences || {};
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

  function updateEmailPreferences() {
    const emailPreferences = {
      draftNotifications,
      latestUpdates,
      pollReminders
    };

    fetch(`${apiUrl}user/me`, {
      method: 'PATCH',
      body: JSON.stringify({ emailPreferences }),
      headers: {
        authorization: localStorage.getItem('jwt'),
        "Content-type": "application/json"
      }
    })
    .then(response => response.json())
    .then(reply => {
      if(reply.status === 'success') {
        Swal.fire({
          text: 'Email preferences updated',
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
  }

  const hasAnyEnabled = draftNotifications || latestUpdates || pollReminders;

  return (
    <div className="card mb-3">
      <div className="card-header">
        <strong>📧 Email Preferences</strong>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <small className="text-muted mb-2 d-block">Choose which types of emails you'd like to receive:</small>
          
          <div className="form-check mb-2">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="draftNotifications"
              checked={draftNotifications}
              onChange={handleDraftChange}
            />
            <label className="form-check-label" htmlFor="draftNotifications">
              <strong>🏆 Draft Notifications</strong>
              <div className="small text-muted">Get notified about draft starts, your pick turns, and draft results</div>
            </label>
          </div>

          <div className="form-check mb-2">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="latestUpdates"
              checked={latestUpdates}
              onChange={handleUpdatesChange}
            />
            <label className="form-check-label" htmlFor="latestUpdates">
              <strong>📰 Latest Updates</strong>
              <div className="small text-muted">Receive league updates, episode recaps, and important announcements</div>
            </label>
          </div>

          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="pollReminders"
              checked={pollReminders}
              onChange={handlePollsChange}
            />
            <label className="form-check-label" htmlFor="pollReminders">
              <strong>📊 Poll Reminders</strong>
              <div className="small text-muted">Get reminders when new polls are available and before they close</div>
            </label>
          </div>
        </div>
        
        <div className="mb-3">
          <small className="text-muted">
            {hasAnyEnabled ? (
              <span className="text-success">✅ You'll receive emails for the selected categories above</span>
            ) : (
              <span className="text-warning">⚠️ You'll only receive critical emails (verification, security alerts)</span>
            )}
          </small>
        </div>
        
        {isChanged && (
          <div className="d-grid">
            <button 
              type="button" 
              onClick={updateEmailPreferences} 
              className="btn btn-primary btn-sm"
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
