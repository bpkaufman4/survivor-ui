import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";

export default function PlayerStandings({ leagueId }) {

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    function fetchPlayerStandings() {
      fetch(`${apiUrl}player/byLeague?leagueId=${leagueId}`, {
        headers: {
          "authorization": localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setStandings(reply.data);
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

    fetchPlayerStandings();
  }, [leagueId])

  if(loading) return (
    <div className="py-5">
      <WaterLoader></WaterLoader>
    </div>
  );
  if(error) return <p>Something went wrong</p>;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-success text-white">
        <h5 className="card-title mb-0">Player Standings</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: '60px' }}>Rank</th>
                <th style={{ width: '80px' }}>Photo</th>
                <th>Player</th>
                <th className="text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings && standings.map(player => {
                const image = player.photoUrl || '/island.png';
                const teamName = player.teamName ? `(${player.teamName})` : '';
                const rankClass = player.place === 1 ? 'text-warning fw-bold' : player.place === 2 ? 'text-secondary fw-bold' : player.place === 3 ? 'text-dark fw-bold' : '';
                
                return (
                  <tr key={player.playerId}>
                    <td className={`text-center ${rankClass}`}>
                      {player.place <= 3 && <span className="me-1">🏆</span>}
                      {player.place}
                    </td>
                    <td>
                      <img 
                        src={image} 
                        alt={`${player.firstName} ${player.lastName}`} 
                        className="rounded-circle" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div>
                        <a href={`../../player/${player.playerId}`} className="text-decoration-none fw-semibold">
                          {player.firstName} {player.lastName}
                        </a>
                        {teamName && (
                          <div className="text-muted small">
                            {teamName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-success fs-6">{player.totalPoints}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

}