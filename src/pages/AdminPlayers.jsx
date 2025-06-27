import { useState, useEffect, useCallback } from "react";
import AdminMain from "../components/AdminMain";
import WaterLoader from "../components/WaterLoader";
import icon from "../assets/island.png"
import apiUrl from "../apiUrls";
import "../assets/admin-players.css"
import DotLoader from "../components/DotLoader";
import { Alert, Snackbar } from "@mui/material";
import { getFormValues, sanitizeFormValues } from "../helpers/helpers";
import Dropzone, { useDropzone } from "react-dropzone";

function AdminPlayers() {

  const [editingPlayer, setEditingPlayer] = useState(null); 
  const [formOpen, setFormOpen] = useState(false);

  const [alertOptions, setAlertOptions] = useState({severity: null, message: null});
  const [alertOpen, setAlertOpen] = useState(false);
  
  function PlayersTbody() {
    const [players, setPlayers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
  
    useEffect(() => {
      async function fetchPlayers() {
        await fetch(`${apiUrl}player/admin`, {
          headers: {
            'authorization': localStorage.getItem('jwt')
          }
        })
        .then(response => {
          return response.json();
        })
        .then(reply => {
          if(reply.status === 'success') {
            setPlayers(reply.data);
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
          }, 300);
        })
      }

      fetchPlayers();
    }, []);

    if(loading) {
      return (
        <tr>
          <td colSpan={7} className="text-center">
            <div className="d-flex w-100 justify-content-around my-5">
              <WaterLoader></WaterLoader>
            </div>
          </td>
        </tr>
      )
    }

    if(error) {
      return (
        <tr>
          <td colSpan={7} className="text-center">Something went wrong</td>
        </tr>
      )
    }

    function editPlayer(e) {
      const playerId = e.target.dataset.playerId;
      setLoading(true);
      fetch(`${apiUrl}player/${playerId}`,{
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => {
        return response.json();
      })
      .then(reply => {
        if(reply.status === 'success') {
          setEditingPlayer(reply.data);
          setFormOpen(true);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.log(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      })
    }

    const rows = players.map(player => {
      const imageSrc = player.photoUrl || icon;
      const tribeName = player.tribe ? player.tribe.name : '';
      return (
        <tr key={player.playerId}>
          <td><img src={imageSrc} className="player-head-shot table"/></td>
          <td>{player.firstName}</td>
          <td>{player.lastName}</td>
          <td>{tribeName}</td>
          <td>{player.season}</td>
          <td><button className="btn btn-primary edit-button" data-player-id={player.playerId} onClick={editPlayer}>Edit</button></td>
          <td><button className="btn btn-primary delete-button">Delete</button></td>
        </tr>
      )
    })

    return rows;
  }

  function PlayerForm({ editingPlayer }) {
    var heading = editingPlayer ? `${editingPlayer.firstName} ${editingPlayer.lastName}` : 'New Player';

    if(!editingPlayer) {
      editingPlayer = {
        playerId: '',
        firstName: '',
        lastName: '',
        photoUrl: '',
        tribeId: ''
      }
    }    const [tribes, setTribes] = useState([]);
    const [photoChanged, setPhotoChanged] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    useEffect(() => {

      async function fetchTribes() {
        fetch(`${apiUrl}tribe`,{
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        })
        .then(response => {
          return response.json();
        })
        .then(reply => {
          if(reply.status === 'success') {
            setTribes(reply.data);
          } else {
            alert('error loading tribes');
            console.log(reply);
          }
        })
        .catch(err => {
            alert('error loading tribes');
            console.log(err);
        })
      }

      fetchTribes();  
    }, []);    
    
    function TribeSelect({ tribes, tribeId, disabled }) {
      const [selectedTribe, setSelectedTribe] = useState('');

      useEffect(() => {
        if(tribes.length > 0) setSelectedTribe(tribeId)
      }, [tribes, tribeId])

      function setValue(e) {
        setSelectedTribe(e.target.value);
      }

      return (
        <select 
          name="tribeId" 
          id="tribeId" 
          className="form-select" 
          value={selectedTribe} 
          onChange={setValue}
          disabled={disabled}
        >
          <option value=""></option>
          {tribes && tribes.map(tribe => {
            return <option key={tribe.tribeId} value={tribe.tribeId}>{tribe.name}</option>
          })}
        </select>
      )
    }
    
    function handlePlayerSubmit(e) {

      e.preventDefault();
      const idArray = ['playerId', 'firstName', 'lastName', 'tribeId'];

      // Always include photoUrl if it exists (either from upload or existing)
      const photoUrlValue = document.getElementById('photoUrl').value;
      if(photoUrlValue && photoUrlValue.trim() !== '') {
        idArray.push('photoUrl');
      }
      
      const bodyJSON = getFormValues(idArray);
      const bodySanitized = sanitizeFormValues(bodyJSON);
      const body = JSON.stringify(bodySanitized);

      console.log('Form submission data:', bodySanitized); // Debug log

      setEditingPlayer(prev => ({
        ...prev,
        firstName: bodySanitized.firstName,
        lastName: bodySanitized.lastName,
        tribeId: bodySanitized.tribeId
      }));
      
      setAlertOpen(false);
      setSubmitting(true);





      fetch(`${apiUrl}player`, {
        method: 'POST',
        body,
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => {
        return response.json();
      })
      .then(reply => {
        if(reply.status === 'success') {
          console.log(reply);
          setTimeout(() => {
            setSubmitting(false);
            setAlertOptions({
              message: 'Player Saved',
              severity: 'success'
            })
            setAlertOpen(true);
          }, 1000);
        } else {
          console.log(reply);
          setTimeout(() => {
            setAlertOptions({
              message: 'Error saving player',
              severity: 'error'
            });
            setAlertOpen(true);
            setSubmitting(false)
          }, 1000);
        }
      })
      .catch(err => {
        console.log(err);
        setTimeout(() => {
          setAlertOptions({
            message: 'Error saving player',
            severity: 'error'
          });
          setSubmitting(false)
          setAlertOpen(true);
        }, 1000);
      })
    }

    function goBack(e) {
      e.preventDefault();
      setEditingPlayer(null);
      setAlertOpen(false);
      setFormOpen(false);
    }    function MyDropzone() {
      const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
          console.log(file);
          
          // Set uploading state
          setPhotoUploading(true);

          const formData = new FormData();
          formData.append('file', file);

          // Upload to server
          fetch(`${apiUrl}uploadImage`, {
            method: 'POST',
            body: formData,
            headers: {
              authorization: localStorage.getItem('jwt')
            }
          })
          .then(response => response.json())
          .then(reply => {
            if (reply.status === 'success') {
              // Update the photo URL and mark as changed
              const photoUrl = reply.data.result.variants[0];
              setEditingPlayer(prev => ({
                ...prev,
                photoUrl: photoUrl
              }));
              setPhotoChanged(true);
              
              // Update hidden form field
              document.getElementById('photoUrl').value = photoUrl;
              
              setAlertOptions({
                message: 'Photo uploaded successfully',
                severity: 'success'
              });
              setAlertOpen(true);
            } else {
              setAlertOptions({
                message: 'Error uploading photo',
                severity: 'error'
              });
              setAlertOpen(true);
            }
          })
          .catch(err => {
            console.log(err);
            setAlertOptions({
              message: 'Error uploading photo',
              severity: 'error'
            });
            setAlertOpen(true);
          })
          .finally(() => {
            // Always reset uploading state
            setPhotoUploading(false);
          });
        })
      }, [])
      const {getInputProps} = useDropzone({
        onDrop,
        disabled: photoUploading // Disable dropzone while uploading
      })

      return (
        <input id="dropzone" {...getInputProps()} />
      )
    }

    return (
      <>
        <MyDropzone></MyDropzone>
        <Snackbar open={alertOpen} autoHideDuration={2000} onClose={closeAlert} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
          <Alert severity={alertOptions.severity} sx={{width: '100%'}} onClose={closeAlert}>{alertOptions.message}</Alert>
        </Snackbar>
        <h2 className="mt-3">{heading}</h2>
        <form onSubmit={handlePlayerSubmit}>
          <input type="hidden" name="playerId" id="playerId" defaultValue={editingPlayer.playerId}/>
          <input type="hidden" name="photoUrl" id="photoUrl" defaultValue={editingPlayer.photoUrl}/>          <div className="d-flex justify-content-center">
              <div 
                className="player-head-shot" 
                id="playerHeadShot" 
                style={{
                  backgroundImage: editingPlayer.photoUrl ? `url('${editingPlayer.photoUrl}')` : '', 
                  backgroundPosition: 'center center',
                  cursor: photoUploading ? 'not-allowed' : 'pointer',
                  opacity: photoUploading ? 0.6 : 1
                }} 
                onClick={() => !photoUploading && document.getElementById('dropzone').click()}
              >
                {photoUploading ? (
                  <DotLoader color={"#007bff"}></DotLoader>
                ) : (
                  !editingPlayer.photoUrl && 'Add Image'
                )}
              </div>
          </div>          <div className="row">
              <div className="mb-3 col-6">
                  <label htmlFor="firstName" className="col-form-label">First Name:*</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="firstName" 
                    defaultValue={editingPlayer.firstName}
                    disabled={photoUploading || submitting}
                  />
              </div>
              <div className="mb-3 col-6">
                  <label htmlFor="lastName" className="col-form-label">Last Name:*</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="lastName" 
                    defaultValue={editingPlayer.lastName}
                    disabled={photoUploading || submitting}
                  />
              </div>
              <div className="mb-3 col-12">
                  <label htmlFor="lastName" className="col-form-label">Tribe:*</label>
                  <TribeSelect tribes={tribes} tribeId={editingPlayer.tribeId || ''} disabled={photoUploading || submitting}></TribeSelect>
              </div>
          </div>          <div className="d-flex justify-content-between">
            {(() => {
              if(submitting || photoUploading) {
                return (
                  <>
                    <button disabled={true} type="button" className="btn btn-outline-primary">Back</button>
                    <button type="submit" disabled={true} className="btn btn-primary">
                      <DotLoader color={"white"}></DotLoader>
                    </button>
                  </>
                )
              } else {
                return (
                  <>
                    <button type="button" className="btn btn-outline-primary" onClick={goBack}>Back</button>
                    <button type="submit" className="btn btn-primary">Save</button>
                  </>
                )
              }
            })()}
          </div>
        </form>
      </>
    )
  }

  function addPlayer() {
    setFormOpen(true);
  }

  function closeAlert(e, reason) {
    if(reason === 'clickaway') return;
    setAlertOpen(false);
  }

  return (
    <>
      <AdminMain page="admin-players">
        {(() => {
          if(formOpen) {
            return (
              <>
                <PlayerForm editingPlayer={editingPlayer}></PlayerForm>
              </>
            )
          } else {
            return (
              <>
                <div className="d-flex justify-content-between py-3">
                  <h2 className="w-auto">Players</h2>
                  <button className="btn btn-primary" onClick={addPlayer}>Add Player</button>
                </div>
                <table className="w-100">
                  <thead>
                    <tr>
                      <th></th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Tribe</th>
                      <th>Season</th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <PlayersTbody></PlayersTbody>
                  </tbody>
                </table>
              </>
            )
          }
        })()}
      </AdminMain>
    </>
  )
}

export default AdminPlayers;