import React, { useState, useEffect } from 'react';
import AdminMain from '../components/AdminMain';
import apiUrl from '../apiUrls';
import "../assets/admin-common.css";

const AdminPushNotifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('admin_test');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}user/admin`, {
        headers: {
          'authorization': localStorage.getItem('jwt')
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setUsers(result.users || []);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      setMessage('Title and body are required');
      setMessageType('error');
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      setMessage('Please select at least one user or choose "All Users"');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const payload = {
        targetUsers: sendToAll ? 'all' : selectedUsers,
        title: title.trim(),
        body: body.trim(),
        type,
        url: url.trim() || undefined
      };

      const response = await fetch(`${apiUrl}user/admin-test-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem('jwt')
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        const targetDescription = sendToAll 
          ? `all users (${users.length} users)` 
          : `${selectedUsers.length} selected user${selectedUsers.length > 1 ? 's' : ''}`;
        
        setMessage(`✅ Notification sent successfully to ${targetDescription} - ${result.devicesNotified} devices (${result.successCount} successful, ${result.failureCount} failed)`);
        setMessageType('success');
        
        // Clear form
        setTitle('');
        setBody('');
        setUrl('');
      } else {
        setMessage(`❌ Failed to send notification: ${result.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Error sending notification: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.userId));
    }
  };

  const presetNotifications = [
    {
      title: '🎯 New Survey Available',
      body: 'A new survivor survey is now open. Share your predictions!',
      type: 'survey',
      url: '/surveys'
    },
    {
      title: '📝 Draft Starting Soon',
      body: 'Your draft will begin in 15 minutes. Get ready!',
      type: 'draft',
      url: '/draft'
    },
    {
      title: '📢 Admin Announcement',
      body: 'Check out the latest updates from the admin team.',
      type: 'admin_note',
      url: '/notes'
    }
  ];

  const loadPreset = (preset) => {
    setTitle(preset.title);
    setBody(preset.body);
    setType(preset.type);
    setUrl(preset.url);
  };

  return (
    <AdminMain page="Push Notifications">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">
                  <i className="fas fa-bell me-2"></i>
                  Send Push Notification
                </h4>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSendNotification}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="fas fa-users me-1"></i>
                          Target Users
                        </label>
                        
                        <div className="mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="targetType"
                              id="sendToAll"
                              checked={sendToAll}
                              onChange={() => {
                                setSendToAll(true);
                                setSelectedUsers([]);
                              }}
                            />
                            <label className="form-check-label" htmlFor="sendToAll">
                              <strong>All Users</strong> ({users.length} users)
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="targetType"
                              id="sendToSelected"
                              checked={!sendToAll}
                              onChange={() => setSendToAll(false)}
                            />
                            <label className="form-check-label" htmlFor="sendToSelected">
                              <strong>Selected Users</strong> ({selectedUsers.length} selected)
                            </label>
                          </div>
                        </div>

                        {!sendToAll && (
                          <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <div className="mb-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleSelectAll}
                              >
                                {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            {users.map(user => (
                              <div key={user.userId} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`user-${user.userId}`}
                                  checked={selectedUsers.includes(user.userId)}
                                  onChange={() => handleUserSelection(user.userId)}
                                />
                                <label className="form-check-label" htmlFor={`user-${user.userId}`}>
                                  {user.name} ({user.email})
                                </label>
                              </div>
                            ))}
                            {users.length === 0 && (
                              <div className="text-muted small">No users available</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="type" className="form-label">
                          <i className="fas fa-tag me-1"></i>
                          Notification Type
                        </label>
                        <select
                          id="type"
                          className="form-select"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          <option value="admin_test">Admin Test</option>
                          <option value="survey">Survey</option>
                          <option value="draft">Draft</option>
                          <option value="admin_note">Admin Note</option>
                          <option value="league">League</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="url" className="form-label">
                          <i className="fas fa-link me-1"></i>
                          Target URL (Optional)
                        </label>
                        <input
                          type="text"
                          id="url"
                          className="form-control"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="/surveys, /draft, etc."
                        />
                        <small className="form-text text-muted">
                          Where users go when they click the notification
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                          <i className="fas fa-heading me-1"></i>
                          Notification Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          className="form-control"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter notification title..."
                          maxLength={50}
                          required
                        />
                        <small className="form-text text-muted">
                          {title.length}/50 characters
                        </small>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="body" className="form-label">
                          <i className="fas fa-align-left me-1"></i>
                          Notification Body
                        </label>
                        <textarea
                          id="body"
                          className="form-control"
                          rows="3"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="Enter notification message..."
                          maxLength={120}
                          required
                        />
                        <small className="form-text text-muted">
                          {body.length}/120 characters
                        </small>
                      </div>

                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading || !title.trim() || !body.trim() || (!sendToAll && selectedUsers.length === 0)}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>
                              Send Notification
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-12">
                    <h5 className="mb-3">
                      <i className="fas fa-magic me-2"></i>
                      Quick Presets
                    </h5>
                    <div className="row">
                      {presetNotifications.map((preset, index) => (
                        <div key={index} className="col-md-4 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">{preset.title}</h6>
                              <p className="card-text small text-muted">{preset.body}</p>
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => loadPreset(preset)}
                              >
                                <i className="fas fa-download me-1"></i>
                                Load Preset
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminMain>
  );
};

export default AdminPushNotifications;