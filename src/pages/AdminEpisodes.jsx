import { useState, useEffect } from "react";
import AdminMain from "../components/AdminMain";
import DotLoader from "../components/DotLoader";
import { Alert, Snackbar } from "@mui/material";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import WaterLoader from "../components/WaterLoader";
import apiUrl from "../apiUrls";
import { sanitizeFormValues, getFormValues } from "../helpers/helpers";
import "../assets/admin-common.css";
import "../assets/admin-episodes.css";

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
          <td>
            <span className="d-none d-md-inline">
              {DateTime.fromISO(episode.airDate).toLocaleString(DateTime.DATETIME_SHORT)}
            </span>
            <span className="d-md-none">
              {DateTime.fromISO(episode.airDate).toLocaleString({
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                hour12: true
              })}
            </span>
          </td>
          <td>
            <div className="admin-table-actions">
              <button className="btn btn-primary btn-sm" onClick={setScores}>Set Scores</button>
              <button className="btn btn-secondary btn-sm" onClick={editEpisode}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={deleteEpisode}>Delete</button>
            </div>
          </td>
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
        <div className="admin-page-header">
          <h2>Episodes</h2>
          <button className="btn btn-primary" onClick={addEpisode}>Add Episode</button>
        </div>
        <div className="admin-table-container">
          <table className="table table-striped admin-table episodes-main-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Air Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
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

    const heading = episode ? 'Edit Episode' : 'Add Episode';

    return (
      <div className="admin-form-container">
        <div className="admin-page-header">
          <h2>{heading}</h2>
        </div>
        <form onSubmit={submitEpisode}>
          <div className="row">
            <div className="mb-3 col-md-6">
              <label htmlFor="airDate" className="form-label">Air Date*:</label>
              <input type="datetime-local" defaultValue={airDate} className="form-control" id="airDate"/>
            </div>
            <div className="mb-3 col-md-6">
              <label htmlFor="title" className="form-label">Title:</label>
              <input type="text" defaultValue={title} className="form-control" id="title"/>
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
                    <button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
                    <button type="submit" className="btn btn-primary">Save Episode</button>
                  </>
                )
              }
            })()}
          </div>
        </form>
      </div>
    )
  }

  function EpisodeSetScores({ episode }) {
    const [players, setPlayers] = useState([]);
    const [labels, setLabels] = useState([]);
    const [tableHeight, setTableHeight] = useState('70vh');

    function calculateTableHeight() {
      // Wait for DOM to be ready and allow for any dynamic content to render
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Get the container-fluid padding that wraps all admin content
          const containerFluid = document.querySelector('.container-fluid');
          const containerFluidPadding = containerFluid ? 
            parseInt(window.getComputedStyle(containerFluid).paddingTop) + 
            parseInt(window.getComputedStyle(containerFluid).paddingBottom) : 0;
          
          // Get the admin main padding
          const adminMain = document.querySelector('.admin-main');
          const adminMainPadding = adminMain ? 
            parseInt(window.getComputedStyle(adminMain).paddingTop) + 
            parseInt(window.getComputedStyle(adminMain).paddingBottom) : 0;
          
          // Get the page header height with better measurement
          const pageHeader = document.querySelector('.admin-page-header');
          let headerHeight = 0;
          if (pageHeader) {
            // Use getBoundingClientRect for more accurate height including margins
            const headerRect = pageHeader.getBoundingClientRect();
            const headerStyles = window.getComputedStyle(pageHeader);
            const headerMargins = parseInt(headerStyles.marginTop) + parseInt(headerStyles.marginBottom);
            headerHeight = headerRect.height + headerMargins;
          } else {
            // Fallback height estimate for admin page header
            headerHeight = 80;
          }
          
          // Add very conservative buffer space to ensure the table never goes below screen bottom
          // This includes space for container padding, potential scrollbars, and generous visual breathing room
          const bufferSpace = 100;
          
          // Calculate total space used by other elements
          const usedSpace = containerFluidPadding + adminMainPadding + headerHeight + bufferSpace;
          
          // Calculate available height: full window height minus all used space
          const availableHeight = window.innerHeight - usedSpace;
          
          // Ensure minimum height for usability
          const minHeight = 200;
          const finalHeight = Math.max(availableHeight, minHeight);
          
          setTableHeight(`${finalHeight}px`);
        }, 50); // Small delay to ensure DOM is fully settled
      });
    }

    useEffect(() => {

      // Calculate table height when component mounts
      calculateTableHeight();

      // Recalculate on window resize with debouncing
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(calculateTableHeight, 100);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    }, []);

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

    // Recalculate height when players data loads (header might change size)
    useEffect(() => {
      if (players.length > 0) {
        // Small delay to ensure the DOM has updated with the new data
        setTimeout(() => {
          calculateTableHeight();
        }, 100);
      }
    }, [players]);

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

      const [eliminated, setEliminated] = useState(player.eliminated === 1);      function setPlayerEliminated(e) {
        const isEliminated = e.target.checked;
        setEliminated(isEliminated);

        const body = {
          episodeId: (isEliminated ? episode.episodeId : null)
        }

        fetch(`${apiUrl}player/setEliminated/${player.playerId}`, {
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
        <div className="admin-page-header">
          <h2>{episode.title || '(No Title)'}</h2>
          <button className="btn btn-primary" onClick={goBack}>Go Back</button>
        </div>
        <div className="admin-table-container episode-scores-container" style={{ height: tableHeight }}>
          <table className="table table-striped admin-table episode-scores-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Elimination</th>
                {labels.map((label, i) => {
                  // Get default points for this statistic from the first player's stats
                  const firstPlayer = Object.values(players)[0];
                  const defaultPoints = firstPlayer && firstPlayer.stats[i] ? firstPlayer.stats[i].defaultPoints : 0;
                  const pointText = defaultPoints === 1 ? 'pt' : 'pts';
                  return (
                    <th key={`${label}${i}`}>
                      <div>{label}</div>
                      <div className="text-muted small">({defaultPoints} {pointText})</div>
                    </th>
                  );
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
        </div>
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