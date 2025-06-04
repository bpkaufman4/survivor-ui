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
    <table className="w-100">
      <thead>
        <tr>
          <th colSpan={2}>Team Rank</th>
          <th>Players</th>
          <th>Bonus</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {standings && standings.map((team, i) => {

          return (
            <tr key={team.teamId}>
              <td>{(i+1)}</td>
              <td><a href={`../../team/${team.teamId}`}>{team.name}<br></br>{team.firstName} {team.lastName}</a></td>
              <td dangerouslySetInnerHTML={{__html: team.playersHTML}}></td>
              <td>{team.bonus}</td>
              <td>{team.totalPoints}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

}