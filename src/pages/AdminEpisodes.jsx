import { useState, useEffect } from "react";
import AdminMain from "../components/AdminMain";
import DotLoader from "../components/DotLoader";
import { Alert, Snackbar } from "@mui/material";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import WaterLoader from "../components/WaterLoader";
import apiUrl from "../apiUrls";
import { sanitizeFormValues, getFormValues } from "../helpers/helpers";

function AdminEpisode() {
  
  const [view, setView] = useState('table');
  const [editingEpisode, setEditingEpisode] = useState(null);

  const [alertOptions, setAlertOptions] = useState({severity: null, message: null});
  const [alertOpen, setAlertOpen] = useState(false);

  // Table Component

  function EpisodesTable() {
    const [episodes, setEpisodes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    async function fetchEpisodes() {
      await fetch(`${apiUrl}episode/admin`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => {
        return response.json();
      })
      .then(reply => {
        if(reply.status === 'success') {
          setEpisodes(reply.data);
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
        }, 500);
      })
    }

    useEffect(() => {
      fetchEpisodes();
    }, []);

    if(loading) {
      return <WaterLoader></WaterLoader>
    }

    if(error) {
      return (
        <tr>
          <td colSpan={7} className="text-center">Something went wrong</td>
        </tr>
      )
    }


    const rows = episodes.map(episode => {
      
      function editEpisode() {
        setEditingEpisode(episode);
        setView('form')
      }

      function setScores() {
        setEditingEpisode(episode);
        setView('scores');
      }

      function deleteEpisode() {
        Swal.fire({
          title: "Delete Episode?",
          text: `${episode.title || 'The episode'} on ${DateTime.fromISO(episode.airDate).toLocaleString(DateTime.DATETIME_SHORT)}`,
          showCancelButton: true
        })
        .then(reply => {
          if(reply.isConfirmed) {
            fetch(`${apiUrl}episode/${episode.episodeId}`, {
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
                fetchEpisodes();
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
        <tr key={episode.episodeId}>
          <td>{episode.title || "(No title)"}</td>
          <td>{DateTime.fromISO(episode.airDate).toLocaleString(DateTime.DATETIME_SHORT)}</td>
          <td><button className="btn btn-primary" onClick={setScores}>Set Scores</button></td>
          <td><button className="btn btn-primary" onClick={editEpisode}>Edit</button></td>
          <td><button className="btn btn-primary" onClick={deleteEpisode}>Delete</button></td>
        </tr>
      )
    })
    
    function addEpisode(e) {
      e.preventDefault();
      setEditingEpisode(null)
      setView('form');
    }

    return (
      <>
        <div className="d-flex justify-content-between py-3">
          <h2 className="w-auto">Episodes</h2>
          <button className="btn btn-primary" onClick={addEpisode}>Add Episode</button>
        </div>
        <table className="w-100">
        <thead>
            <tr>
                <th>Title</th>
                <th>Air Date</th>
            </tr>
        </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </>
    )

  }

  // Form Component

  function EpisodeForm({ episode }) {
    const [submitting, setSubmitting] = useState(false);
    
    let title, airDate, episodeId;

    if(!episode) {
      title = null;
      airDate = null;
    } else {
      episodeId = episode.episodeId;
      title = episode.title;
      const airJSDate = new Date(episode.airDate);
      airDate = DateTime.fromJSDate(airJSDate).toFormat("yyyy-MM-dd'T'HH:mm");
    }

    function goBack(e) {
      e.preventDefault();
      setEditingEpisode(null);
      setView('table');
    }

    function submitEpisode(e) {
      e.preventDefault();

      setSubmitting(true);
      const idArray = ['airDate', 'title'];

      const bodyJSON = getFormValues(idArray);
      let bodySanitized = sanitizeFormValues(bodyJSON);
      if(episodeId) bodySanitized.episodeId = episodeId;
      if(bodySanitized.airDate) {
        const airJSDate = new Date(bodySanitized.airDate);
        bodySanitized.airDate = DateTime.fromJSDate(airJSDate).setZone('utc').toFormat("yyyy-MM-dd'T'HH:mm");
      }

      const body = JSON.stringify(bodySanitized);

      fetch(`${apiUrl}episode`, {
        method: "POST",
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
        if(reply.status === 'success') {
          // successful save logic
          setTimeout(() => {
            setAlertOptions({
              message: 'Player Saved',
              severity: 'success'
            })
            setAlertOpen(true);
            setTimeout(() => {
              setSubmitting(false);
              setView('table');
            }, 2000);
          }, 1000);
        } else {
          // failed save logic
          setTimeout(() => {
            setAlertOptions({
              message: 'Error saving episode',
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
            message: 'Error saving episode',
            severity: 'error'
          });
          setAlertOpen(true);
          setSubmitting(false)
        }, 1000);
      })
      .finally(() => {
        setTimeout(() => {
          setSubmitting(false);
        }, 500)
      })
    }

    return (
      <form onSubmit={submitEpisode}>
        <div className="row">
          <div className="mb-3">
            <label htmlFor="airDate" className="col-form-label">Air Date*:</label>
            <input type="datetime-local" defaultValue={airDate} className="form-control" id="airDate"/>
          </div>
          <div className="mb-3">
            <label htmlFor="title" className="col-form-label">Title:</label>
            <input type="text" defaultValue={title} className="form-control" id="title"/>
          </div>
        </div>
        <div className="d-flex justify-content-between">
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
                  <button type="button" className="btn btn-outline-primary" onClick={goBack}>Back</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </>
              )
            }
          })()}
        </div>
      </form>
    )
  }

  function EpisodeSetScores({ episode }) {
    const [players, setPlayers] = useState([]);
    const [labels, setLabels] = useState([]);

    useEffect(() => {
      function fetchPlayers() {
        fetch(`${apiUrl}episodeStatistic/forSetScores/${episode.episodeId}`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        })
        .then(response => {
          return response.json();
        })
        .then(reply => {
          if(reply.status === 'success') {
            setPlayers(reply.data.players)
            setLabels(reply.data.labels)
            console.log(reply);
          } else {
            console.log(reply);
          }
        })
        .catch(err => {
          console.log(err);
        });
      }

      fetchPlayers();
    }, [episode.episodeId])

    function PlayerRow({player}) {

      function EpisodeStatisticInput({episodeStatistic}) {
        const [episodeStatisticId, setEpisodeStatisticId] = useState(episodeStatistic.episodeStatisticId || null);
        const [points, setPoints] = useState(episodeStatistic.points);

        function changePoints(e) {
          console.log(e.target.value);
          setPoints(e.target.value);

          const bodyJSON = {
            playerId: episodeStatistic.playerId,
            statisticId: episodeStatistic.statisticId,
            episodeId: episodeStatistic.episodeId,
            points: e.target.value
          }

          if(episodeStatisticId) bodyJSON.episodeStatisticId = episodeStatisticId;

          fetch(`${apiUrl}episodeStatistic`, {
            method: "POST",
            body: JSON.stringify(bodyJSON),
            headers: {
              authorization: localStorage.getItem('jwt'),
              "Content-Type": "Application/Json"
            }
          })
          .then(response => {
            return response.json();
          })
          .then(reply => {
            setEpisodeStatisticId(reply.data.episodeStatisticId);
            console.log(reply);
          })
          .catch(err => {
            console.log(err);
          })

        }
        return <td>
          <input value={points} className="w-100 form-control points-input" onChange={changePoints} type="number" />
        </td>
      }

      const [eliminated, setEliminated] = useState(player.eliminated === 1);

      function setPlayerEliminated(e) {
        setEliminated(e.target.checked);

        const body = {
          episodeId: (eliminated ? episode.episodeId : null),
          playerId: player.playerId
        }

        fetch(`${apiUrl}player/setEliminated`, {
          body: JSON.stringify(body),
          method: 'POST',
          headers: {
            authorization: localStorage.getItem('jwt'),
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          return response.json();
        })
        .then(reply => {
          console.log(reply.data);
        })
        .catch(err => {
          console.log(err);
        });
      }

      return (
        <tr>
          <td>{player.firstName} {player.lastName}</td>
          <td><input type="checkbox" checked={eliminated} onChange={setPlayerEliminated}/></td>
          {player.stats.map(stat => {
            return <EpisodeStatisticInput episodeStatistic={stat} key={`${stat.statisticId}${stat.playerId}`}></EpisodeStatisticInput>
          })}
        </tr>
      )
    }

    function goBack() {
      setView('table');
    }

    return (
      <>
        <div className="d-flex justify-content-between my-3">
          <h2>{episode.title || '(No Title)'}</h2>
          <button className="btn btn-primary" onClick={goBack}>Go Back</button>
        </div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Elimination</th>
              {labels.map((label, i) => {
                return <th key={`${label}${i}`}>{label}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let rows = [];
              for(const key in players) {
                const player = players[key];
                rows.push(<PlayerRow player={player} key={player.playerId}></PlayerRow>)
              }
              return rows;
            })()}
          </tbody>
        </table>
      </>
    )
  }

  const Content = () => {
    switch(view) {
      default:
      case 'table':
        return <EpisodesTable></EpisodesTable>
      case 'form':
        return <EpisodeForm episode={editingEpisode}></EpisodeForm>
      case 'scores':
        return <EpisodeSetScores episode={editingEpisode}></EpisodeSetScores>
    }
  }

  function closeAlert(e, reason) {
    if(reason === 'clickaway') return;
    setAlertOpen(false);
  }

  return (
    <AdminMain page="admin-episodes">
      <Content></Content>
      <Snackbar open={alertOpen} autoHideDuration={2000} onClose={closeAlert} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
        <Alert severity={alertOptions.severity} sx={{width: '100%'}} onClose={closeAlert}>{alertOptions.message}</Alert>
      </Snackbar>
    </AdminMain>
  )
}

export default AdminEpisode;