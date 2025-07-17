import { useState, useEffect } from "react";
import AdminMain from "../components/AdminMain";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import Swal from "sweetalert2";

function AdminJobs() {
  const [jobsStatus, setJobsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchJobsStatus();
  }, []);

  async function fetchJobsStatus() {
    try {
      const response = await fetch(`${apiUrl}jobs/status`, {
        headers: {
          'authorization': localStorage.getItem('jwt')
        }
      });
      
      const reply = await response.json();
      
      if (reply.status === 'success') {
        setJobsStatus(reply.data);
      } else {
        console.log(reply);
        setError(true);
      }
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function triggerJob(jobName) {
    try {
      const response = await fetch(`${apiUrl}jobs/trigger/${jobName}`, {
        method: 'POST',
        headers: {
          'authorization': localStorage.getItem('jwt')
        }
      });
      
      const reply = await response.json();
      
      if (reply.status === 'success') {
        Swal.fire({
          title: 'Success!',
          text: `Job "${jobName}" executed successfully. ${reply.data.message || ''}`,
          icon: 'success',
          timer: 3000
        });
        
        // Refresh status
        fetchJobsStatus();
      } else {
        Swal.fire({
          title: 'Error',
          text: reply.message || 'Failed to trigger job',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error triggering job:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to trigger job',
        icon: 'error'
      });
    }
  }

  async function controlJobs(action) {
    try {
      const response = await fetch(`${apiUrl}jobs/${action}`, {
        method: 'POST',
        headers: {
          'authorization': localStorage.getItem('jwt')
        }
      });
      
      const reply = await response.json();
      
      if (reply.status === 'success') {
        Swal.fire({
          title: 'Success!',
          text: reply.message,
          icon: 'success',
          timer: 2000
        });
        
        // Refresh status
        fetchJobsStatus();
      } else {
        Swal.fire({
          title: 'Error',
          text: reply.message || `Failed to ${action} jobs`,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${action} jobs:`, error);
      Swal.fire({
        title: 'Error',
        text: `Failed to ${action} jobs`,
        icon: 'error'
      });
    }
  }

  const formatSchedule = (schedule) => {
    const scheduleMap = {
      '0 18 * * *': 'Daily at 6:00 PM UTC',
      '*/30 * * * * *': 'Every 30 seconds',
      '0 9 * * *': 'Daily at 9:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '0 0 * * 0': 'Weekly on Sunday at midnight'
    };
    return scheduleMap[schedule] || schedule;
  };

  if (loading) {
    return <WaterLoader />;
  }

  if (error) {
    return <div className="alert alert-danger">Error loading background jobs status</div>;
  }

  return (
    <>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Background Jobs</h2>
          <div>
            <button 
              className="btn btn-success me-2" 
              onClick={() => controlJobs('start')}
            >
              Start All Jobs
            </button>
            <button 
              className="btn btn-warning me-2" 
              onClick={() => controlJobs('stop')}
            >
              Stop All Jobs
            </button>
            <button 
              className="btn btn-outline-secondary" 
              onClick={fetchJobsStatus}
            >
              Refresh Status
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Job Status</h5>
              </div>
              <div className="card-body">
                {jobsStatus && Object.keys(jobsStatus).length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Job Name</th>
                          <th>Status</th>
                          <th>Schedule</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(jobsStatus).map(([jobName, jobInfo]) => (
                          <tr key={jobName}>
                            <td>
                              <code>{jobName}</code>
                            </td>
                            <td>
                              <span className={`badge ${jobInfo.running ? 'bg-success' : 'bg-secondary'}`}>
                                {jobInfo.running ? 'Running' : 'Stopped'}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatSchedule(jobInfo.schedule)}
                              </small>
                            </td>
                            <td>
                              <small>{jobInfo.description}</small>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => triggerJob(jobName)}
                                title="Run this job now"
                              >
                                Trigger Now
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h6 className="text-muted">No background jobs configured</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Job Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Survey Reminder Job</h6>
                    <p className="mb-2">
                      <strong>Purpose:</strong> Sends reminder emails and push notifications to team owners who haven't completed 
                      their surveys for episodes airing the next day.
                    </p>
                    <p className="mb-2">
                      <strong>Schedule:</strong> Runs daily at 6:00 PM UTC
                    </p>
                    <p className="mb-3">
                      <strong>Requirements:</strong> Only sends to users with verified emails 
                      and poll reminders enabled in their preferences.
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Draft Management Job</h6>
                    <p className="mb-2">
                      <strong>Purpose:</strong> Manages automated draft processes including scheduled draft starts, 
                      timer management, auto-picks, and draft notifications.
                    </p>
                    <p className="mb-2">
                      <strong>Schedule:</strong> Runs every 30 seconds
                    </p>
                    <p className="mb-3">
                      <strong>Features:</strong>
                    </p>
                    <ul className="small mb-3">
                      <li>Checks for scheduled drafts that should start</li>
                      <li>Sends 5-minute warning notifications (email + push)</li>
                      <li>Manages draft pick timers</li>
                      <li>Makes automatic picks when timers expire</li>
                      <li>Broadcasts real-time updates to connected clients</li>
                    </ul>
                  </div>
                </div>
                <div className="alert alert-info">
                  <strong>Note:</strong> You can manually trigger any job using the "Trigger Now" 
                  button for testing purposes. This will run the job immediately regardless of 
                  its normal schedule.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminJobs;
