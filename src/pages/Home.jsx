import { useEffect, useState } from "react";
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
          if (res.status === 'success') {
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


  function Team({ name, league, leagueId }) {
    const redirect = () => window.location.assign(`league/${leagueId}`);

    return (
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">{name}</h5>
              <p className="card-text text-muted mb-0">{league.name}</p>
            </div>
            <button
              onClick={redirect}
              className="btn btn-primary"
            >
              View League
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <WaterLoader></WaterLoader>
    )
  }

  if (error) {
    return (
      <p>Error... </p>
    )
  }

  function joinLeagues() {
    window.location.assign('/leagues');
  }
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">My Teams</h2>
              <button className="btn btn-outline-primary" onClick={joinLeagues}>
                Join a League
              </button>
            </div>

            {teams.length > 0 ? (
              <div className="row">
                {teams.map(team => (
                  <div key={team.league.leagueId} className="col-12 col-md-6 col-lg-4">
                    <Team name={team.name} league={team.league} leagueId={team.league.leagueId} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-trophy" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                </div>
                <h4 className="text-muted mb-3">No Teams Yet</h4>
                <p className="text-muted mb-4">You haven't joined any leagues yet. Get started by joining your first league!</p>
                <button className="btn btn-primary btn-lg" onClick={joinLeagues}>
                  Browse Available Leagues
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
