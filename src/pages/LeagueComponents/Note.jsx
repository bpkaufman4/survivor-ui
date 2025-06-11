import ChatIcon from '@mui/icons-material/Chat';
import { useEffect, useState } from 'react';
import apiUrl from '../../apiUrls';
import Swal from 'sweetalert2';
import { DateTime } from 'luxon';

export default function Note() {
  const [latestNote, setLatestNote] = useState(null);
  const [unread, setUnread] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    function fetchLatestNote() {
      fetch(`${apiUrl}adminNote/latest`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setLatestNote(reply.data);
          if(localStorage.getItem('lastReadAdminNoteId') !== reply.data.adminNoteId) {
            setUnread(true);
          }
        }
      })
      .catch(err => {
        console.log(err);
        setError(true);
      })
    }

    fetchLatestNote();
  }, []);

  function viewNote() {
    const message = (latestNote && !error) ? latestNote.note : 'Something went wrong';
    const title = (latestNote && !error) ? DateTime.fromISO(latestNote.createdAt).toLocaleString(DateTime.DATETIME_SHORT) : ''
    Swal.fire({
      text: message,
      title
    })
    .then(() => {
      if(latestNote && !error) {
        localStorage.setItem('lastReadAdminNoteId', latestNote.adminNoteId);
        setUnread(false);
      }
    })
  }

  return (
    <button className={`btn ${unread && 'unread'}`} onClick={viewNote}>
      <ChatIcon />
    </button>
  )
}