// src/components/RequireAdmin.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiUrl from "../apiUrls";

export default function RequireUser({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    function checkAdmin() {
      fetch(`${apiUrl}login/check`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(data => {
        if(!data.verified) {
          localStorage.removeItem('jwt');
        } else {
          setIsAuthorized(true);
        }
      })
      .catch(err => {
        console.error("Admin Check Failed", err);
      })
      .finally(() => {
        setLoading(false);
      })
    }

    checkAdmin();
  }, [])
  
  if(loading) return <></>;
  if(!isAuthorized) return <Navigate to="/login" replace />;

  return children;
}