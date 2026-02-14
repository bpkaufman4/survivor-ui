import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added import
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import ChangeTeamNameButton from "./HomeComponents/ChangeTeamNameButton";
import UserPoll from "./HomeComponents/UserPoll";


function Team({ name, league, leagueId, teamId }) {
  const navigate = useNavigate();

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0 text-primary">{name}</h5>
          <ChangeTeamNameButton teamNameProp={name} teamId={teamId} />
        </div>
        <h6 className="card-subtitle mb-3 text-muted">
          <span className="badge bg-light text-dark border me-2">League</span>
          {league.name}
        </h6>

        <div className="d-grid mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate(`/league/${leagueId}`)}
          >
            View League
          </button>
        </div>
      </div>
    </div>
  )
}


function Home() {

  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added hook

  function joinLeagues() { // Added function
    navigate('/leagues');
  }

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

  return (
    <>
      <UserPoll />
      <div className="container mt-3">
        {loading ? <WaterLoader /> :
          !error ?
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
                        <Team name={team.name} league={team.league} leagueId={team.league.leagueId} teamId={team.teamId} />
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
            :
            <p>Error... </p>
        }
      </div>
    </>
  )
}

export default Home
