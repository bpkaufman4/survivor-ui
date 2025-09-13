import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom"
import apiUrl from "../apiUrls";
import '../assets/league.css'
import WaterLoader from "../components/WaterLoader";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SettingsIcon from '@mui/icons-material/Settings';
import TeamStandings from "./LeagueComponents/TeamStandings";
import PlayerStandings from "./LeagueComponents/PlayerStandings";
import MyTeam from "./LeagueComponents/MyTeam";
import Survey from "./LeagueComponents/Survey";
import Note from "./LeagueComponents/Note";
import MyPolls from "./LeagueComponents/MyPolls";
import Settings from "./LeagueComponents/Settings";
import Draft from "./LeagueComponents/Draft";
import Scoring from "./LeagueComponents/Scoring";

export default function League() {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState('standings');
  const [ownerAccess, setOwnerAccess] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [playersExist, setPlayersExist] = useState(false);
  const [checkingPlayers, setCheckingPlayers] = useState(true);
  
  // Memoize draft start time to prevent unnecessary re-renders
  const draftStartTime = useMemo(() => {
    return draft?.startDate || null;
  }, [draft?.startDate]);
  
  useEffect(() => {
    async function checkPlayers() {
      try {
        const playersResponse = await fetch(`${apiUrl}players`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        });
        const playersData = await playersResponse.json();
        
        if (playersData.status === 'success') {
          setPlayersExist(playersData.data && playersData.data.length > 0);
        }
      } catch (error) {
        console.error('Error checking players:', error);
      } finally {
        setCheckingPlayers(false);
      }
    }

    function fetchLeague() {
      fetch(`${apiUrl}league/${leagueId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setLeague(reply.data);
          if(reply.data.drafts[0]) {
            setDraft(reply.data.drafts[0]);
          }
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
        setLoading(false);
      })
    }

    function checkOwnerAccess() {
      fetch(`${apiUrl}league/ownerAccess/${leagueId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        setOwnerAccess(reply.access);
      })
      .catch(err => {
        setOwnerAccess(false);
      })
    }

    checkPlayers();
    fetchLeague();
    checkOwnerAccess();

  }, [leagueId])

  function Content({ children }) {
    if(loading) return <WaterLoader></WaterLoader>;
    if(error) return <p>Something went wrong</p>
    return children;
  }
  function View() {

    switch(view) {
      default:
      case 'standings':
        return <TeamStandings leagueId={leagueId} />
      case 'players':
        return <PlayerStandings leagueId={leagueId}></PlayerStandings>
      case 'my-team':
        return <MyTeam leagueId={leagueId}></MyTeam>
      case 'polls':
        return <MyPolls leagueId={leagueId}></MyPolls>
      case 'settings':
        return <Settings leagueId={leagueId} leagueName={league.name || ''} password={league.password || ''} privateInd={league.privateInd} isDraftComplete={isDraftComplete} playersExist={playersExist} checkingPlayers={checkingPlayers}></Settings>
    }

  }

  function MenuOptions() {
    const menuOptionData = [
      {
        display: 'Standings',
        view: 'standings',
        activeColor: 'primary' // Team Standings uses primary theme
      },
      {
        display: 'Contestants',
        view: 'players',
        activeColor: 'success' // Player Standings uses success theme
      },
      {
        display: 'My Team',
        view: 'my-team',
        activeColor: 'info' // My Team uses info theme
      },
      {
        display: 'Polls',
        view: 'polls',
        activeColor: 'warning' // My Polls uses warning theme
      }
    ]

    return (
      <div className="nav nav-pills bg-light rounded-3 p-1 d-flex w-100">
        {menuOptionData.map(o => {
          function menuOptionOnClick(e) {
            setView(o.view);
          }

          const isActive = o.view === view;
          const buttonClass = isActive 
            ? `nav-link active bg-${o.activeColor} text-white border-0 py-1 px-2` 
            : 'nav-link text-muted border-0 py-1 px-2';

          return (
            <button 
              key={o.view} 
              onClick={menuOptionOnClick} 
              className={`btn ${buttonClass} flex-fill mx-1`}
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              <small className="fw-semibold">{o.display}</small>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <Content>
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
        <h3 className="mb-0 flex-grow-1">{league && league.name}</h3>
        <div className="d-flex align-items-center gap-2">
          <Survey leagueId={league && league.leagueId} />
          <Note />
          <Scoring />
          {ownerAccess && (
            <button className="btn" onClick={() => setView('settings')}>
              <SettingsIcon fontSize="small" color={view === 'settings' ? 'primary' : 'inherit'} />
            </button>
          )}
        </div>
      </div>
      <div className="my-2">
        <MenuOptions />
      </div>
      <div>
        <View />
      </div>
    </Content>
  )
}