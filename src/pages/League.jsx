import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom"
import apiUrl from "../apiUrls";
import '../assets/league.css'
import WaterLoader from "../components/WaterLoader";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SettingsIcon from '@mui/icons-material/Settings';
import Main from "../components/Main";
import TeamStandings from "./LeagueComponents/TeamStandings";
import PlayerStandings from "./LeagueComponents/PlayerStandings";
import MyTeam from "./LeagueComponents/MyTeam";
import Survey from "./LeagueComponents/Survey";
import Note from "./LeagueComponents/Note";
import MyPolls from "./LeagueComponents/MyPolls";
import Settings from "./LeagueComponents/Settings";
import Draft from "./LeagueComponents/Draft";

export default function League() {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState('standings');
  const [ownerAccess, setOwnerAccess] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  
  // Memoize draft start time to prevent unnecessary re-renders
  const draftStartTime = useMemo(() => {
    return draft?.startDate || null;
  }, [draft?.startDate]);
  
  useEffect(() => {
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
          } else {
            // Check if there's a completed draft for this season
            fetch(`${apiUrl}draft/byLeague/${leagueId}`, {
              headers: {
                authorization: localStorage.getItem('jwt')
              }
            })
            .then(response => response.json())
            .then(draftReply => {
              if(draftReply.data && draftReply.data.complete) {
                setIsDraftComplete(true);
              }
            })
            .catch(err => {
              console.log('Draft check error:', err);
            });
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
        return <Settings leagueId={leagueId} leagueName={league.name || ''} password={league.password || ''} privateInd={league.privateInd} isDraftComplete={isDraftComplete}></Settings>
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
    <Main page="home">
      <Content>
        {draft && <Draft draftStartTime={draftStartTime} onJoinDraft={() => window.location.assign(`/draft/${leagueId}`)} leagueId={leagueId} />}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
          <h3 className="mb-0 flex-grow-1">{league && league.name}</h3>
          <div className="d-flex align-items-center gap-2">
            <Survey leagueId={league && league.leagueId} />
            <Note />
            {ownerAccess && (
              <button className="btn" onClick={() => setView('settings')}>
                <SettingsIcon fontSize="small" color={view === 'settings' ? 'primary' : 'inherit'} />
              </button>
            )}
          </div>
        </div>
        {ownerAccess && !draft && !isDraftComplete && (
          <div className="alert alert-warning mt-3 mb-2" role="alert">
            <strong>Action needed:</strong> Your league draft date hasn't been set yet. Visit the settings to schedule your draft.
          </div>
        )}
        <div className="my-2">
          <MenuOptions />
        </div>
        <div>
          <View />
        </div>
      </Content>
    </Main>
  )
}