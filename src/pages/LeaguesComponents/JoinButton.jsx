import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import apiUrl from '../../apiUrls';

export default function JoinButton({ league, refreshLeagues }) {

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
        refreshLeagues();
      }
    })
  }

  return (
    <button key={league.leagueId} className="w-100 btn btn-outline-primary d-flex mb-2 justify-content-between align-items-center" onClick={joinLeagueSwal}>
      <div>{league.name} - {league.owner.userName}</div>
      <div>
        {league.privateInd && <LockOutlineIcon />}
      </div>
    </button>
  )
}