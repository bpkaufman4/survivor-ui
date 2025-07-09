import { useEffect, useState } from "react"
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import { DateTime } from "luxon";
import { Reorder } from "motion/react"
import { Save } from "@mui/icons-material";
import Swal from "sweetalert2";
import { handlePatch, handlePost } from "../../helpers/helpers";

export default function Settings({ leagueId, leagueName, isDraftComplete, password, privateInd, playersExist, checkingPlayers }) {  const jsDate = new Date;
  // Set default date to a week from today at 7 PM
  const defaultDraftDate = new Date();
  defaultDraftDate.setDate(defaultDraftDate.getDate() + 7);
  defaultDraftDate.setHours(19, 0, 0, 0); // 7 PM
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draftDate, setDraftDate] = useState(DateTime.fromJSDate(defaultDraftDate).toFormat("yyyy-MM-dd'T'HH:mm"));
  const [leagueNameEdit, setLeagueName] = useState(leagueName);
  const [draftOrder, setDraftOrder] = useState([]);
  const [pickTimeHours, setPickTimeHours] = useState(0);
  const [pickTimeMinutes, setPickTimeMinutes] = useState(2);
  const [pickTimeSeconds, setPickTimeSeconds] = useState(0);  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [leaguePassword, setLeaguePassword] = useState(password || '');
  const [isPrivate, setIsPrivate] = useState(privateInd || false);

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
          
          // Check if draft has started (only based on start time)
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
          
          console.log(draftData);        
        } else {
          setHasDraft(false);
          setIsDraftStarted(false);

          // Set default draft date to a week from today at 7 PM
          const weekFromToday = new Date();
          weekFromToday.setDate(weekFromToday.getDate() + 7);
          weekFromToday.setHours(19, 0, 0, 0); // 7 PM
          setDraftDate(DateTime.fromJSDate(weekFromToday).toFormat("yyyy-MM-dd'T'HH:mm"));

          const teamFetch = await fetch(`${apiUrl}team/forDraft/${leagueId}`, {
            headers: {
              authorization: localStorage.getItem('jwt')
            }
          });
  
          const teamData = await teamFetch.json();

          if(teamData.status !== 'success') throw new Error("Team fetch error");;

          setDraftOrder(teamData.data);

        }

      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }    }
    fetchDraft();
  }, [leagueId]);

  // Monitor draft start time and update isDraftStarted exactly when draft starts
  useEffect(() => {
    if (!draftDate || !hasDraft) return;

    const draftStartTime = new Date(draftDate);
    const now = new Date();
    
    // If draft has already started, no need to set a timer
    if (now >= draftStartTime) {
      setIsDraftStarted(true);
      return;
    }

    // Calculate milliseconds until draft starts
    const msUntilDraftStarts = draftStartTime.getTime() - now.getTime();
    
    // Set a timeout to trigger exactly when the draft starts
    const timeoutId = setTimeout(() => {
      setIsDraftStarted(true);
    }, msUntilDraftStarts);    // Cleanup timeout if component unmounts or draftDate changes
    return () => clearTimeout(timeoutId);
  }, [hasDraft]); // Only run when hasDraft changes (page load), not when draftDate changes from user input

  if(loading) return <WaterLoader />
  if(error) return <p>Something went wrong</p>

  function changeStartDate(e) {
    if (isDraftStarted) return; // Prevent changes if draft has started
    setDraftDate(e.target.value);
  }

  function changeLeagueName(e) {
    setLeagueName(e.target.value);
  }
  function changePrivateToggle(e) {
    setIsPrivate(e.target.checked);
  }

  function changePassword(e) {
    setLeaguePassword(e.target.value);
  }

  function changeDraftOrder(data) {
    if (isDraftStarted) return; // Prevent changes if draft has started
    console.log(data);
    setDraftOrder(data);
  }
    function changePickTimeHours(e) {
    if (isDraftStarted) return; // Prevent changes if draft has started
    const hours = parseInt(e.target.value) || 0;
    setPickTimeHours(Math.max(0, Math.min(23, hours))); // Limit to 0-23 hours
  }
  
  function changePickTimeMinutes(e) {
    if (isDraftStarted) return; // Prevent changes if draft has started
    const minutes = parseInt(e.target.value) || 0;
    setPickTimeMinutes(Math.max(0, Math.min(59, minutes))); // Limit to 0-59 minutes
  }
  
  function changePickTimeSeconds(e) {
    if (isDraftStarted) return; // Prevent changes if draft has started
    const seconds = parseInt(e.target.value) || 0;
    setPickTimeSeconds(Math.max(0, Math.min(59, seconds))); // Limit to 0-59 seconds
  }
    function randomizeDraftOrder(e) {
    if (isDraftStarted) return; // Prevent randomization if draft has started
    
    let array = [...draftOrder];

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }

    setDraftOrder(array);
  }

  function setDraftError(bool) {
    if(bool) {
      Swal.fire({
        text: 'Error saving draft',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'error'
      });
    }
  }

  function setLeagueError(bool) {
    if(bool) {
      Swal.fire({
        text: 'Error saving league',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'error'
      });
    }
  }
  async function saveLeagueSettings() {
    const save = await handlePatch(`league/${leagueId}`, {
      name: leagueNameEdit,
      privateInd: isPrivate,
      password: isPrivate ? leaguePassword : null
    }, setLeagueError);
    console.log(save);
    if(save.status === 'success') {
      Swal.fire({
        text: 'League Saved',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'success'
      })
    }
    return;
  }async function saveDraftSettings() {
    // Check if draft time is at least 5 minutes in the future
    const now = new Date();
    const draftStartTime = new Date(draftDate);
    const timeDifferenceMs = draftStartTime.getTime() - now.getTime();
    const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
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
    const save = await handlePost(`draft/generate/${leagueId}`, {
      draftOrder: order, 
      draftDate: startDate, 
      pickTimeSeconds: totalPickTimeSeconds
    }, setDraftError);
    console.log(save);
    if(save.status === 'success') {
      Swal.fire({
        text: 'League Saved',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'success'
      })
    }
    return;
  }
  return (
    <div className="settings-container">
      {/* League Settings Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-dark text-white">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="card-title mb-0">League Settings</h5>
            <button onClick={saveLeagueSettings} className="btn btn-outline-light btn-sm">
              <Save fontSize="small" className="me-1" />
              Save
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="leagueName" className="form-label fw-semibold">League Name</label>
            <input 
              type="text" 
              className="form-control" 
              id="leagueName"
              value={leagueNameEdit} 
              onChange={changeLeagueName} 
            />
          </div>
          
          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="privateToggle"
              checked={isPrivate}
              onChange={changePrivateToggle}
            />
            <label className="form-check-label fw-semibold" htmlFor="privateToggle">
              Private League
            </label>
          </div>
          
          {isPrivate && (
            <div className="mb-3">
              <label htmlFor="leaguePassword" className="form-label fw-semibold">League Password</label>
              <input 
                type="text" 
                className="form-control" 
                id="leaguePassword"
                value={leaguePassword}
                onChange={changePassword}
                placeholder="Enter a password for your league"
              />
              <div className="form-text">
                Players will need this password to join your private league.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draft Settings Card */}
      {!isDraftComplete && playersExist && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">Draft Settings</h5>
              <button 
                onClick={saveDraftSettings} 
                className="btn btn-outline-light btn-sm" 
                disabled={isDraftStarted}
              >
                <Save fontSize="small" className="me-1" />
                Save
              </button>
            </div>
          </div>
          <div className="card-body">
            {isDraftStarted && hasDraft && (
              <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
                <span className="me-2">⚠️</span>
                <div>
                  <strong>Draft Started:</strong> Draft settings cannot be modified once the draft has begun.
                </div>
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="startDate" className="form-label fw-semibold">Draft Start Time</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                id="startDate"
                value={draftDate} 
                onChange={changeStartDate}
                disabled={isDraftStarted}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Time Per Pick</label>
              <div className="row g-2 mb-2">
                <div className="col-auto">
                  <div className="input-group input-group-sm">
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
                    <span className="input-group-text">hrs</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="input-group input-group-sm">
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
                    <span className="input-group-text">min</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="input-group input-group-sm">
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
                    <span className="input-group-text">sec</span>
                  </div>
                </div>
              </div>
              <small className="text-muted">
                Total: <span className="fw-semibold">{(pickTimeHours * 3600) + (pickTimeMinutes * 60) + pickTimeSeconds}</span> seconds per pick
              </small>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label fw-semibold mb-0">Draft Order</label>
                {!isDraftStarted && (
                  <button 
                    onClick={randomizeDraftOrder} 
                    className="btn btn-outline-secondary btn-sm"
                  >
                    🎲 Randomize
                  </button>
                )}
              </div>
              {!isDraftStarted && (
                <small className="text-muted mb-3 d-block">
                  Drag and drop teams to reorder, or use the randomize button
                </small>
              )}
          </div>
          <Reorder.Group as="div" axis="y" values={draftOrder} onReorder={isDraftStarted ? () => {} : changeDraftOrder}>
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
      </div>
      )}

      {/* No Players Alert */}
      {!isDraftComplete && !checkingPlayers && !playersExist && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">Draft Settings</h5>
            </div>
          </div>
          <div className="card-body">
            <div className="alert mb-0 d-flex align-items-center" role="alert">
              <div>
                <strong>No Players Available:</strong> Draft settings are not available until players have been added for the current season. Check back in once the roster is announced to set your draft date and order!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Complete Alert */}
      {isDraftComplete && (
        <div className="card shadow-sm border-success">
          <div className="card-body">
            <div className="alert alert-success mb-0 d-flex align-items-center" role="alert">
              <span className="me-2">✅</span>
              <div>
                <strong>Draft Complete:</strong> The draft for this league has been completed. Draft settings are no longer available.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return <></>
}