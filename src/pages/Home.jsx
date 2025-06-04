import { useEffect, useState } from "react";
import Main from "../components/Main";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";


function Home() {

  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    async function fetchTeams() {
      await fetch(`${apiUrl}team/myTeams`, {
        method: 'GET',
        headers: {
          'authorization': localStorage.getItem('jwt')
        }
      })
      .then(response => {
        return response.json();
      })
      .then(res => {
        if(res.status === 'success') {
          setTeams(res.data);
        } else {
          setError(true)
        }
      })
      .catch(err => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
    }

    fetchTeams();
  }, []);

  
  function Team({name, league, leagueId}) {
    const redirect = () => window.location.assign(`league/${leagueId}`);

    return (
      <button onClick={redirect} variant="outline-primary" className="w-100 btn btn-primary">
        <div className="col-6">{name}</div>
        <div className="col-6">{league.name}</div>
      </button>
    )

  }
  
  if(loading) {
    return (
      <Main page="home">
        <WaterLoader></WaterLoader>
      </Main>
    )
  }

  if(error) {
    return (
      <Main>
        <p>Error... </p>
      </Main>
    )
  }
  
  return(
    <>
      <Main page="home">
        <div className="container">
          {teams && teams.map(team => {
            return <Team name={team.name} league={team.league} leagueId={team.league.leagueId} key={team.league.leagueId}/>
          })}
        </div>
      </Main>
    </>
  )
}

export default Home
