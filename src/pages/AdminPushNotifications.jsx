import { useState, useEffect } from 'react';
import AdminMain from '../components/AdminMain';
import apiUrl from '../apiUrls';

function AdminPushNotifications() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    url: '/'
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [debugUserId, setDebugUserId] = useState('');
  const [debugLoading, setDebugLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}user/admin`, {
        headers: {
          'Authorization': localStorage.getItem('jwt')
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setUsers(data.users);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.userId));
  };

  const handleSendNotification = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!notification.title.trim() || !notification.body.trim()) {
      setError('Please provide both title and body for the notification');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${apiUrl}user/admin-test-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwt')
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          notification: {
            title: notification.title.trim(),
            body: notification.body.trim()
          },
          data: {
            url: notification.url.trim() || '/'
          }
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setResults(data);
        // Clear form after successful send
        setNotification({ title: '', body: '', url: '/' });
        setSelectedUsers([]);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to send notification');
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugUser = async () => {
    if (!debugUserId) return;
    
    setDebugLoading(true);
    setDebugInfo(null);
    
    try {
      const response = await fetch(`${apiUrl}user/admin-fcm-debug?userId=${debugUserId}`, {
        headers: {
          'Authorization': localStorage.getItem('jwt')
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setDebugInfo(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch debug info');
      console.error('Error fetching debug info:', error);
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <AdminMain page="admin-push-notifications">
      <div className="container-fluid p-4">
        <h1 className="mb-4">Push Notification Testing</h1>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {results && (
          <div className={`alert ${results.status === 'success' ? 'alert-success' : results.status === 'partial_fail' ? 'alert-warning' : 'alert-danger'}`} role="alert">
            <h5>
              {results.status === 'success' ? '✅ Notification Sent Successfully!' : 
               results.status === 'partial_fail' ? '⚠️ Partial Success' : '❌ Notification Failed'}
            </h5>
            <p>{results.message}</p>
            <div className="mt-2">
              <strong>Summary:</strong>
              <ul className="mb-0">
                <li>Users targeted: {results.summary.usersTargeted}</li>
                {results.summary.usersSuccessful !== undefined && (
                  <>
                    <li>Users successful: {results.summary.usersSuccessful}</li>
                    <li>Users failed: {results.summary.usersFailed}</li>
                  </>
                )}
                <li>Devices reached: {results.summary.totalDevicesReached}</li>
                <li>Devices failed: {results.summary.totalDevicesFailed}</li>
              </ul>
            </div>
            
            {results.results && results.results.length > 0 && (
              <details className="mt-3">
                <summary>View detailed results</summary>
                <div className="table-responsive mt-2">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Devices Reached</th>
                        <th>Devices Failed</th>
                        <th>Status</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((result, index) => (
                        <tr key={index} className={result.success ? '' : 'table-warning'}>
                          <td>{result.userName}</td>
                          <td>{result.email}</td>
                          <td>{result.devicesReached}</td>
                          <td>{result.devicesFailed}</td>
                          <td>
                            {result.success ? (
                              <span className="badge bg-success">Success</span>
                            ) : (
                              <span className="badge bg-danger">Failed</span>
                            )}
                          </td>
                          <td>
                            {result.error ? (
                              <small className="text-danger">{result.error}</small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Select Users</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleSelectAll}
                  >
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="ms-2 text-muted">
                    ({selectedUsers.length} of {users.length} selected)
                  </span>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {users.map(user => (
                    <div key={user.userId} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`user-${user.userId}`}
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => handleUserToggle(user.userId)}
                      />
                      <label className="form-check-label" htmlFor={`user-${user.userId}`}>
                        <div>
                          <strong>{user.name}</strong>
                          {user.isAdmin && <span className="badge bg-warning ms-2">Admin</span>}
                        </div>
                        <small className="text-muted">{user.email}</small>
                        {!user.emailVerified && (
                          <small className="text-danger ms-2">(Unverified)</small>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Notification Content</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={notification.title}
                    onChange={(e) => setNotification(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="Notification title"
                    maxLength={100}
                  />
                  <div className="form-text">
                    {notification.title.length}/100 characters
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="body" className="form-label">Body *</label>
                  <textarea
                    className="form-control"
                    id="body"
                    rows="3"
                    value={notification.body}
                    onChange={(e) => setNotification(prev => ({
                      ...prev,
                      body: e.target.value
                    }))}
                    placeholder="Notification message"
                    maxLength={300}
                  />
                  <div className="form-text">
                    {notification.body.length}/300 characters
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="url" className="form-label">Click URL</label>
                  <input
                    type="text"
                    className="form-control"
                    id="url"
                    value={notification.url}
                    onChange={(e) => setNotification(prev => ({
                      ...prev,
                      url: e.target.value
                    }))}
                    placeholder="Where to navigate when clicked (default: /)"
                  />
                  <div className="form-text">
                    Examples: /, /leagues, /surveys, /league/123
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleSendNotification}
                  disabled={loading || selectedUsers.length === 0 || !notification.title.trim() || !notification.body.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    `Send to ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="card mt-3">
                <div className="card-header">
                  <h6>Preview</h6>
                </div>
                <div className="card-body">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center mb-2">
                      <img 
                        src="/android/android-launchericon-48-48.png" 
                        alt="App icon" 
                        width="24" 
                        height="24"
                        className="me-2"
                      />
                      <strong>{notification.title || 'Notification Title'}</strong>
                    </div>
                    <div className="text-muted">
                      {notification.body || 'Notification body text will appear here...'}
                    </div>
                    {notification.url && (
                      <small className="text-muted d-block mt-1">
                        Click action: {notification.url}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminMain>
  );
}

export default AdminPushNotifications;
