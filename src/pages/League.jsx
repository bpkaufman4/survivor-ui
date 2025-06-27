import { useEffect, useState } from "react";
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
        view: 'standings'
      },
      {
        display: 'Contestants',
        view: 'players'
      },
      {
        display: 'My Team',
        view: 'my-team'
      },
      {
        display: 'Polls',
        view: 'polls'
      }
    ]

    return menuOptionData.map(o => {
      function menuOptionOnClick(e) {
        setView(o.view);
      }

      return (
        <button key={o.view} style={{fontSize: '12px'}} onClick={menuOptionOnClick} className={`btn ${o.view === view ? 'btn-primary' : 'btn-outline-primary'}`}>{o.display}</button>
      )
    })
  }

  return (
    <Main page="home">
      <Content>
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
          <button className="btn ps-0" onClick={() => window.location.assign('../../')}>
            <ArrowBackIosIcon></ArrowBackIosIcon>
          </button>
          <Survey leagueId={league && league.leagueId} />
          <Note />
          {ownerAccess && (
            <div>
              <button className="btn" onClick={() => setView('settings')}>
                <SettingsIcon color={view === 'settings' && 'primary' || ''} />
              </button>
            </div>
          )}
        </div>        
        {draft && <Draft draftStartTime={draft.startDate} onJoinDraft={() => window.location.assign(`/draft/${leagueId}`)} />}
        <h3 className="w-auto mb-0 mt-3">{league && league.name}</h3>
        {ownerAccess && !draft && !isDraftComplete && (
          <div className="alert alert-warning mt-3 mb-2" role="alert">
            <strong>Action needed:</strong> Your league draft date hasn't been set yet. Visit the settings to schedule your draft.
          </div>
        )}
        <div className="d-flex justify-content-between my-3">
          <MenuOptions />
        </div>
        <div>
          <View />
        </div>
      </Content>
    </Main>
  )
}