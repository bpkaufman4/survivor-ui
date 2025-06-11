import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import { DateTime } from "luxon";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function PlayerEpisodeScores({ playerId }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    function fetchEpisodes() {
      fetch(`${apiUrl}episode/totalScores/${playerId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setEpisodes(reply.data)
        } else {
          console.error(reply);
          setError(true);
        }
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      })
    }

    fetchEpisodes();
  }, [playerId])

  if(loading) return <></>;
  if(error) return <p>Something went wrong</p>

  function EpisodeExpand({ episode }) {
    const [expanded, setExpanded] = useState(false);

    function toggleExpanded() {
      setExpanded((() => {return !expanded}));
    }

    return (
      <>
        <div key={episode.episodeId} className="d-flex justify-content-between border-top border-secondary py-2">
          <div className="w-auto">
            <p className="w-auto m-0">{DateTime.fromISO(episode.airDate).toLocaleString(DateTime.DATE_SHORT)} - {episode.title}</p>
            <p className="w-auto m-0">{episode.episodeScore} points</p>
          </div>
          <button className="btn" onClick={toggleExpanded}>
            {(() => {
              if(expanded) {
                return <ExpandLessIcon></ExpandLessIcon>
              } else {
                return <ExpandMoreIcon></ExpandMoreIcon>
              }
            })()}
          </button>
        </div>
        {expanded && episode.scores.map(s => {
          if(s.points != 0) {
            return <p className="m-0 py-1 border-top border-secondary-subtle">{s.statistic.name}: {s.points}</p>
          }
        })}
      </>
    )
  }

  return (
    <div>
      {episodes && episodes.map(e => {
        return <EpisodeExpand episode={e} />
      })}
    </div>
  )
}