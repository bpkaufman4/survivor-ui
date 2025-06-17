import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { DateTime } from "luxon";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Table() {

  const [leagues, setLeagues] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchTeams();
  }, [])

  if (loading) return <WaterLoader></WaterLoader>
  if (error) return <p>Something went wrong</p>

  function LeagueRow({ league }) {
    const [expanded, setExpanded] = useState(false);
    const [teams, setTeams] = useState(null);
    const [leagueLoading, setLeagueLoading] = useState(true);
    const [leagueError, setLeagueError] = useState(false);

    function fetchTeams() {
      fetch(`${apiUrl}team/byLeague?leagueId=${league.leagueId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
        .then(response => response.json())
        .then(reply => {
          if (reply.status === 'success') {
            setTeams(reply.data)
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
    }, [])

    function toggleExpand() {
      setExpanded(!expanded);

      if(expanded && !teams) fetchTeams();
    }

    return (
      <>
        <tr key={league.leagueId}>
          <td>{league.name}</td>
          <td>{league.owner.firstName} {league.owner.lastName}</td>
          <td>{league.teamsCount}</td>
          <td>{league.draftDate ? DateTime.fromISO(league.draftDate).toLocaleString(DateTime.DATETIME_SHORT) : 'Not Set'}</td>
          <td>
            <button className="btn">
              <AccessibilityIcon></AccessibilityIcon>
            </button>
          </td>
          <td>
            <button className="btn" onClick={toggleExpand}>
              {expanded && <ExpandLessIcon />}
              {!expanded && <ExpandMoreIcon />}
            </button>
          </td>
        </tr>
        {(expanded && teams) && (
          <tr>
            <td>Expanded</td>
          </tr>
        )}
      </>
    )
  }

  return <>
    <div className="d-flex justify-content-between py-3">
      <h2 className="w-auto">Polls</h2>
      <button className="btn btn-primary">Add Survey</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Owner</th>
          <th>Size</th>
          <th>Draft</th>
          <th>Set Players</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>
        {leagues && leagues.map(l => <LeagueRow key={l.leagueId} league={l} />)}
      </tbody>
    </table>
  </>;
}