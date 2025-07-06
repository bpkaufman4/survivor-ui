import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { DateTime } from "luxon";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleDelete } from "../../helpers/helpers";
import Swal from "sweetalert2";
import DraftSettingsModal from "./DraftSettingsModal";

export default function Table({ setView, setSetPlayersLeagueId }) {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);

  function fetchTeams() {
    fetch(`${apiUrl}league`, {
      headers: {
        authorization: localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          setLeagues(reply.data);
        } else {
          console.log(reply);
          setError(true);
        }
      })
      .catch(err => {
        console.log(err);
        setError(true);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 300)
      })
  }

  useEffect(() => {
    fetchTeams();
    
    // Set up interval to refresh data every minute to update draft statuses
    const interval = setInterval(() => {
      // Only refresh if we have leagues and any have draft dates
      if (leagues && leagues.some(league => league.draftDate)) {
        fetchTeams();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [])

  function openDraftModal(league) {
    setSelectedLeague(league);
    setShowDraftModal(true);
  }

  function closeDraftModal() {
    setShowDraftModal(false);
    setSelectedLeague(null);
  }

  function handleDraftSave() {
    // Refresh the leagues data
    fetchTeams();
  }

  function isDraftImminent(draftDate) {
    if (!draftDate) return false;
    
    const now = new Date();
    const draftTime = new Date(draftDate);
    const timeDifferenceMs = draftTime.getTime() - now.getTime();
    const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Return true if draft is within 5 minutes or has already started
    return timeDifferenceMs <= fiveMinutesMs;
  }

  function getDraftStatus(draftDate) {
    if (!draftDate) return { status: 'not-set', text: 'Not Set' };
    
    const now = new Date();
    const draftTime = new Date(draftDate);
    const timeDifferenceMs = draftTime.getTime() - now.getTime();
    
    if (timeDifferenceMs < 0) {
      return { status: 'ongoing', text: 'Draft Ongoing' };
    } else if (timeDifferenceMs <= 5 * 60 * 1000) { // 5 minutes
      const minutesLeft = Math.ceil(timeDifferenceMs / (60 * 1000));
      return { status: 'starting-soon', text: `Starting in ${minutesLeft}m` };
    } else {
      return { 
        status: 'scheduled', 
        text: DateTime.fromISO(draftDate).toLocaleString(DateTime.DATETIME_SHORT) 
      };
    }
  }

  function goToDraft(leagueId) {
    navigate(`/admin-draft/${leagueId}`);
  }

  if (loading) return <WaterLoader></WaterLoader>
  if (error) return <p>Something went wrong</p>

  async function deleteLeague(leagueId) {
    // SweetAlert confirmation dialog
    const result = await Swal.fire({
      title: 'Delete League?',
      text: 'Are you sure you want to delete this league? This action cannot be undone and will remove all teams and data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await handleDelete(`league/${leagueId}`);
        
        if (deleteResult && deleteResult.status === 'success') {
          // Update the leagues state to remove the deleted league
          setLeagues(prevLeagues => 
            prevLeagues.filter(league => league.leagueId !== leagueId)
          );
          
          // Success message
          Swal.fire({
            text: 'League deleted successfully',
            toast: true,
            timer: 3000,
            showCancelButton: false,
            showConfirmButton: false,
            position: 'top',
            icon: 'success'
          });
        } else {
          Swal.fire({
            text: 'Failed to delete league. Please try again.',
            toast: true,
            timer: 4000,
            showCancelButton: false,
            showConfirmButton: false,
            position: 'top',
            icon: 'error'
          });
        }
      } catch (err) {
        console.error('Error deleting league:', err);
        Swal.fire({
          text: 'An error occurred while deleting the league.',
          toast: true,
          timer: 4000,
          showCancelButton: false,
          showConfirmButton: false,
          position: 'top',
          icon: 'error'
        });
      }
    }
  }

  function LeagueRow({ league }) {
    const [expanded, setExpanded] = useState(false);

    function toggleExpand() {
      setExpanded(!expanded);
    }      
    
    async function deleteTeam(teamId) {
      // SweetAlert confirmation dialog
      const result = await Swal.fire({
        title: 'Delete Team?',
        text: 'Are you sure you want to delete this team? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        try {
          const deleteResult = await handleDelete(`team/${teamId}`);
          
          if (deleteResult && deleteResult.status === 'success') {
            // Update the leagues state to remove the deleted team
            setLeagues(prevLeagues => 
              prevLeagues.map(league => ({
                ...league,
                teams: league.teams?.filter(team => team.teamId !== teamId),
                teamsCount: league.teams?.filter(team => team.teamId !== teamId).length || 0
              }))
            );
              // Success message
            Swal.fire({
              text: 'Team deleted successfully',
              toast: true,
              timer: 3000,
              showCancelButton: false,
              showConfirmButton: false,
              position: 'top',
              icon: 'success'
            });
          } else {
            Swal.fire({
              text: 'Failed to delete team. Please try again.',
              toast: true,
              timer: 4000,
              showCancelButton: false,
              showConfirmButton: false,
              position: 'top',
              icon: 'error'
            });
          }
        } catch (err) {
          console.error('Error deleting team:', err);
          Swal.fire({
            text: 'An error occurred while deleting the team.',
            toast: true,
            timer: 4000,
            showCancelButton: false,
            showConfirmButton: false,
            position: 'top',
            icon: 'error'
          });
        }
      }
    }

    function setPlayers(leagueId) {
      setSetPlayersLeagueId(leagueId);
      setView('set-players');
    }

    return (
      <>
        <tr key={league.leagueId}>
          <td>{league.name}</td>
          <td>
            <span className="d-none d-md-inline">
              {league.owner.firstName} {league.owner.lastName}
            </span>
            <span className="d-md-none">
              {league.owner.firstName} {league.owner.lastName.charAt(0)}.
            </span>
          </td>
          <td>{league.teamsCount}</td>
          <td>
            {(() => {
              const draftStatus = getDraftStatus(league.draftDate);
              
              if (draftStatus.status === 'ongoing' || draftStatus.status === 'starting-soon') {
                return (
                  <div className="d-flex flex-column align-items-start">
                    <button 
                      className="btn btn-success btn-sm mb-1"
                      onClick={() => goToDraft(league.leagueId)}
                    >
                      Go to Draft
                    </button>
                    <small className="text-muted d-none d-md-inline">{draftStatus.text}</small>
                  </div>
                );
              } else {
                return (
                  <button 
                    className="btn btn-link p-0 text-decoration-underline text-primary"
                    onClick={() => openDraftModal(league)}
                    style={{ 
                      border: 'none', 
                      background: 'none',
                      fontSize: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="d-none d-md-inline">{draftStatus.text}</span>
                    <span className="d-md-none">
                      {draftStatus.status === 'not-set' ? 'None' : 'Set'}
                    </span>
                  </button>
                );
              }
            })()}
          </td>
          <td>
            <div className="admin-table-actions">
              <button className="btn btn-primary btn-sm" onClick={() => setPlayers(league.leagueId)} title="Set Players">
                <AccessibilityIcon fontSize="small" />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={toggleExpand} title="View Teams">
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteLeague(league.leagueId)} title="Delete League">
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          </td>
        </tr>
        {(expanded && league?.teams) && league.teams.map(team => (
          <tr key={team.teamId} className="bg-light">
            <td colSpan="5">
              <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1 me-2 team-info">
                  <strong>{team.name}</strong>
                  <span className="team-owner ms-md-2">
                    <span className="d-md-none"> - </span>
                    <span className="d-none d-md-inline"> - </span>
                    {team?.owner?.firstName} {team?.owner?.lastName}
                  </span>
                </div>
                <div>                  
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTeam(team.teamId)} title="Delete Team">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </>
    )
  }

  return <>
    <div className="admin-page-header">
      <h2>Leagues</h2>
      <button className="btn btn-primary">Add League</button>
    </div>
    <div className="admin-table-container">
      <table className="table table-striped admin-table leagues-main-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Size</th>
            <th>Draft</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leagues && leagues.map(l => <LeagueRow key={l.leagueId} league={l} />)}
        </tbody>
      </table>
    </div>

    {/* Draft Settings Modal */}
    {showDraftModal && selectedLeague && (
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <DraftSettingsModal
                leagueId={selectedLeague.leagueId}
                leagueName={selectedLeague.name}
                onClose={closeDraftModal}
                onSave={handleDraftSave}
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </>;
}