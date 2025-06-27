import { useEffect, useState } from "react";
import Main from "../components/Main";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import { DateTime } from "luxon";

export default function Notes() {
  function Note({ note }) {
    const [expanded, setExpanded] = useState(false);

    const message = expanded ? note.note : note.note.slice(0, 100) + '...'
    const spanText = expanded ? 'Show Less' : 'Show More';

    return (
      <div className="col-12 mb-3">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="text-muted mb-0">
                {DateTime.fromISO(note.createdAt).toLocaleString(DateTime.DATETIME_SHORT)}
              </h6>
            </div>
            <p className="mb-2">{message}</p>
            {note.note.length > 100 && (
              <button 
                className="btn btn-link p-0 text-primary" 
                onClick={() => setExpanded(!expanded)}
              >
                {spanText}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  function Content() {

    const [notes, setNotes] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`${apiUrl}adminNote`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
        .then(response => response.json())
        .then(reply => {
          if (reply.status === 'success') {
            setNotes(reply.data);
          } else {
            console.log(reply);
            setError(true);
          }
        })
        .catch(err => {
          console.log(err);
          setError(true);
        })        .finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 300)
        });
    }, []);

    if (error) {
      return (
        <div className="container">
          <div className="alert alert-danger text-center">
            Something went wrong loading notes
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="d-flex w-100 justify-content-center my-5">
          <WaterLoader />
        </div>
      );
    }

    return (
      <div className="container">
        <h2 className="mb-4 text-center">Updates</h2>
        <div className="row g-3">
          {notes && notes.map(n => <Note key={n.adminNoteId} note={n} />)}
        </div>
        
        {(!notes || notes.length === 0) && (
          <div className="text-center py-5">
            <h4 className="text-muted">No Updates</h4>
            <p className="text-muted">There are no updates at this time.</p>
          </div>
        )}
      </div>
    )

  }

  return (<Main page={'notes'}>
    <Content></Content>
  </Main>)
}