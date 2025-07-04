import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import icon from "../../assets/island.png"
import "../../assets/my-team.css"
import WaterLoader from "../../components/WaterLoader";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayerEpisodeScores from "./PlayerEpisodesScores";

export default function MyTeam({ leagueId }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    function fetchTeam() {
      fetch(`${apiUrl}team/myTeam/${leagueId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setTeam(reply.data);
        } else {
          console.error('Error fetching my team', reply);
          setError(true);
        }
      })
      .catch(err => {
        console.error("Error fetching my team", err);
        setError(true);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 300)
      })
    }

    fetchTeam();
  }, [leagueId])

  function ScoreExpand({ player }) {
    const [expanded, setExpanded] = useState(false);

    function toggleExpanded() {
      setExpanded((() => {return !expanded}));
    }

    return (
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <img 
                src={player.photoUrl || icon} 
                alt={`${player.firstName} ${player.lastName} from photoshoot`} 
                className="rounded-circle" 
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            </div>
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 fw-semibold">{player.firstName} {player.lastName}</h6>
                  <span className="badge bg-info fs-6">{player.totalPoints} points</span>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={toggleExpanded}>
                  {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  <span className="ms-1 d-none d-sm-inline">
                    {expanded ? 'Hide Details' : 'Show Details'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          {expanded && (
            <div className="mt-3 pt-3 border-top">
              <PlayerEpisodeScores playerId={player.playerId}></PlayerEpisodeScores>
            </div>
          )}
        </div>
      </div>
    )
  }

  if(loading) return <div className="py-3"><WaterLoader></WaterLoader></div>
  if(error) return <p>Something went wrong</p>

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">{team.name}</h5>
          <span className="badge bg-light text-dark fs-6">Total: {team.totalPoints} points</span>
        </div>
      </div>
      <div className="card-body">
        {team && team.players && team.players.length > 0 ? (
          team.players.map(p => {
            return <ScoreExpand key={p.playerId} player={p}></ScoreExpand>
          })
        ) : (
          <div className="text-center text-muted py-4">
            <p>No players on your team yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}