import { useEffect, useState } from "react"
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import { DateTime } from "luxon";
import { Reorder } from "motion/react"
import { Save } from "@mui/icons-material";
import Swal from "sweetalert2";
import { handlePatch, handlePost } from "../../helpers/helpers";

export default function Settings({ leagueId, leagueName, isDraftComplete }) {
  const jsDate = new Date;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draftDate, setDraftDate] = useState(DateTime.fromJSDate(jsDate).toFormat("yyyy-MM-dd'T'HH:mm"));
  const [leagueNameEdit, setLeagueName] = useState(leagueName);
  const [draftOrder, setDraftOrder] = useState([]);

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

          const draftOrderTeams = draftData.data.draftOrder.map(o => o.team);
          setDraftOrder(draftOrderTeams);

          const startJsDate = new Date(draftData.data.startDate);
          setDraftDate(DateTime.fromJSDate(startJsDate).toFormat("yyyy-MM-dd'T'HH:mm"));
          console.log(draftData);
        } else {

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
      }

    }

    fetchDraft();
  }, [leagueId])

  if(loading) return <WaterLoader />
  if(error) return <p>Something went wrong</p>

  function saveDraft() {
    // save draft
  }

  function changeStartDate(e) {
    setDraftDate(e.target.value);
  }

  function changeLeagueName(e) {
    setLeagueName(e.target.value);
  }

  function changeDraftOrder(data) {
    console.log(data);
    setDraftOrder(data);
  }
  
  function randomizeDraftOrder(e) {
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
    const save = await handlePatch(`league/${leagueId}`, {name: leagueNameEdit}, setLeagueError);
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

  async function saveDraftSettings() {

    const draftJsDate = new Date(draftDate);
    const startDate = DateTime.fromJSDate(draftJsDate).setZone('utc').toFormat("yyyy-MM-dd'T'HH:mm");

    const order = draftOrder.map(t => t.teamId);
    const save = await handlePost(`draft/generate/${leagueId}`, {draftOrder: order, draftDate: startDate, setDraftError});
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
    <>
      <h5 className="d-flex align-items-center justify-content-between">
        <span>League Settings</span>
        <button onClick={saveLeagueSettings} className="btn"><Save></Save></button>
        </h5>
      <label htmlFor="leagueName" className="form-label">Name</label>
      <input type="text" className="form-control mb-3" value={leagueNameEdit} onChange={changeLeagueName} />
      {!isDraftComplete && (
        <>
          <h5 className="d-flex align-items-center justify-content-between">
            <span>Draft Settings</span>
            <button onClick={saveDraftSettings} className="btn"><Save></Save></button>
          </h5>
          <label htmlFor="startDate" className="form-label">Start Time</label>
          <input type="datetime-local" className="form-control mb-3" value={draftDate} onChange={changeStartDate}/>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="form-label w-auto m-0">Draft Order (Drag and drop or <span onClick={randomizeDraftOrder} className="text-primary text-decoration-underline">randomize</span>)</p>
          </div>
          <Reorder.Group as="div" axis="y" values={draftOrder} onReorder={changeDraftOrder}>
            {draftOrder.map((team, i) => (
              <Reorder.Item as="div" key={team.teamId} value={team} className="btn btn-outline-dark text-dark bg-white mb-1 w-100 text-start align-items-center d-flex">
                <span className="border-end border-dark pe-2 me-2">{i + 1}</span>
                <span>{team.owner.firstName} {team.owner.lastName} ({team.name})</span>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </>
      )}
      {isDraftComplete && (
        <div className="alert alert-info mt-3" role="alert">
          <strong>Draft Complete:</strong> The draft for this league has been completed. Draft settings are no longer available.
        </div>
      )}
    </>
  )

  return <></>
}