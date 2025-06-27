import React, { useEffect, useState } from 'react';
import Main from '../components/Main';
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
      <Main page="home">
        <WaterLoader />
      </Main>
    );
  }

  if (error) {
    return (
      <Main page="home">
        <div className="alert alert-danger">Error loading leagues</div>
      </Main>
    );
  }

  return (
    <Main page="home">
      <AddButton></AddButton>      {leagues && leagues.length > 0 ? (
        leagues.map(league => <JoinButton key={league.leagueId} league={league} />)
      ) : (
        <div className="alert alert-info">No leagues found</div>
      )}
    </Main>
  );
}