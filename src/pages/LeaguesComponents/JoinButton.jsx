import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import apiUrl from '../../apiUrls';

export default function JoinButton({ league }) {
  const navigate = useNavigate();

  function joinLeagueSwal() {

    function Form() {
      const [teamName, setTeamName] = useState('');
      const [leaguePassword, setLeaguePassword] = useState('');

      return (
        <div>
          <label htmlFor="teamName" className="form-label">Team Name</label>
          <input type="text" className="form-control" name="teamName" id="teamName" autoComplete="off" value={teamName} onChange={e => setTeamName(e.target.value)}/>
          {league.privateInd && (
            <>
              <label htmlFor="key" className="form-label mt-2">Password</label>
              <input type="text" className="form-control" name="key" id="key" autoComplete="off" value={leaguePassword} onChange={e => setLeaguePassword(e.target.value)}/>
            </>
          )}
        </div>
      )
    }

    const MySwal = withReactContent(Swal);

    MySwal.fire({
      html: <Form/>,
      title: `Join ${league.name}`,
      showCancelButton: true,
      confirmButtonText: 'Join',
      preConfirm: () => {
        
        return new Promise((resolve, reject) => {

          const teamName = document.getElementById('teamName').value;
          const leaguePassword = document.getElementById('key') ? document.getElementById('key').value : null;

          const body = {
            teamName,
            leagueId: league.leagueId,
            leaguePassword
          };

          if (!teamName || teamName.length < 3) {
            Swal.showValidationMessage('Team name must be at least 3 characters long');
            resolve({message: 'Team name must be at least 3 characters long'});
            return;
          } 

          if (league.privateInd && !leaguePassword) {
            Swal.showValidationMessage('League password is required for private leagues');
            resolve({message: 'League password is required for private leagues'});
            return;
          }
          
          fetch(`${apiUrl}league/join`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              authorization: localStorage.getItem('jwt'),
              "Content-Type": "application/json"
            }
          })
          .then(response => response.json())
          .then(reply => {
            resolve(reply);
          })
          .catch(err => {
            reject(err);
          })
        })
      }
    })    
    .then(reply => {
      if(reply.value.status === 'fail') {
        Swal.fire("", reply.value.message, 'error');
      } else {
        navigate(`/league/${league.leagueId}`);
      }
    })
  }

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">{league.name}</h5>
            <p className="card-text text-muted mb-0">by {league.owner.userName}</p>
          </div>
          <div>
            {league.privateInd && <LockOutlineIcon color="action" fontSize="small" />}
          </div>
        </div>
        <button 
          className="btn btn-primary mt-auto" 
          onClick={joinLeagueSwal}
        >
          Join League
        </button>
      </div>
    </div>
  )
}