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
      <div key={note.adminNoteId}>
        <strong>{DateTime.fromISO(note.createdAt).toLocaleString(DateTime.DATETIME_SHORT)}</strong>
        <p>{message} <span className="btn-link text-primary" onClick={() => setExpanded(!expanded)}>{spanText}</span></p>
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
        })
        .finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 300)
        })
    }, [])

    if (error) return <p>Something went wrong</p>

    if (loading) return <WaterLoader></WaterLoader>

    return (
      <>
        <h3>Updates</h3>
        {notes && notes.map(n => <Note note={n}></Note>)}
      </>
    )

  }

  return (<Main page={'notes'}>
    <Content></Content>
  </Main>)
}