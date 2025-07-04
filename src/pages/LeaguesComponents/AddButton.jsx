import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import apiUrl from '../../apiUrls';

export default function AddButton() {

  function createLeagueSwal() {    function Form() {
      const [leagueName, setLeagueName] = useState('');
      const [teamName, setTeamName] = useState('');
      const [isPrivate, setIsPrivate] = useState(false);
      const [leaguePassword, setLeaguePassword] = useState('');

      return (
        <div>
          <label htmlFor="leagueName" className="form-label">League Name</label>
          <input 
            type="text" 
            className="form-control" 
            name="leagueName" 
            id="leagueName" 
            autoComplete="off" 
            value={leagueName} 
            onChange={e => setLeagueName(e.target.value)}
          />
          
          <label htmlFor="teamName" className="form-label mt-2">Your Team Name</label>
          <input 
            type="text" 
            className="form-control" 
            name="teamName" 
            id="teamName" 
            autoComplete="off" 
            value={teamName} 
            onChange={e => setTeamName(e.target.value)}
          />
          
          <div className="form-check mt-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="isPrivate" 
              checked={isPrivate} 
              onChange={e => setIsPrivate(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="isPrivate">
              Private League
            </label>
          </div>

          {isPrivate && (
            <>
              <label htmlFor="password" className="form-label mt-2">Password</label>
              <input 
                type="text" 
                className="form-control" 
                name="password" 
                id="password" 
                autoComplete="off" 
                value={leaguePassword} 
                onChange={e => setLeaguePassword(e.target.value)}
              />
            </>
          )}
        </div>
      )
    }

    const MySwal = withReactContent(Swal);

    MySwal.fire({
      html: <Form/>,
      title: 'Create New League',
      showCancelButton: true,
      confirmButtonText: 'Create League',      preConfirm: () => {
        
        return new Promise((resolve, reject) => {

          const leagueName = document.getElementById('leagueName').value;
          const teamName = document.getElementById('teamName').value;
          const isPrivate = document.getElementById('isPrivate').checked;
          const leaguePassword = document.getElementById('password') ? document.getElementById('password').value : null;

          const body = {
            name: leagueName,
            teamName: teamName,
            privateInd: isPrivate,
            password: isPrivate ? leaguePassword : null
          };

          if (!leagueName || leagueName.length < 3) {
            Swal.showValidationMessage('League name must be at least 3 characters long');
            resolve({message: 'League name must be at least 3 characters long'});
            return;
          }

          if (!teamName || teamName.length < 3) {
            Swal.showValidationMessage('Team name must be at least 3 characters long');
            resolve({message: 'Team name must be at least 3 characters long'});
            return;
          } 

          if (isPrivate && !leaguePassword) {
            Swal.showValidationMessage('Password is required for private leagues');
            resolve({message: 'Password is required for private leagues'});
            return;
          }
          
          fetch(`${apiUrl}league/add`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              authorization: localStorage.getItem('jwt'),
              "Content-Type": "application/json"
            }
          })          .then(response => response.json())
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
        window.location.assign('/');
      }
    })
  }

  return (
    <div className="text-center">
      <button 
        className="btn btn-success btn-lg" 
        onClick={createLeagueSwal}
      >
        <AddIcon className="me-2" />
        Create New League
      </button>
    </div>
  )
}
