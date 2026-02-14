import { useEffect, useState } from "react"
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import { DateTime } from "luxon";
import { Reorder } from "motion/react"
import { Save } from "@mui/icons-material";
import Swal from "sweetalert2";
import { handlePatch, handlePost } from "../../helpers/helpers";

export default function Settings({ leagueId, leagueName, isDraftComplete, password, privateInd, playersExist, checkingPlayers, draftEnabled }) {
  const jsDate = new Date;
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
  const [pickTimeSeconds, setPickTimeSeconds] = useState(0);

  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [leaguePassword, setLeaguePassword] = useState(password || '');
  const [isPrivate, setIsPrivate] = useState(privateInd || false);
  const [isDraftEnabled, setIsDraftEnabled] = useState(draftEnabled || false);

  useEffect(() => {
    async function fetchDraft() {
      try {
        const draftFetch = await fetch(`${apiUrl}draft/byLeague/${leagueId}`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        });

        const draftData = await draftFetch.json();

        if (draftData.data) {
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

          if (teamData.status !== 'success') throw new Error("Team fetch error");;

          setDraftOrder(teamData.data);

        }

      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }
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
    }, msUntilDraftStarts);

    // Cleanup timeout if component unmounts or draftDate changes
    return () => clearTimeout(timeoutId);
  }, [hasDraft, draftDate]); // Run when hasDraft or draftDate changes

  if (loading) return <WaterLoader />
  if (error) return <p>Something went wrong</p>

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
  // function changeDraftEnabledToggle(e) {
  //   setIsDraftEnabled(e.target.checked);
  // }

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
    if (bool) {
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
    if (bool) {
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
      password: isPrivate ? leaguePassword : null,
      // draftEnabled: isDraftEnabled // Not editable by user
    }, setLeagueError);
    console.log(save);
    if (save.status === 'success') {
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

  async function saveDraftSettings() {
    // Check if draft time is at least 5 minutes in the future
    const now = new Date();
    const draftStartTime = new Date(draftDate);
    const timeDifferenceMs = draftStartTime.getTime() - now.getTime();
    const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Only check if creating a new draft or updating before start
    // If draft already exists and we're just updating it, allow flexible updates unless it's started
    if (!hasDraft && timeDifferenceMs < fiveMinutesMs) {
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
    // But allow saving if we are just reordering or changing settings before it starts
    const draftHasStarted = now >= draftStartTime;

    if (isDraftStarted || (draftHasStarted && hasDraft)) {
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
    if (save.status === 'success') {
      Swal.fire({
        text: 'Draft Settings Saved',
        toast: true,
        timer: 3000,
        showCancelButton: false,
        showConfirmButton: false,
        position: 'top',
        icon: 'success'
      });
      setHasDraft(true);
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
      {isDraftEnabled && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-dark text-white">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">Draft Configuration</h5>
              <button
                onClick={saveDraftSettings}
                className="btn btn-outline-light btn-sm"
                disabled={isDraftStarted}
              >
                <Save fontSize="small" className="me-1" />
                Save Draft Settings
              </button>
            </div>
          </div>
          <div className="card-body">
            {isDraftStarted && (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Draft has already started. Settings cannot be changed.
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="draftDate" className="form-label fw-bold">Draft Start Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                id="draftDate"
                value={draftDate}
                onChange={changeStartDate}
                disabled={isDraftStarted}
              />
              <div className="form-text">Draft must be scheduled at least 5 minutes in the future.</div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Time Per Pick</label>
              <div className="d-flex align-items-center gap-2">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={pickTimeHours}
                    onChange={changePickTimeHours}
                    min="0"
                    max="23"
                    disabled={isDraftStarted}
                  />
                  <span className="input-group-text">Hrs</span>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={pickTimeMinutes}
                    onChange={changePickTimeMinutes}
                    min="0"
                    max="59"
                    disabled={isDraftStarted}
                  />
                  <span className="input-group-text">Mins</span>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={pickTimeSeconds}
                    onChange={changePickTimeSeconds}
                    min="0"
                    max="59"
                    disabled={isDraftStarted}
                  />
                  <span className="input-group-text">Secs</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold mb-0">Draft Order</label>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={randomizeDraftOrder}
                  disabled={isDraftStarted}
                >
                  <i className="bi bi-shuffle me-1"></i> Randomize
                </button>
              </div>

              <div className="border rounded p-2 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Reorder.Group axis="y" values={draftOrder} onReorder={changeDraftOrder}>
                  {draftOrder.map((team, index) => (
                    <Reorder.Item key={team.teamId} value={team} dragListener={!isDraftStarted}>
                      <div className="d-flex align-items-center bg-white p-2 mb-2 rounded shadow-sm border">
                        <span className="badge bg-secondary me-2">{index + 1}</span>
                        <div className="text-truncate">{team.name}</div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {draftOrder.length === 0 && (
                  <div className="text-center text-muted py-3">No teams joined yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )

}