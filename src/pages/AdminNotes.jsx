import React, { useEffect, useState } from "react";
import AdminMain from "../components/AdminMain";
import WaterLoader from "../components/WaterLoader";
import { DateTime } from "luxon";
import DotLoader from "../components/DotLoader";
import { Alert, Snackbar } from "@mui/material";
import Swal from "sweetalert2";
import apiUrl from "../apiUrls";
import "../assets/admin-common.css";
import "../assets/admin-notes.css";

function AdminNotes() {

  const [view, setView] = useState('table');
  const [editingNote, setEditingNote] = useState(null);

  function Table() {

    const [notes, setNotes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    
    async function fetchNotes() {
      await fetch(`${apiUrl}adminNote`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => {
        return response.json();
      })
      .then(reply => {
        if(reply.status === 'success') {
          setNotes(reply.data);
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
      fetchNotes();
    },[]);

    if(loading) {
      return <WaterLoader></WaterLoader>
    }

    if(error) {
      return <p>Error loading notes</p>
    }

    function addNote() {
      setEditingNote(null);
      setView('form');
    }

    return (
      <>
        <div className="admin-page-header">
          <h2>Notes</h2>
          <button className="btn btn-primary" onClick={addNote}>Add Note</button>
        </div>
        <div className="admin-table-container">
          <table className="table table-striped admin-table notes-main-table">
            <thead>
              <tr>
                <th>Note</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                notes.map(note => {

                  function NoteContent({ note }) {
                    const [expanded, setExpanded] = useState(false);
                    const maxLength = 100; // Characters to show before truncating
                    const shouldTruncate = note.note.length > maxLength;
                    
                    const displayText = expanded ? note.note : note.note.substring(0, maxLength);
                    
                    return (
                      <div className="note-text-container">
                        {shouldTruncate && !expanded ? (
                          <>
                            {displayText}...
                            <button 
                              className="btn btn-link p-0 ms-1 text-decoration-none see-more-btn"
                              onClick={() => setExpanded(true)}
                            >
                              see more
                            </button>
                          </>
                        ) : (
                          <>
                            {displayText}
                            {shouldTruncate && expanded && (
                              <button 
                                className="btn btn-link p-0 ms-1 text-decoration-none see-more-btn"
                                onClick={() => setExpanded(false)}
                              >
                                see less
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  function editNote() {
                    setEditingNote(note);
                    setView('form');
                  }

                  function deleteNote() {
                    Swal.fire({
                      title: "Delete Note?",
                      showCancelButton: true
                    })
                    .then(reply => {
                      if(reply.isConfirmed) {
                        fetch(`${apiUrl}adminNote/${note.adminNoteId}`, {
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
                            fetchNotes();
                          } else {
                            console.log(reply);
                          }
                        })
                        .catch(err => {
                          console.log(err);
                        })
                      }
                    })
                  }

                  return (
                    <tr key={note.adminNoteId}>
                      <td className="note-content">
                        <NoteContent note={note} />
                      </td>
                      <td>
                        <span className="d-none d-md-inline">
                          {DateTime.fromISO(note.createdAt).toLocaleString(DateTime.DATE_SHORT)}
                        </span>
                        <span className="d-md-none">
                          {DateTime.fromISO(note.createdAt).toLocaleString({
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={editNote}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={deleteNote}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </>
    )
  }

  function Form() {
    const initialText = editingNote ? editingNote.note : '';

    const [noteText, setNoteText] = useState(initialText)
    const [submitting, setSubmitting] = useState(false);
    const [alertOptions, setAlertOptions] = useState({severity: null, message: null});
    const [alertOpen, setAlertOpen] = useState(false);

    function setText(e) {
      setNoteText(e.target.value);
    }

    function saveNote(e) {
      e.preventDefault();

      setSubmitting(true);

      const bodyJSON = {note: noteText};

      if(editingNote) bodyJSON.adminNoteId = editingNote.adminNoteId;

      fetch(`${apiUrl}adminNote`, {
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
          // successful save logic
          setTimeout(() => {
            setAlertOptions({
              message: 'Note Saved',
              severity: 'success'
            })
            setAlertOpen(true);
            setSubmitting(false);
            setTimeout(() => {
              setView('table');
            }, 2000);
          }, 1000);
        } else {
          // failed save logic
          setTimeout(() => {
            setAlertOptions({
              message: 'Error saving note',
              severity: 'error'
            });
            setAlertOpen(true);
            setSubmitting(false)
          }, 1000);
        }
      })
      .catch(err => {
        console.log(err);
        // failed save logic
        setTimeout(() => {
          setAlertOptions({
            message: 'Error saving note',
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

    const heading = editingNote ? 'Edit Note' : 'Add Note';

    return (
      <div className="admin-form-container">
        <div className="admin-page-header">
          <h2>{heading}</h2>
        </div>
        <form onSubmit={saveNote}>
          <div className="row">
            <div className="mb-3 col-12">
              <label htmlFor="note" className="form-label">Note*:</label>
              <textarea 
                className="form-control" 
                id="note"
                value={noteText} 
                onChange={setText}
                rows="6"
                placeholder="Enter your note here..."
              ></textarea>
            </div>
          </div>
          <div className="admin-button-group mt-4">
            {(() => {
              if(submitting) {
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
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setView('table')}>Back</button>
                    <button type="submit" className="btn btn-primary">Save Note</button>
                  </>
                )
              }
            })()}
          </div>
        </form>
        <Snackbar open={alertOpen} autoHideDuration={2000} onClose={closeAlert} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
          <Alert severity={alertOptions.severity} sx={{width: '100%'}} onClose={closeAlert}>{alertOptions.message}</Alert>
        </Snackbar>
      </div>
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
    <AdminMain page="admin-notes">
      <Content></Content>
    </AdminMain>
  )
}

export default AdminNotes;
