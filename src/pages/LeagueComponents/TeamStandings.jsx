import { useState, useEffect } from "react"
import apiUrl from "../../apiUrls"
import WaterLoader from "../../components/WaterLoader";

export default function TeamStandings({ leagueId }) {

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {

    function fetchTeamStandings() {
      fetch(`${apiUrl}team/byLeague?leagueId=${leagueId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setStandings(reply.data)
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

    fetchTeamStandings();

  }, [leagueId])


  if(loading) return (
    <div className="py-5">
      <WaterLoader></WaterLoader>
    </div>
  );
  if(error) return <p>Something went wrong</p>

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">Team Standings</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: '60px' }}>Rank</th>
                <th>Team</th>
                <th>Players</th>
                <th className="text-center">Bonus</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {standings && standings.map((team, i) => {
                const rankClass = i === 0 ? 'text-warning fw-bold' : i === 1 ? 'text-secondary fw-bold' : i === 2 ? 'text-dark fw-bold' : '';
                
                return (
                  <tr key={team.teamId}>
                    <td className={`text-center ${rankClass}`}>
                      {i < 3 && <span className="me-1">🏆</span>}
                      {(i+1)}
                    </td>
                    <td>
                      <div>
                        <a href={`../../team/${team.teamId}`} className="text-decoration-none fw-semibold">
                          {team.name}
                        </a>
                        <div className="text-muted small">
                          {team.firstName} {team.lastName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div dangerouslySetInnerHTML={{__html: team.playersHTML}} className="small"></div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-secondary">{team.bonus}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-primary fs-6">{team.totalPoints}</span>
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