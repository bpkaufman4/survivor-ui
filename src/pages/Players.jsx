import { useState, useEffect } from "react";
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
      <div className="d-flex w-100 justify-content-center my-5">
        <WaterLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger text-center">
          Something went wrong loading players
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4 text-center">Player Performance</h2>

      <div className="row g-3">
        {players.map((player, index) => (
          <div key={player.playerId} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                {/* Top Row: Photo and Info */}
                <div className="d-flex align-items-start mb-3">
                  {/* Player Photo */}
                  <div className="me-3">
                    <img
                      src={player.photoUrl || icon}
                      alt={`${player.firstName} ${player.lastName}`}
                      className="rounded-circle"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Player Info */}
                  <div className="flex-grow-1">
                    {/* Name and Rank */}
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h5 className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.2' }}>
                        {player.firstName} {player.lastName}
                      </h5>
                      <span className="badge bg-primary">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Tribe */}
                    <small className="text-muted">
                      {player.tribe ? player.tribe.name : 'No Tribe'}
                    </small>
                  </div>
                </div>

                {/* Points Section */}
                <div className="text-center mb-3">
                  <div className="fw-bold text-primary" style={{ fontSize: '2rem' }}>
                    {player.totalPoints}
                  </div>
                  <small className="text-muted">Total Points</small>
                </div>

                {/* Progress Bar */}
                <div className="progress mb-3" style={{ height: '8px' }}>
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
                <div className="row text-center mt-auto">
                  <div className="col-6">
                    <div className="fw-bold">{player.episodeCount}</div>
                    <small className="text-muted">Episodes</small>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold">
                      {player.episodeCount > 0 ?
                        (player.totalPoints / player.episodeCount).toFixed(1) :
                        '0.0'}
                    </div>
                    <small className="text-muted">Avg/Episode</small>
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
  );
}

export default Players;
