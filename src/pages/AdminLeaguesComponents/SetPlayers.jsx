import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import SaveIcon from '@mui/icons-material/Save';
import { handleGet, handlePost } from "../../helpers/helpers";
import Swal from "sweetalert2";

export default function SetPlayers({ setView, leagueId, setSetPlayersLeagueId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch league with teams
        const leagueResponse = await handleGet(`league/${leagueId}`, setError);
        if (leagueResponse && leagueResponse.status === 'success') {
          setLeague(leagueResponse.data);
          setTeams(leagueResponse.data.teams || []);
        }

        // Fetch all available players
        const playersResponse = await handleGet('players', setError);
        if (playersResponse && playersResponse.status === 'success') {
          setAvailablePlayers(playersResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }

    if (leagueId) {
      fetchData();
    }
  }, [leagueId]);

  const handleBack = () => {
    setSetPlayersLeagueId(null);
    setView('table');
  };

  const handleMovePlayerToTeam = (teamId, player) => {
    // Remove player from other teams first
    setTeams(prevTeams =>
      prevTeams.map(team => ({
        ...team,
        players: team.players?.filter(p => p.playerId !== player.playerId) || []
      }))
    );

    // Add player to target team
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.teamId === teamId
          ? { ...team, players: [...(team.players || []), player] }
          : team
      )
    );

    setSelectedPlayer(null);
  };

  const handleMovePlayerToAvailable = (teamId, playerId) => {
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.teamId === teamId
          ? { ...team, players: team.players?.filter(p => p.playerId !== playerId) || [] }
          : team
      )
    );

    setSelectedPlayer(null);
  };

  const savePlayerAssignments = async () => {
    try {
      const assignments = [];
      
      teams.forEach(team => {
        team.players?.forEach(player => {
          assignments.push({
            teamId: team.teamId,
            playerId: player.playerId
          });
        });
      });

      const result = await handlePost(`league/${leagueId}/players`, { assignments }, setError);
      
      if (result && result.status === 'success') {
        Swal.fire({
          text: 'Player assignments saved successfully',
          toast: true,
          timer: 3000,
          showCancelButton: false,
          showConfirmButton: false,
          position: 'top',
          icon: 'success'
        });
      } else {
        Swal.fire({
          text: 'Failed to save player assignments',
          toast: true,
          timer: 4000,
          showCancelButton: false,
          showConfirmButton: false,
          position: 'top',
          icon: 'error'
        });
      }
    } catch (err) {
      console.error('Error saving assignments:', err);
      Swal.fire({
        text: 'Error saving player assignments',
        toast: true,
        timer: 4000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'error'
      });
    }
  };

  const getUnassignedPlayers = () => {
    const assignedPlayerIds = new Set();
    teams.forEach(team => {
      team.players?.forEach(player => {
        assignedPlayerIds.add(player.playerId);
      });
    });
    
    return availablePlayers.filter(player => !assignedPlayerIds.has(player.playerId));
  };

  if (loading) return <WaterLoader />;
  if (error) return <p>Something went wrong</p>;
  if (!league) return <p>League not found</p>;
  return (
    <div className="container-fluid px-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center">
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleBack}>
            <ArrowBackIcon style={{ fontSize: '1.2rem' }} />
          </button>
          <h4 className="mb-0">Set Players - {league.name}</h4>
        </div>
        <button className="btn btn-sm btn-primary" onClick={savePlayerAssignments}>
          <SaveIcon className="me-1" style={{ fontSize: '1.1rem' }} />
          Save
        </button>
      </div>

      <div className="row g-2">
        {/* Available Players */}
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-header bg-secondary text-white py-2">
              <h6 className="mb-0">
                <PersonIcon className="me-1" style={{ fontSize: '1.1rem' }} />
                Available ({getUnassignedPlayers().length})
              </h6>
            </div>
            <div className="card-body p-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {getUnassignedPlayers().map(player => (
                <PlayerCard
                  key={player.playerId}
                  player={player}
                  isSelected={selectedPlayer?.playerId === player.playerId}
                  onClick={() => setSelectedPlayer(selectedPlayer?.playerId === player.playerId ? null : player)}
                  teams={teams}
                  onMoveToTeam={handleMovePlayerToTeam}
                  variant="available"
                />
              ))}
              {getUnassignedPlayers().length === 0 && (
                <div className="text-center text-muted py-3">
                  <PersonIcon style={{ fontSize: '2rem', opacity: 0.3 }} />
                  <p className="small mb-0">All players assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teams */}
        <div className="col-md-9">
          <div className="row g-2">
            {teams.map(team => (
              <div key={team.teamId} className="col-lg-4 col-md-6">
                <TeamCard
                  team={team}
                  selectedPlayer={selectedPlayer}
                  setSelectedPlayer={setSelectedPlayer}
                  teams={teams}
                  onMoveToTeam={handleMovePlayerToTeam}
                  onMoveToAvailable={handleMovePlayerToAvailable}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player, isSelected, onClick, teams, onMoveToTeam, variant }) {
  return (
    <div className="mb-1">
      <div
        className={`card player-card ${isSelected ? 'border-primary shadow-sm' : 'border-light'}`}
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        onClick={onClick}
      >
        <div className="card-body p-2">
          <div className="fw-bold small">{player.firstName} {player.lastName}</div>
          {player.tribe && (
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {player.tribe.name}
            </div>
          )}
          
          {isSelected && variant === 'available' && (
            <div className="mt-2 pt-2 border-top">
              <div className="d-grid gap-1">
                {teams.map(team => (
                  <button
                    key={team.teamId}
                    className="btn btn-sm btn-outline-primary py-1"
                    style={{ fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToTeam(team.teamId, player);
                    }}
                  >
                    → {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, selectedPlayer, setSelectedPlayer, teams, onMoveToTeam, onMoveToAvailable }) {
  return (
    <div className="card h-100">
      <div className="card-header bg-primary text-white py-2">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <GroupIcon className="me-1" style={{ fontSize: '1.1rem' }} />
            {team.name}
          </h6>
          <span className="badge bg-light text-dark">{team.players?.length || 0}</span>
        </div>
        {team.owner && (
          <small style={{ fontSize: '0.75rem' }}>
            {team.owner.firstName} {team.owner.lastName}
          </small>
        )}
      </div>
      <div className="card-body p-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {(team.players || []).map(player => (
          <div key={player.playerId} className="mb-1">
            <div
              className={`card player-card ${selectedPlayer?.playerId === player.playerId ? 'border-primary shadow-sm' : 'border-light'}`}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => setSelectedPlayer(selectedPlayer?.playerId === player.playerId ? null : player)}
            >
              <div className="card-body p-2">
                <div className="fw-bold small">{player.firstName} {player.lastName}</div>
                {player.tribe && (
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {player.tribe.name}
                  </div>
                )}
                
                {selectedPlayer?.playerId === player.playerId && (
                  <div className="mt-2 pt-2 border-top">
                    <div className="d-grid gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary py-1"
                        style={{ fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToAvailable(team.teamId, player.playerId);
                        }}
                      >
                        ← Available
                      </button>
                      {teams.filter(t => t.teamId !== team.teamId).map(targetTeam => (
                        <button
                          key={targetTeam.teamId}
                          className="btn btn-sm btn-outline-primary py-1"
                          style={{ fontSize: '0.75rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToTeam(targetTeam.teamId, player);
                          }}
                        >
                          → {targetTeam.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {(!team.players || team.players.length === 0) && (
          <div className="text-center text-muted py-3">
            <GroupIcon style={{ fontSize: '1.5rem', opacity: 0.3 }} />
            <p className="small mb-0">No players</p>
          </div>
        )}
      </div>
    </div>
  );
}
