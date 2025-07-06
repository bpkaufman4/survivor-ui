import React, { useEffect, useState } from "react";
import AdminMain from "../components/AdminMain";
import WaterLoader from "../components/WaterLoader";
import DotLoader from "../components/DotLoader";
import { Alert, Snackbar } from "@mui/material";
import Swal from "sweetalert2";
import apiUrl from "../apiUrls";
import "../assets/admin-common.css";

function AdminStatistics() {

  const [view, setView] = useState('table');
  const [editingStatistic, setEditingStatistic] = useState(null);

  function Table() {

    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    
    async function fetchStatistics() {
      await fetch(`${apiUrl}statistic`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => {
        return response.json();
      })
      .then(reply => {
        if(reply.status === 'success') {
          setStatistics(reply.data);
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
        }, 1000)
      })
    }

    useEffect(() => {
      fetchStatistics();
    },[]);

    if(loading) {
      return <WaterLoader></WaterLoader>
    }

    if(error) {
      return <p>Error loading statistics</p>
    }

    function addStatistic() {
      setEditingStatistic(null);
      setView('form');
    }

    return (
      <>
        <div className="d-flex justify-content-between py-3">
            <h2 className="w-auto">Statistics</h2>
            <button className="btn btn-primary" onClick={addStatistic}>Add Statistic</button>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">            <thead>
              <tr>
                <th>Name</th>
                <th>Default Points</th>
                <th>Description</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                statistics.map(statistic => {

                  function editStatistic() {
                    setEditingStatistic(statistic);
                    setView('form');
                  }

                  function deleteStatistic() {
                    Swal.fire({
                      title: "Delete Statistic?",
                      text: `This will permanently delete the statistic "${statistic.name}".`,
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      confirmButtonText: 'Delete'
                    })
                    .then(reply => {
                      if(reply.isConfirmed) {
                        fetch(`${apiUrl}statistic/${statistic.statisticId}`, {
                          method: 'DELETE',
                          headers: {
                            authorization: localStorage.getItem('jwt')
                          }
                        })
                        .then(response => {
                          return response.json();
                        })
                        .then(reply => {
                          if(reply.status === 'success') {
                            fetchStatistics();
                            Swal.fire({
                              title: 'Deleted!',
                              text: 'Statistic has been deleted.',
                              icon: 'success',
                              timer: 2000,
                              showConfirmButton: false
                            });
                          } else {
                            console.log(reply);
                            Swal.fire({
                              title: 'Error',
                              text: 'Failed to delete statistic.',
                              icon: 'error'
                            });
                          }
                        })
                        .catch(err => {
                          console.log(err);
                          Swal.fire({
                            title: 'Error',
                            text: 'Failed to delete statistic.',
                            icon: 'error'
                          });
                        })
                      }
                    })
                  }

                  return (                    <tr key={statistic.statisticId}>
                      <td className="fw-bold">{statistic.name}</td>
                      <td>{statistic.defaultPoints}</td>
                      <td>
                        {statistic.description ? 
                          <span title={statistic.description}>
                            {statistic.description.length > 50 ? 
                              `${statistic.description.substring(0, 50)}...` : 
                              statistic.description
                            }
                          </span> : 
                          '-'
                        }
                      </td>
                      <td><button className="btn btn-sm btn-primary" onClick={editStatistic}>Edit</button></td>
                      <td><button className="btn btn-sm btn-danger" onClick={deleteStatistic}>Delete</button></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
        {statistics.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No statistics found. Add your first statistic to get started.</p>
          </div>
        )}
      </>
    )
  }

  function Form() {    const initialData = editingStatistic ? {
      name: editingStatistic.name,
      defaultPoints: editingStatistic.defaultPoints,
      description: editingStatistic.description || ''
    } : {
      name: '',
      defaultPoints: 0,
      description: ''
    };

    const [formData, setFormData] = useState(initialData);
    const [submitting, setSubmitting] = useState(false);
    const [alertOptions, setAlertOptions] = useState({severity: null, message: null});
    const [alertOpen, setAlertOpen] = useState(false);

    function handleInputChange(e) {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }));
    }

    function saveStatistic(e) {
      e.preventDefault();

      if (!formData.name.trim()) {
        setAlertOptions({
          message: 'Name is required',
          severity: 'error'
        });
        setAlertOpen(true);
        return;
      }

      setSubmitting(true);

      const bodyJSON = { ...formData };
      if(editingStatistic) bodyJSON.statisticId = editingStatistic.statisticId;

      fetch(`${apiUrl}statistic`, {
        method: 'POST',
        headers: {
          authorization: localStorage.getItem('jwt'),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyJSON)
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setTimeout(() => {
            setAlertOptions({
              message: editingStatistic ? 'Statistic Updated' : 'Statistic Created',
              severity: 'success'
            })
            setAlertOpen(true);
            setSubmitting(false);
            setTimeout(() => {
              setView('table');
            }, 2000);
          }, 1000);
        } else {
          setTimeout(() => {
            setAlertOptions({
              message: 'Error saving statistic',
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
            message: 'Error saving statistic',
            severity: 'error'
          });
          setAlertOpen(true);
          setSubmitting(false)
        }, 1000);
      })
    }

  
    function closeAlert(e, reason) {
      if(reason === 'clickaway') return;
      setAlertOpen(false);
    }

    return (
      <>
        <Snackbar open={alertOpen} autoHideDuration={2000} onClose={closeAlert} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
          <Alert severity={alertOptions.severity} sx={{width: '100%'}} onClose={closeAlert}>{alertOptions.message}</Alert>
        </Snackbar>
        <h2>{editingStatistic ? 'Edit Statistic' : 'Add New Statistic'}</h2>        <form onSubmit={saveStatistic}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label">Name*:</label>
              <input 
                type="text" 
                className="form-control" 
                id="name"
                name="name"
                value={formData.name} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="defaultPoints" className="form-label">Default Points*:</label>
              <input 
                type="number" 
                className="form-control" 
                id="defaultPoints"
                name="defaultPoints"
                value={formData.defaultPoints} 
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 mb-3">
              <label htmlFor="description" className="form-label">Description:</label>
              <textarea 
                className="form-control" 
                id="description"
                name="description"
                rows="4"
                value={formData.description} 
                onChange={handleInputChange}
                placeholder="Detailed description of this statistic..."
              />
            </div>
          </div>
          <div className="d-flex justify-content-between py-3">
            {(() => {
              if(submitting) {
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
                    <button type="button" className="btn btn-outline-primary" onClick={() => setView('table')}>Back</button>
                    <button type="submit" className="btn btn-primary">
                      {editingStatistic ? 'Update' : 'Create'} Statistic
                    </button>
                  </>
                )
              }
            })()}
          </div>
        </form>
      </>
    )
  }

  function Content() {
    switch(view) {
      default:
      case 'table':
        return <Table></Table>
      case 'form':
        return <Form></Form>
    }
  }

  return (
    <AdminMain page="admin-statistics">
      <Content></Content>
    </AdminMain>
  )
}

export default AdminStatistics;
