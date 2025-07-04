import { useEffect, useState } from "react";
import Main from "../components/Main";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import Swal from "sweetalert2";
import { useUser } from "../contexts/UserContext";

export default function Settings() {
  const { user, refreshUser, needsEmailVerification } = useUser();

  const [error, setError] = useState(false);

  function NameEdit({ user }) {
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Check if there are unsaved changes
    const checkChanges = (newFirstName, newLastName) => {
      const changes = newFirstName !== user.firstName || newLastName !== user.lastName;
      setHasChanges(changes);
    };

    const handleFirstNameChange = (e) => {
      const value = e.target.value;
      setFirstName(value);
      checkChanges(value, lastName);
    };

    const handleLastNameChange = (e) => {
      const value = e.target.value;
      setLastName(value);
      checkChanges(firstName, value);
    };

    function saveName() {
      if (!firstName.trim() || !lastName.trim()) {
        Swal.fire({
          text: 'First name and last name are required',
          icon: 'error',
          toast: true,
          showConfirmButton: false,
          timer: 3000,
          position: 'top'
        });
        return;
      }

      const body = JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() });
      fetch(`${apiUrl}user/me`, {
        method: 'PATCH',
        body,
        headers: {
          authorization: localStorage.getItem('jwt'),
          "Content-type": "application/json"
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          Swal.fire({
            text: 'Name updated successfully',
            icon: 'success', 
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            position: 'top'
          });
          refreshUser(); // Refresh user data
          setIsEditing(false);
          setHasChanges(false);
        } else {
          console.log(reply);
          Swal.fire({
            text: 'Something went wrong',
            icon: 'error',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            position: 'top'
          })
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
        })
      })
    }

    function cancelEdit() {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setIsEditing(false);
      setHasChanges(false);
    }

    return (
      <div className="card mb-3">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <strong>👤 Personal Information</strong>
            {!isEditing && (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="btn btn-outline-primary btn-sm"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {!isEditing ? (
            <div>
              <div className="mb-2">
                <small className="text-muted">Full Name</small>
                <div className="fw-semibold">{user.firstName} {user.lastName}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  id="firstName" 
                  className="form-control" 
                  value={firstName} 
                  onChange={handleFirstNameChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  id="lastName" 
                  className="form-control" 
                  value={lastName} 
                  onChange={handleLastNameChange}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={saveName} 
                  className="btn btn-primary"
                  disabled={!hasChanges || !firstName.trim() || !lastName.trim()}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  function EmailVerification({ user }) {
    const [email, setEmail] = useState(user.email || '');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    function handleEmailUpdate() {
      if (!email) {
        Swal.fire({
          text: 'Please enter an email address',
          icon: 'error',
          toast: true,
          showCancelButton: false,
          showConfirmButton: false,
          timer: 3000,
          position: 'top'
        });
        return;
      }

      fetch(`${apiUrl}user/update-email`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          authorization: localStorage.getItem('jwt'),
          "Content-type": "application/json"
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setPendingEmail(email);
          setShowVerificationInput(true);
          Swal.fire({
            text: 'Verification code sent to your email',
            icon: 'success', 
            toast: true,
            showConfirmButton: false,
            timer: 3000,
            position: 'top'
          });
        } else {
          Swal.fire({
            text: reply.message || 'Something went wrong',
            icon: 'error',
            toast: true,
            showConfirmButton: false,
            timer: 3000,
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
          timer: 3000,
          position: 'top'
        });
      });
    }

    function handleVerification() {
      if (!verificationCode || verificationCode.length !== 6) {
        Swal.fire({
          text: 'Please enter a valid 6-digit verification code',
          icon: 'error',
          toast: true,
          showCancelButton: false,
          showConfirmButton: false,
          timer: 3000,
          position: 'top'
        });
        return;
      }

      fetch(`${apiUrl}user/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ 
          verificationCode: parseInt(verificationCode), 
          userId: user.userId 
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          Swal.fire({
            title: 'Email Verified!',
            text: 'Your email has been successfully verified.',
            icon: 'success',
            showCancelButton: false,
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            refreshUser(); // Refresh user data to update verification status
            setShowVerificationInput(false);
            setVerificationCode('');
          });
        } else {
          Swal.fire({
            text: reply.message || 'Verification failed',
            icon: 'error',
            toast: true,
            showCancelButton: false,
            showConfirmButton: false,
            timer: 3000,
            position: 'top'
          });
        }
      })
      .catch(err => {
        console.log(err);
        Swal.fire({
          text: 'Something went wrong',
          icon: 'error',
          toast: true,
          showCancelButton: false,
          showConfirmButton: false,
          timer: 3000,
          position: 'top'
        });
      });
    }

    function handleVerificationCodeChange(e) {
      const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
      if (value.length <= 6) {
        setVerificationCode(value);
      }
    }

    if (user.email && user.emailVerified) {
      return (
        <div className="alert alert-success" role="alert">
          <div className="d-flex align-items-center">
            <span className="me-2">✅</span>
            <div>
              <strong>Email Verified</strong>
              <div className="small">{user.email}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card border-warning mb-3">
        <div className="card-header bg-warning text-dark">
          <strong>⚠️ Email Verification Required</strong>
        </div>
        <div className="card-body">
          {!showVerificationInput ? (
            <>
              <p className="card-text mb-3">
                {user.email ? 
                  `Please verify your email address: ${user.email}` : 
                  'Please add and verify your email address to secure your account.'
                }
              </p>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
              <button 
                type="button" 
                onClick={handleEmailUpdate} 
                className="btn btn-warning w-100"
              >
                {user.email ? 'Send Verification Code' : 'Add Email & Send Verification'}
              </button>
            </>
          ) : (
            <>
              <p className="card-text mb-3">
                We've sent a verification code to <strong>{pendingEmail}</strong>
              </p>
              <div className="mb-3">
                <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                <input 
                  type="text" 
                  className="form-control text-center"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  placeholder="000000"
                  maxLength="6"
                  style={{ letterSpacing: '0.3em', fontSize: '1.2rem' }}
                />
              </div>
              <div className="d-grid gap-2">
                <button 
                  type="button" 
                  onClick={handleVerification} 
                  className="btn btn-success"
                  disabled={verificationCode.length !== 6}
                >
                  Verify Email
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowVerificationInput(false)} 
                  className="btn btn-outline-secondary"
                >
                  Change Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  function EmailPreferences({ user }) {
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

  function logOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('homeTarget');
    window.location.assign('login');
  }
  return (
    <Main page={'settings'} additionalClasses={"h-100"}>
      {(() => {

        if (!user) return <WaterLoader></WaterLoader>;
        if (error) return <p>Something went wrong</p>;

        return (<div className="h-100 d-flex flex-column justify-content-between">
          <div>
            <NameEdit user={user}></NameEdit>
            <EmailPreferences user={user}></EmailPreferences>
            {needsEmailVerification && <EmailVerification user={user}></EmailVerification>}
          </div>
          <button className="btn btn-primary w-100 sticky-bottom" onClick={logOut}>Logout</button>
        </div>)

      })()}
    </Main>
  )
}