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
      <div className="player-box my-3 p-3">
        <div className="d-flex justify-content-around">
          <img src={player.photoUrl || icon} alt={`${player.firstName} ${player.lastName} from photoshoot`} className="my-player-image" />
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <p className="m-0">{player.firstName} {player.lastName} - {player.totalPoints} points</p>
          <button className="btn" onClick={toggleExpanded}>
            {(() => {
              if(expanded) {
                return <ExpandLessIcon></ExpandLessIcon>
              } else {
                return <ExpandMoreIcon></ExpandMoreIcon>
              }
            })()}
          </button>
        </div>
        {(() => {
          if(expanded) {
            return <PlayerEpisodeScores playerId={player.playerId}></PlayerEpisodeScores>
          }
        })()}
      </div>
    )
  }

  if(loading) return <div className="py-3"><WaterLoader></WaterLoader></div>
  if(error) return <p>Something went wrong</p>

  return (
    <>
      <h5>{team.name}</h5>
      <p>Score: {team.totalPoints}</p>
      {
        team && team.players.map(p => {
          return <ScoreExpand key={p.playerId} player={p}></ScoreExpand>
        })
      }
    </>
  )
}