import AdminMain from "../components/AdminMain";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function AdminDraft() {
  const { leagueId } = useParams();
  const navigate = useNavigate();

  return (
    <AdminMain page="admin-draft">
      <div className="container mt-4">
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={() => navigate('/admin-leagues')}
          >
            <ArrowBackIcon /> Back to Leagues
          </button>
          <h2 className="mb-0">Admin Draft Monitor</h2>
          <span className="badge bg-danger ms-3">Admin View</span>
        </div>
        
        <div className="alert alert-info" role="alert">
          <h5>Draft Administration</h5>
          <p className="mb-2">
            You are viewing the administrative interface for the draft in League {leagueId}.
          </p>
          <ul className="mb-0">
            <li>Monitor draft progress and participant activity</li>
            <li>Manage draft settings and timing</li>
            <li>Handle any technical issues during the draft</li>
            <li>Override picks if necessary</li>
          </ul>
        </div>
        
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Draft Interface</h5>
              </div>
              <div className="card-body text-center py-5">
                <p className="text-muted mb-3">
                  The full draft interface will be loaded here.
                </p>
                <p className="small">
                  This would include the real-time draft board, player selection interface, 
                  timer controls, and participant management tools.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Admin Controls</h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" disabled>
                    Pause Draft
                  </button>
                  <button className="btn btn-outline-warning" disabled>
                    Reset Timer
                  </button>
                  <button className="btn btn-outline-info" disabled>
                    Send Message
                  </button>
                  <button className="btn btn-outline-secondary" disabled>
                    Export Draft Log
                  </button>
                </div>
                <hr />
                <small className="text-muted">
                  Admin controls will be active during live draft sessions.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminMain>
  );
}
