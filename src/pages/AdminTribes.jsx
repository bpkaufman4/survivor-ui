import { useState, useEffect } from "react";
import AdminMain from "../components/AdminMain";
import WaterLoader from "../components/WaterLoader";
import apiUrl from "../apiUrls";
import "../assets/admin-common.css"
import DotLoader from "../components/DotLoader";
import { Alert, Snackbar } from "@mui/material";
import { getFormValues, sanitizeFormValues } from "../helpers/helpers";
import Swal from "sweetalert2";

function AdminTribes() {

  const [editingTribe, setEditingTribe] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const [alertOptions, setAlertOptions] = useState({ severity: null, message: null });
  const [alertOpen, setAlertOpen] = useState(false);

  function TribesTbody() {
    const [tribes, setTribes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      async function fetchTribes() {
        await fetch(`${apiUrl}tribe/admin`, {
          headers: {
            'authorization': localStorage.getItem('jwt')
          }
        })
          .then(response => {
            return response.json();
          })
          .then(reply => {
            if (reply.status === 'success') {
              setTribes(reply.data);
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

      fetchTribes();
    }, []);

    if (loading) {
      return (
        <tr>
          <td colSpan={3} className="text-center">
            <div className="d-flex w-100 justify-content-around my-5">
              <WaterLoader></WaterLoader>
            </div>
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td colSpan={4} className="text-center">Something went wrong</td>
        </tr>
      )
    }

    function editTribe(e) {
      const tribeId = e.target.dataset.tribeId;
      setLoading(true);
      // Clear any existing alerts
      setAlertOpen(false);
      fetch(`${apiUrl}tribe/admin/${tribeId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
        .then(response => {
          return response.json();
        })
        .then(reply => {
          if (reply.status === 'success') {
            setEditingTribe(reply.data);
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

    function deleteTribe(e) {
      const tribeId = e.target.dataset.tribeId;
      const tribeName = e.target.dataset.tribeName;

      Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete the tribe "${tribeName}". This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          setLoading(true);
          fetch(`${apiUrl}tribe/admin/${tribeId}`, {
            method: 'DELETE',
            headers: {
              authorization: localStorage.getItem('jwt')
            }
          })
            .then(response => response.json())
            .then(reply => {
              if (reply.status === 'success') {
                // Remove the deleted tribe from the list
                setTribes(prev => prev.filter(tribe => tribe.tribeId !== tribeId));
                setAlertOptions({
                  message: 'Tribe deleted successfully',
                  severity: 'success'
                });
                setAlertOpen(true);
              } else {
                setAlertOptions({
                  message: 'Error deleting tribe',
                  severity: 'error'
                });
                setAlertOpen(true);
                Swal.fire(
                  'Error!',
                  'There was an error deleting the tribe.',
                  'error'
                );
              }
            })
            .catch(err => {
              console.log(err);
              setAlertOptions({
                message: 'Error deleting tribe',
                severity: 'error'
              });
              setAlertOpen(true);
              Swal.fire(
                'Error!',
                'There was an error deleting the tribe.',
                'error'
              );
            })
            .finally(() => {
              setLoading(false);
            });
        }
      });
    }

    const rows = tribes.map(tribe => {
      return (
        <tr key={tribe.tribeId}>
          <td>
            <div className="d-flex align-items-center">
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: tribe.color || '#000000',
                  borderRadius: '50%',
                  marginRight: '10px',
                  border: '1px solid #ccc'
                }}
              ></div>
              {tribe.name}
            </div>
          </td>
          <td>{new Date(tribe.createdAt).toLocaleDateString()}</td>
          <td>
            <div className="admin-table-actions">
              <button className="btn btn-primary btn-sm edit-button" data-tribe-id={tribe.tribeId} onClick={editTribe}>Edit</button>
              <button className="btn btn-danger btn-sm delete-button" data-tribe-id={tribe.tribeId} data-tribe-name={tribe.name} onClick={deleteTribe}>Delete</button>
            </div>
          </td>
        </tr>
      )
    })

    return rows;
  }

  function TribeForm({ editingTribe }) {
    var heading = editingTribe ? `Edit Tribe: ${editingTribe.name}` : 'New Tribe';

    if (!editingTribe) {
      editingTribe = {
        name: '',
        color: '#000000'
      }
    }

    const [submitting, setSubmitting] = useState(false);

    function handleTribeSubmit(e) {
      e.preventDefault();
      const idArray = ['tribeId', 'name', 'color'];

      const bodyJSON = getFormValues(idArray);
      const bodySanitized = sanitizeFormValues(bodyJSON);
      const isEditing = bodySanitized.tribeId && bodySanitized.tribeId.trim() !== '';

      // Store tribeId for URL construction before potentially removing it
      const tribeId = bodySanitized.tribeId;

      // Remove tribeId from request body for POST requests (new tribes)
      if (!isEditing) {
        delete bodySanitized.tribeId;
      }

      const body = JSON.stringify(bodySanitized);

      console.log('Form submission data:', bodySanitized); // Debug log

      setEditingTribe(prev => ({
        ...prev,
        name: bodySanitized.name,
        color: bodySanitized.color
      }));

      setAlertOpen(false);
      setSubmitting(true);

      // Use PATCH for updates, POST for new tribes
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `${apiUrl}tribe/admin/${tribeId}` : `${apiUrl}tribe/admin`;

      fetch(url, {
        method: method,
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
          if (reply.status === 'success') {
            console.log(reply);
            setTimeout(() => {
              setSubmitting(false);
              setAlertOptions({
                message: 'Tribe Saved',
                severity: 'success'
              })
              setAlertOpen(true);
            }, 1000);
          } else {
            console.log(reply);
            setTimeout(() => {
              setAlertOptions({
                message: 'Error saving tribe',
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
              message: 'Error saving tribe',
              severity: 'error'
            });
            setSubmitting(false)
            setAlertOpen(true);
          }, 1000);
        })
    }

    function goBack(e) {
      e.preventDefault();
      setEditingTribe(null);
      setAlertOpen(false);
      setFormOpen(false);
    }

    return (
      <>
        <div className="admin-page-header">
          <h2>{heading}</h2>
        </div>
        <form onSubmit={handleTribeSubmit}>
          <input type="hidden" name="tribeId" id="tribeId" defaultValue={editingTribe.tribeId} />

          <div className="row">
            <div className="mb-3 col-md-8">
              <label htmlFor="name" className="form-label">Tribe Name:*</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                defaultValue={editingTribe.name}
                disabled={submitting}
                required
              />
            </div>
            <div className="mb-3 col-md-4">
              <label htmlFor="color" className="form-label">Tribe Color:*</label>
              <input
                type="color"
                className="form-control form-control-color"
                id="color"
                name="color"
                defaultValue={editingTribe.color}
                disabled={submitting}
                title="Choose your tribe color"
              />
            </div>
          </div>
          <div className="admin-button-group mt-4">
            {(() => {
              if (submitting) {
                return (
                  <>
                    <button disabled={true} type="button" className="btn btn-outline-secondary">Back</button>
                    <button type="submit" disabled={true} className="btn btn-primary">
                      <DotLoader color={"white"}></DotLoader>
                    </button>
                  </>
                )
              } else {
                return (
                  <>
                    <button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
                    <button type="submit" className="btn btn-primary">Save Tribe</button>
                  </>
                )
              }
            })()}
          </div>
        </form>
      </>
    )
  }

  function addTribe() {
    // Clear any existing alerts
    setAlertOpen(false);
    setFormOpen(true);
  }

  function closeAlert(e, reason) {
    if (reason === 'clickaway') return;
    setAlertOpen(false);
  }

  return (
    <>
      <Snackbar open={alertOpen} autoHideDuration={2000} onClose={closeAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={alertOptions.severity} sx={{ width: '100%' }} onClose={closeAlert}>{alertOptions.message}</Alert>
      </Snackbar>
      {(() => {
        if (formOpen) {
          return (
            <div className="admin-form-container">
              <TribeForm editingTribe={editingTribe}></TribeForm>
            </div>
          )
        } else {
          return (
            <>
              <div className="admin-page-header">
                <h2>Tribes</h2>
                <button className="btn btn-primary" onClick={addTribe}>Add Tribe</button>
              </div>
              <div className="admin-table-container">
                <table className="table table-striped admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TribesTbody></TribesTbody>
                  </tbody>
                </table>
              </div>
            </>
          )
        }
      })()}
    </>
  )
}

export default AdminTribes;