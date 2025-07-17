import React, { useEffect, useState } from 'react';
import apiUrl from '../apiUrls';
import WaterLoader from '../components/WaterLoader';
import JoinButton from './LeaguesComponents/JoinButton';
import AddButton from './LeaguesComponents/AddButton';

export default function Leagues() {
  const [leagues, setLeagues] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);


  async function fetchLeagues() {
    await fetch(`${apiUrl}league/notMyLeagues`, {
      method: 'GET',
      headers: {
        'authorization': localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          setLeagues(reply.data);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <WaterLoader />
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">Error loading leagues</div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Available Leagues</h2>
          </div>

          <div className="mb-4">
            <AddButton />
          </div>

          {leagues && leagues.length > 0 ? (
            <div className="row">
              {leagues.map(league => (
                <div key={league.leagueId} className="col-12 col-md-6 col-lg-4 mb-3">
                  <JoinButton league={league} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-trophy" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              </div>
              <h4 className="text-muted mb-3">No Available Leagues</h4>
              <p className="text-muted mb-4">All public leagues have been joined or there are no leagues available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}