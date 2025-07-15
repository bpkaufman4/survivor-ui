import { useEffect, useState } from "react";
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import apiUrl from "../../apiUrls";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content'

export default function Scoring() {
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(false);
  
  function fetchStatistics() {
    fetch(`${apiUrl}statistic`, {
      headers: {
        authorization: localStorage.getItem('jwt')
      }
    })
    .then(response => response.json())
    .then(reply => {
      if(reply.status === 'success') {
        setStatistics(reply.data);
      } else {
        setError(true);
      }
    })
    .catch(err => {
      console.error(err);
      setError(true);
    });
  }

  useEffect(() => {
    fetchStatistics();
  }, []);

  function StatisticRow({statisticId, name, defaultPoints, description}) {
    let pointsText = defaultPoints === 1 ? 'point' : 'points';
    const [expanded, setExpanded] = useState(false);

    return (
      <>
        <tr key={statisticId} style={{ height: '50px' }}>
          <td style={{ verticalAlign: 'middle' }}>{name}</td>
          <td style={{ verticalAlign: 'middle' }}>{defaultPoints} {pointsText}</td>
          <td style={{ verticalAlign: 'middle' }}>
            <button className="btn btn-link" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide Details' : 'Show Details'}
            </button>
          </td>
        </tr>
        {expanded && (
          <tr>
            <td colSpan={3} style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px',
              borderTop: '1px solid #dee2e6'
            }}>
              {description}
            </td>
          </tr>
        )}
      </>
    );
  }

  function Form() {
    if(error) return <p>Something went wrong</p>;

    return(
      <>
        <h5>Scoring</h5>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Statistic</th>
              <th style={{ width: '30%' }}>Points</th>
              <th style={{ width: '30%' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {statistics && statistics.map(s => <StatisticRow key={s.statisticId} {...s} />)}
          </tbody>
        </table>
      </>
    )
  }

  function showPopup() {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      html: <Form/>,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Close'
    });
  }

  return (
    <button className="btn" onClick={showPopup}>
      <ScoreboardIcon />
    </button>
  );
}