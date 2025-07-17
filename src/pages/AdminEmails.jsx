import React, { useState, useEffect } from 'react';
import apiUrl from '../apiUrls';
import "../assets/admin-common.css";

const AdminEmails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [useHtml, setUseHtml] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}user/admin-users-email`, {
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

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!subject.trim() || (!body.trim() && !htmlBody.trim())) {
      setMessage('Subject and email body are required');
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
        subject: subject.trim(),
        body: useHtml ? htmlBody.trim() : body.trim(),
        isHtml: useHtml,
        priority
      };

      const response = await fetch(`${apiUrl}user/admin-send-email`, {
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

        setMessage(`✅ Email sent successfully to ${targetDescription} - ${result.emailsSent} emails sent (${result.successCount} successful, ${result.failureCount} failed)`);
        setMessageType('success');

        // Clear form
        setSubject('');
        setBody('');
        setHtmlBody('');
      } else {
        setMessage(`❌ Failed to send email: ${result.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Error sending email: ${error.message}`);
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

  const presetEmails = [
    {
      subject: '🎯 New Survey Available - React Survivor',
      body: 'Hello!\n\nA new survivor survey is now open and waiting for your predictions. Don\'t miss out on earning points for accurate guesses!\n\nClick here to participate: [Survey Link]\n\nBest regards,\nThe React Survivor Team',
      priority: 'normal'
    },
    {
      subject: '📝 Draft Starting Soon - React Survivor',
      body: 'Hi there!\n\nYour draft will begin in 15 minutes. Make sure you\'re ready to make your picks!\n\nJoin the draft: [Draft Link]\n\nGood luck!\nThe React Survivor Team',
      priority: 'high'
    },
    {
      subject: '📢 Important Update - React Survivor',
      body: 'Dear React Survivor participants,\n\nWe have an important announcement regarding the league. Please check the admin notes for the latest updates.\n\nView updates: [Notes Link]\n\nThanks for your participation!\nThe React Survivor Admin Team',
      priority: 'high'
    },
    {
      subject: '🏆 Weekly Results - React Survivor',
      body: 'Hello!\n\nThe weekly results are now available. Check out how you performed this week and see the current standings.\n\nView results: [Results Link]\n\nKeep up the great work!\nThe React Survivor Team',
      priority: 'normal'
    }
  ];

  const loadPreset = (preset) => {
    setSubject(preset.subject);
    setBody(preset.body);
    setPriority(preset.priority);
    setUseHtml(false);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                <i className="fas fa-envelope me-2"></i>
                Send Email to Users
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

              <form onSubmit={handleSendEmail}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-users me-1"></i>
                        Recipients
                      </label>
                      <small className="form-text text-muted d-block mb-2">
                        Select who should receive this email
                      </small>

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
                      <label htmlFor="priority" className="form-label">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Priority
                      </label>
                      <select
                        id="priority"
                        className="form-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="useHtml"
                          checked={useHtml}
                          onChange={(e) => setUseHtml(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="useHtml">
                          <i className="fas fa-code me-1"></i>
                          Use HTML formatting
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">
                        <i className="fas fa-heading me-1"></i>
                        Email Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        className="form-control"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        maxLength={100}
                        required
                      />
                      <small className="form-text text-muted">
                        {subject.length}/100 characters
                      </small>
                    </div>

                    <div className="mb-3">
                      <label htmlFor={useHtml ? "htmlBody" : "body"} className="form-label">
                        <i className="fas fa-align-left me-1"></i>
                        Email Body {useHtml && <span className="badge bg-info">HTML</span>}
                      </label>
                      {useHtml ? (
                        <textarea
                          id="htmlBody"
                          className="form-control"
                          rows="8"
                          value={htmlBody}
                          onChange={(e) => setHtmlBody(e.target.value)}
                          placeholder="Enter HTML email content..."
                          required
                          style={{ fontFamily: 'monospace' }}
                        />
                      ) : (
                        <textarea
                          id="body"
                          className="form-control"
                          rows="8"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="Enter email message..."
                          required
                        />
                      )}
                      <small className="form-text text-muted">
                        {useHtml ? htmlBody.length : body.length} characters
                      </small>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading || !subject.trim() || (!body.trim() && !htmlBody.trim()) || (!sendToAll && selectedUsers.length === 0)}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Send Email
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
                    Email Templates
                  </h5>
                  <div className="row">
                    {presetEmails.map((preset, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-title">
                              {preset.subject}
                              <span className={`badge ms-2 ${preset.priority === 'high' ? 'bg-danger' : preset.priority === 'low' ? 'bg-secondary' : 'bg-primary'}`}>
                                {preset.priority}
                              </span>
                            </h6>
                            <p className="card-text small text-muted" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                              {preset.body}
                            </p>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => loadPreset(preset)}
                            >
                              <i className="fas fa-download me-1"></i>
                              Load Template
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
  );
};

export default AdminEmails;