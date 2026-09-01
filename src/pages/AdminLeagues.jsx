import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import { handleDelete } from "../helpers/helpers";
import DraftSettingsModal from "./AdminLeaguesComponents/DraftSettingsModal";
import SetPlayers from "./AdminLeaguesComponents/SetPlayers";
import "../assets/admin-common.css";
import "../assets/admin-leagues.css";
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import PollIcon from '@mui/icons-material/Poll';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminLeagues() {
  const navigate = useNavigate();
  const [view, setView] = useState('workspace');
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [setPlayersLeagueId, setSetPlayersLeagueId] = useState(null);
  const [setPlayersUnrestricted, setSetPlayersUnrestricted] = useState(false);

  function fetchLeagues() {
    setError(false);
    setLoading(true);

    fetch(`${apiUrl}league`, {
      headers: {
        authorization: localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          setLeagues(reply.data || []);
          setSelectedLeagueId(prev => {
            if (prev && (reply.data || []).some(league => league.leagueId === prev)) return prev;
            return reply.data?.[0]?.leagueId || null;
          });
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.log(err);
        setError(true);
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 300);
      });
  }

  useEffect(() => {
    fetchLeagues();

    const interval = setInterval(() => {
      if (view === 'workspace') {
        fetchLeagues();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [view]);

  const visibleLeagues = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return leagues;

    return leagues.filter(league => {
      const ownerName = `${league.owner?.firstName || ''} ${league.owner?.lastName || ''}`.toLowerCase();
      return (league.name || '').toLowerCase().includes(normalizedSearch) || ownerName.includes(normalizedSearch);
    });
  }, [leagues, search]);

  const selectedLeague = useMemo(() => {
    return visibleLeagues.find(league => league.leagueId === selectedLeagueId) || visibleLeagues[0] || leagues[0] || null;
  }, [visibleLeagues, leagues, selectedLeagueId]);

  const leagueStats = useMemo(() => {
    return [
      { label: 'Teams', value: selectedLeague?.teams?.length || 0 },
      { label: 'Draft', value: selectedLeague?.draftEnabled ? 'On' : 'Off' },
      { label: 'Surveys', value: selectedLeague?.surveyEnabled === false ? 'Off' : 'On' },
      { label: 'Rules', value: selectedLeague?.allowUnrestrictedPlayerAssignments ? 'Open' : 'Restricted' }
    ];
  }, [selectedLeague]);

  function formatDraftStatus(league) {
    if (!league?.draftDate) return 'Draft not set';

    const draftTime = new Date(league.draftDate);
    const now = new Date();
    const diff = draftTime.getTime() - now.getTime();

    if (diff < 0) return 'Draft ongoing';
    if (diff <= 5 * 60 * 1000) return 'Starting soon';

    return DateTime.fromISO(league.draftDate).toLocaleString(DateTime.DATETIME_SHORT);
  }

  function openDraftModal() {
    setShowDraftModal(true);
  }

  function closeDraftModal() {
    setShowDraftModal(false);
  }

  function handleDraftSave() {
    fetchLeagues();
  }

  function openPlayerManager(league) {
    setSetPlayersLeagueId(league.leagueId);
    setSetPlayersUnrestricted(Boolean(league.allowUnrestrictedPlayerAssignments));
    setView('set-players');
  }

  function handleDeleteLeague(leagueId) {
    Swal.fire({
      title: 'Delete League?',
      text: 'This will remove the league and all related data. This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete league'
    }).then(async result => {
      if (!result.isConfirmed) return;

      const deleteResult = await handleDelete(`league/${leagueId}`);

      if (deleteResult && deleteResult.status === 'success') {
        setLeagues(prev => prev.filter(league => league.leagueId !== leagueId));
        if (selectedLeagueId === leagueId) {
          const remaining = leagues.filter(league => league.leagueId !== leagueId);
          setSelectedLeagueId(remaining[0]?.leagueId || null);
        }

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
    });
  }

  function handleDeleteTeam(team) {
    Swal.fire({
      title: 'Delete Team?',
      text: `Delete ${team.name}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete team'
    }).then(async result => {
      if (!result.isConfirmed) return;

      const deleteResult = await handleDelete(`team/${team.teamId}`);

      if (deleteResult && deleteResult.status === 'success') {
        setLeagues(prev => prev.map(league => {
          if (league.leagueId !== selectedLeague?.leagueId) return league;
          const teams = (league.teams || []).filter(existingTeam => existingTeam.teamId !== team.teamId);
          return { ...league, teams };
        }));

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
    });
  }

  if (view === 'set-players') {
    return (
      <SetPlayers
        setView={(nextView) => setView(nextView === 'table' ? 'workspace' : nextView)}
        leagueId={setPlayersLeagueId}
        setSetPlayersLeagueId={setSetPlayersLeagueId}
        isUnrestricted={setPlayersUnrestricted}
      />
    );
  }

  if (loading) return <div className="admin-loading-container"><WaterLoader /></div>;

  if (error) {
    return (
      <div className="admin-error-container">
        <h3>Something went wrong</h3>
        <p className="text-muted mb-3">Unable to load leagues right now.</p>
        <button className="btn btn-primary" onClick={fetchLeagues}>Retry</button>
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="admin-error-container">
        <h3>No leagues found</h3>
        <p className="text-muted mb-3">Create or join a league first.</p>
        <button className="btn btn-outline-secondary" onClick={fetchLeagues}>
          Refresh
        </button>
      </div>
    );
  }

  const teams = selectedLeague.teams || [];

  return (
    <div className="admin-leagues-page single-workspace-layout">
      <div className="row g-3 mb-3">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm league-picker-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Leagues</h5>
                <span className="text-muted small">{visibleLeagues.length} visible</span>
              </div>
              <div className="position-relative mb-3">
                <SearchIcon className="league-search-icon" fontSize="small" />
                <input
                  type="text"
                  className="form-control league-search-input"
                  placeholder="Search leagues or owners"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="league-select-list">
                {visibleLeagues.map(league => {
                  const isActive = league.leagueId === selectedLeague.leagueId;
                  return (
                    <button
                      key={league.leagueId}
                      className={`league-select-row ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedLeagueId(league.leagueId)}
                    >
                      <div>
                        <div className="fw-semibold">{league.name}</div>
                        <div className="small text-muted">{league.owner?.firstName} {league.owner?.lastName}</div>
                      </div>
                      <span className="small text-muted">{league.teams?.length || 0} teams</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm league-workspace-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <span className={`league-pill league-pill-${selectedLeague.privateInd ? 'dark' : 'light'}`}>
                      {selectedLeague.privateInd ? <LockIcon fontSize="inherit" /> : <PublicIcon fontSize="inherit" />}
                      {selectedLeague.privateInd ? 'Private' : 'Public'}
                    </span>
                    <span className="league-pill league-pill-secondary">
                      <SportsScoreIcon fontSize="inherit" /> {formatDraftStatus(selectedLeague)}
                    </span>
                    <span className={`league-pill league-pill-${selectedLeague.allowUnrestrictedPlayerAssignments ? 'info' : 'secondary'}`}>
                      <ShuffleIcon fontSize="inherit" />
                      {selectedLeague.allowUnrestrictedPlayerAssignments ? 'No player restrictions' : 'Restricted'}
                    </span>
                  </div>
                  <h3 className="mb-1">{selectedLeague.name}</h3>
                  <div className="text-muted">
                    {selectedLeague.owner?.firstName} {selectedLeague.owner?.lastName}
                  </div>
                </div>

                <div className="league-action-group">
                  <button className="btn btn-outline-primary btn-sm" onClick={openDraftModal}>
                    Draft <EditIcon fontSize="small" className="ms-1" />
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => openPlayerManager(selectedLeague)}>
                    Players <ManageAccountsIcon fontSize="small" className="ms-1" />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLeague(selectedLeague.leagueId)}>
                    Delete league <DeleteIcon fontSize="small" className="ms-1" />
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-3">
                {leagueStats.map(stat => (
                  <div className="col-6 col-xl-3" key={stat.label}>
                    <div className="metric-card">
                      <div className="metric-value">{stat.value}</div>
                      <div className="metric-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="workspace-section">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="section-heading mb-0">Teams in this league</div>
                  <span className="text-muted small">Team actions</span>
                </div>

                {teams.length > 0 ? (
                  <div className="team-list">
                    {teams.map(team => (
                      <div className="team-row" key={team.teamId}>
                        <div className="team-row-main">
                          <div className="team-name">{team.name}</div>
                          <div className="team-owner small text-muted">
                            {team.owner ? `${team.owner.firstName} ${team.owner.lastName}` : 'No owner'}
                          </div>
                        </div>
                        <div className="team-row-meta">
                          <span className="badge bg-light text-dark border">{team.players?.length || 0} players</span>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteTeam(team)}>
                            <DeleteIcon fontSize="small" className="me-1" /> Delete team
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted">No teams have joined this league yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
