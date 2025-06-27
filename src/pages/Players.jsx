import { useState, useEffect } from "react";
import Main from "../components/Main";
import WaterLoader from "../components/WaterLoader";
import apiUrl from "../apiUrls";
import icon from "../assets/island.png";

function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch(`${apiUrl}players`, {
          headers: {
            'authorization': localStorage.getItem('jwt')
          }
        });
        
        const reply = await response.json();
        
        if (reply.status === 'success') {
          setPlayers(reply.data);
        } else {
          console.log(reply);
          setError(true);
        }
      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }

    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <Main page="players">
        <div className="d-flex w-100 justify-content-center my-5">
          <WaterLoader />
        </div>
      </Main>
    );
  }

  if (error) {
    return (
      <Main page="players">
        <div className="container">
          <div className="alert alert-danger text-center">
            Something went wrong loading players
          </div>
        </div>
      </Main>
    );
  }

  return (
    <Main page="players">
      <div className="container">
        <h2 className="mb-4 text-center">Player Performance</h2>
        
        <div className="row g-3">
          {players.map((player, index) => (
            <div key={player.playerId} className="col-12">
              <div className="card">
                <div className="card-body">
                  {/* Top Row: Photo and Info */}
                  <div className="d-flex align-items-start mb-2">
                    {/* Player Photo */}
                    <div className="me-3">
                      <img 
                        src={player.photoUrl || icon} 
                        alt={`${player.firstName} ${player.lastName}`}
                        className="rounded-circle"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    
                    {/* Player Info */}
                    <div className="flex-grow-1">
                      {/* Name and Rank */}
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h5 className="mb-0" style={{ fontSize: '1.1rem' }}>
                          {player.firstName} {player.lastName}
                        </h5>
                        <span className="badge bg-primary">
                          #{index + 1}
                        </span>
                      </div>
                      
                      {/* Tribe and Points */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          {player.tribe ? player.tribe.name : 'No Tribe'}
                        </small>
                        <div className="text-end">
                          <div className="fw-bold text-primary fs-4">
                            {player.totalPoints}
                          </div>
                          <small className="text-muted">points</small>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar" 
                          style={{ 
                            width: players.length > 0 ? 
                              `${(player.totalPoints / Math.max(...players.map(p => p.totalPoints))) * 100}%` : 
                              '0%'
                          }}
                        />
                      </div>
                      
                      {/* Stats */}
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">
                          {player.episodeCount} episodes
                        </small>
                        <small className="text-muted">
                          Avg: {player.episodeCount > 0 ? 
                            (player.totalPoints / player.episodeCount).toFixed(1) : 
                            '0.0'} pts/ep
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {players.length === 0 && (
          <div className="text-center py-5">
            <img src={icon} alt="No players" width="100" className="mb-3 opacity-50" />
            <h4 className="text-muted">No Players Found</h4>
            <p className="text-muted">There are no players for this season yet.</p>
          </div>
        )}
      </div>
    </Main>
  );
}

export default Players;
