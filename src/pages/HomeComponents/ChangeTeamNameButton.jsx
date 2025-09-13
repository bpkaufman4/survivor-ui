import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import apiUrl from '../../apiUrls';
import Swal from 'sweetalert2';

export default function ChangeTeamNameButton({ teamNameProp, teamId }) {

  const handleChangeTeamName = () => {
    Swal.fire({
      title: 'Change Team Name',
      input: 'text',
      inputLabel: 'New Team Name',
      inputValue: teamNameProp,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      preConfirm: (newTeamName) => {
        if (!newTeamName) {
          Swal.showValidationMessage('Please enter a valid team name');
        }
        return { newTeamName };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Call API to change team name
        fetch(`${apiUrl}team/${teamId}/name`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('jwt')
          },
          body: JSON.stringify({ name: result.value.newTeamName })
        })
          .then(response => response.json())
          .then(reply => {
            if (reply.status === 'success') {
              Swal.fire('Success', 'Team name changed successfully', 'success')
              .then(() => {
                window.location.reload();
              })
            } else {
              Swal.fire('Error', 'Failed to change team name', 'error');
            }
          });
      }
    });
  };

  return (
    <button className={`btn`} onClick={handleChangeTeamName}>
      <EditIcon />
    </button>
  )
}
