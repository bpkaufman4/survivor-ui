import { useState } from "react";
import apiUrl from "../../apiUrls";
import Swal from "sweetalert2";
import { useUser } from "../../contexts/UserContext";

export default function NameEdit({ user }) {
  const { refreshUser } = useUser();
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if there are unsaved changes
  const checkChanges = (newFirstName, newLastName) => {
    const changes = newFirstName !== user.firstName || newLastName !== user.lastName;
    setHasChanges(changes);
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    checkChanges(value, lastName);
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    checkChanges(firstName, value);
  };

  function saveName() {
    if (!firstName.trim() || !lastName.trim()) {
      Swal.fire({
        text: 'First name and last name are required',
        icon: 'error',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    const body = JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() });
    fetch(`${apiUrl}user/me`, {
      method: 'PATCH',
      body,
      headers: {
        authorization: localStorage.getItem('jwt'),
        "Content-type": "application/json"
      }
    })
    .then(response => response.json())
    .then(reply => {
      if(reply.status === 'success') {
        Swal.fire({
          text: 'Name updated successfully',
          icon: 'success', 
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          position: 'top'
        });
        refreshUser(); // Refresh user data
        setIsEditing(false);
        setHasChanges(false);
      } else {
        console.log(reply);
        Swal.fire({
          text: 'Something went wrong',
          icon: 'error',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          position: 'top'
        })
      }
    })
    .catch(err => {
      console.log(err);
      Swal.fire({
        text: 'Something went wrong',
        toast: true,
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        position: 'top'
      })
    })
  }

  function cancelEdit() {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setIsEditing(false);
    setHasChanges(false);
  }

  return (
    <div className="card mb-3">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <strong>👤 Personal Information</strong>
          {!isEditing && (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)} 
              className="btn btn-outline-primary btn-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {!isEditing ? (
          <div>
            <div className="mb-2">
              <small className="text-muted">Full Name</small>
              <div className="fw-semibold">{user.firstName} {user.lastName}</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input 
                type="text" 
                name="firstName" 
                id="firstName" 
                className="form-control" 
                value={firstName} 
                onChange={handleFirstNameChange}
                placeholder="Enter your first name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                id="lastName" 
                className="form-control" 
                value={lastName} 
                onChange={handleLastNameChange}
                placeholder="Enter your last name"
              />
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="btn btn-outline-secondary"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={saveName} 
                className="btn btn-primary"
                disabled={!hasChanges || !firstName.trim() || !lastName.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
