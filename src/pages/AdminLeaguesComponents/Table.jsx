import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";

export default function Table() {

  const [leagues, setLeagues] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchTeams() {
      fetch(`${apiUrl}league`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setLeagues(reply.data);
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
        setTimeout(() => {
          setLoading(false);
        }, 300)
      })
    }

    fetchTeams();
  }, [])

  if(loading) return <WaterLoader></WaterLoader>
  if(error) return <p>Something went wrong</p>

  return <></>;
}