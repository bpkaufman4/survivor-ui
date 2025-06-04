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
    <table className="w-100">
      <tbody>
        {standings && standings.map(player => {
          const image = player.photoUrl || icon;
          const teamName = player.teamName ? `(${player.teamName})` : '';
          return (
            <tr key={player.playerId}>
              <td>{player.place}</td>
              <td><img src={image} alt="" className="player-image"></img></td>
              <td><a href={`../../player/${player.playerId}`}>{player.firstName} {player.lastName}</a><br></br> {teamName}</td>
              <td>{player.totalPoints}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

}