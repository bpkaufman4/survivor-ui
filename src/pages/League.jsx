import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import apiUrl from "../apiUrls";
import '../assets/league.css'
import WaterLoader from "../components/WaterLoader";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Main from "../components/Main";
import TeamStandings from "./LeagueComponents/TeamStandings";
import PlayerStandings from "./LeagueComponents/PlayerStandings";
import MyTeam from "./LeagueComponents/MyTeam";
import Survey from "./LeagueComponents/Survey";
import Note from "./LeagueComponents/Note";
import MyPolls from "./LeagueComponents/MyPolls";

export default function League() {
  const { leagueId } = useParams();

  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState('standings');

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

    fetchLeague();
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
        <div className="d-flex align-items-center justify-content-between">
          <div className=" d-flex align-items-center">
            <button className="btn ps-0" onClick={() => window.location.assign('../../')}>
              <ArrowBackIosIcon></ArrowBackIosIcon>
            </button>
            <h3 className="w-auto mb-0">{league && league.name}</h3>
          </div>
          <Survey leagueId={league && league.leagueId} />
          <Note />
        </div>
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