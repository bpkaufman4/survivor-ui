import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { Reorder } from "motion/react";
import Swal from "sweetalert2";
import { handlePost } from "../../helpers/helpers";
import apiUrl from "../../apiUrls";

export default function DraftSettingsModal({ leagueId, leagueName, onClose, onSave }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Default draft date to a week from today at 7 PM
  const defaultDraftDate = new Date();
  defaultDraftDate.setDate(defaultDraftDate.getDate() + 7);
  defaultDraftDate.setHours(19, 0, 0, 0);
  
  const [draftDate, setDraftDate] = useState(
    DateTime.fromJSDate(defaultDraftDate).toFormat("yyyy-MM-dd'T'HH:mm")
  );
  const [draftOrder, setDraftOrder] = useState([]);
  const [pickTimeHours, setPickTimeHours] = useState(0);
  const [pickTimeMinutes, setPickTimeMinutes] = useState(2);
  const [pickTimeSeconds, setPickTimeSeconds] = useState(0);
  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    async function fetchDraft() {
      try {
        const draftFetch = await fetch(`${apiUrl}draft/byLeague/${leagueId}`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        });

        const draftData = await draftFetch.json();
        
        if(draftData.data) {
          setHasDraft(true);

          const draftOrderTeams = draftData.data.draftOrder.map(o => o.team);
          setDraftOrder(draftOrderTeams);

          const startJsDate = new Date(draftData.data.startDate);
          setDraftDate(DateTime.fromJSDate(startJsDate).toFormat("yyyy-MM-dd'T'HH:mm"));
          
          // Check if draft has started
          const now = new Date();
          const draftStarted = now >= startJsDate;
          setIsDraftStarted(draftStarted);
          
          // Convert pickTimeSeconds to hours, minutes, seconds
          const totalSeconds = draftData.data.pickTimeSeconds || 120;
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          setPickTimeHours(hours);
          setPickTimeMinutes(minutes);
          setPickTimeSeconds(seconds);
        } else {
          setHasDraft(false);
          setIsDraftStarted(false);

          const teamFetch = await fetch(`${apiUrl}team/forDraft/${leagueId}`, {
            headers: {
              authorization: localStorage.getItem('jwt')
            }
          });
  
          const teamData = await teamFetch.json();

          if(teamData.status !== 'success') throw new Error("Team fetch error");

          setDraftOrder(teamData.data);
        }

      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDraft();
  }, [leagueId]);

  function changeStartDate(e) {
    if (isDraftStarted) return;
    setDraftDate(e.target.value);
  }

  function changeDraftOrder(data) {
    if (isDraftStarted) return;
    setDraftOrder(data);
  }

  function changePickTimeHours(e) {
    if (isDraftStarted) return;
    const hours = parseInt(e.target.value) || 0;
    setPickTimeHours(Math.max(0, Math.min(23, hours)));
  }
  
  function changePickTimeMinutes(e) {
    if (isDraftStarted) return;
    const minutes = parseInt(e.target.value) || 0;
    setPickTimeMinutes(Math.max(0, Math.min(59, minutes)));
  }
  
  function changePickTimeSeconds(e) {
    if (isDraftStarted) return;
    const seconds = parseInt(e.target.value) || 0;
    setPickTimeSeconds(Math.max(0, Math.min(59, seconds)));
  }

  function randomizeDraftOrder() {
    if (isDraftStarted) return;
    
    let array = [...draftOrder];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    setDraftOrder(array);
  }

  async function saveDraftSettings() {
    // Check if draft time is at least 5 minutes in the future
    const now = new Date();
    const draftStartTime = new Date(draftDate);
    const timeDifferenceMs = draftStartTime.getTime() - now.getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    
    if (timeDifferenceMs < fiveMinutesMs) {
      Swal.fire({
        text: 'Draft must be scheduled at least 5 minutes in the future to allow participants time to prepare.',
        toast: true,
        timer: 4000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'warning'
      });
      return;
    }
    
    // Double-check draft status at save time
    const draftHasStarted = now >= draftStartTime;
    
    if (isDraftStarted || draftHasStarted) {
      Swal.fire({
        text: 'Cannot save: Draft has already started',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'warning'
      });
      return;
    }

    const draftJsDate = new Date(draftDate);
    const startDate = DateTime.fromJSDate(draftJsDate).setZone('utc').toFormat("yyyy-MM-dd'T'HH:mm");

    // Convert hours, minutes, seconds to total seconds
    const totalPickTimeSeconds = (pickTimeHours * 3600) + (pickTimeMinutes * 60) + pickTimeSeconds;

    const order = draftOrder.map(t => t.teamId);
    
    try {
      const response = await handlePost(`draft/generate/${leagueId}`, {
        draftOrder: order, 
        draftDate: startDate, 
        pickTimeSeconds: totalPickTimeSeconds
      });
      
      if(response.status === 'success') {
        Swal.fire({
          text: 'Draft Settings Saved Successfully',
          toast: true,
          timer: 3000,
          showCancelButton: false,
          showConfirmButton: false,
          position: 'top',
          icon: 'success'
        });
        
        // Call onSave callback to refresh the parent table
        if (onSave) {
          onSave();
        }
        
        // Close the modal
        onClose();
      } else {
        Swal.fire({
          text: 'Error saving draft settings',
          toast: true,
          timer: 3000,
          showCancelButton: false,
          showConfirmButton: false,
          position: 'top',
          icon: 'error'
        });
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      Swal.fire({
        text: 'Error saving draft settings',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'error'
      });
    }
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading draft settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6>Error loading draft settings</h6>
        <p className="mb-0">Please try again or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Draft Settings - {leagueName}</h5>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>

      {isDraftStarted && hasDraft && (
        <div className="alert alert-warning mb-3" role="alert">
          <strong>Draft Started:</strong> Draft settings cannot be modified once the draft has begun.
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="startDate" className="form-label">Start Time</label>
        <input 
          type="datetime-local" 
          className="form-control" 
          value={draftDate} 
          onChange={changeStartDate}
          disabled={isDraftStarted}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Time Per Pick</label>
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="d-flex align-items-center">
            <input 
              type="number" 
              className="form-control" 
              style={{width: '80px'}} 
              value={pickTimeHours} 
              onChange={changePickTimeHours}
              min="0"
              max="23"
              disabled={isDraftStarted}
            />
            <small className="text-muted ms-1">hrs</small>
          </div>
          <div className="d-flex align-items-center">
            <input 
              type="number" 
              className="form-control" 
              style={{width: '80px'}} 
              value={pickTimeMinutes} 
              onChange={changePickTimeMinutes}
              min="0"
              max="59"
              disabled={isDraftStarted}
            />
            <small className="text-muted ms-1">min</small>
          </div>
          <div className="d-flex align-items-center">
            <input 
              type="number" 
              className="form-control" 
              style={{width: '80px'}} 
              value={pickTimeSeconds} 
              onChange={changePickTimeSeconds}
              min="0"
              max="59"
              disabled={isDraftStarted}
            />
            <small className="text-muted ms-1">sec</small>
          </div>
        </div>
        <small className="text-muted d-block">
          Total: {(pickTimeHours * 3600) + (pickTimeMinutes * 60) + pickTimeSeconds} seconds
        </small>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label mb-0">Draft Order</label>
          {!isDraftStarted && (
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary"
              onClick={randomizeDraftOrder}
            >
              Randomize
            </button>
          )}
        </div>
        
        <Reorder.Group 
          as="div" 
          axis="y" 
          values={draftOrder} 
          onReorder={isDraftStarted ? () => {} : changeDraftOrder}
        >
          {draftOrder.map((team, i) => (
            <Reorder.Item 
              as="div" 
              key={team.teamId} 
              value={team} 
              className={`btn btn-outline-dark text-dark bg-white mb-1 w-100 text-start align-items-center d-flex ${isDraftStarted ? 'pe-none' : ''}`}
              style={isDraftStarted ? {cursor: 'default'} : {}}
            >
              <span className="border-end border-dark pe-2 me-2">{i + 1}</span>
              <span>{team.owner.firstName} {team.owner.lastName} ({team.name})</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={saveDraftSettings}
          disabled={isDraftStarted}
        >
          Save Draft Settings
        </button>
      </div>
    </div>
  );
}
