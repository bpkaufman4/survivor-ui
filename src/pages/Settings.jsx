import { useEffect, useState } from "react";
import Main from "../components/Main";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import Swal from "sweetalert2";

export default function Settings() {

  const [initialUser, setInitialUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}user/me`, {
      headers: {
        authorization: localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          setInitialUser(reply.data);
        } else {
          setError(true);
          console.log(reply);
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
  }, []);

  function NameEdit({ user }) {
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const userId = user.userId;

    function setName() {
      const body = JSON.stringify({ firstName, lastName });
      fetch(`${apiUrl}user/me`, {
        method: 'PATCH',
        body,
        headers: {
          authorization: localStorage.getItem('jwt'),
          "Content-type": "application/json"
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          Swal.fire({
            text: 'Info saved',
            icon: 'success', 
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            position: 'top'
          });
        } else {
          console.log(reply);
          Swal.fire({
            text: 'Something went wrong',
            icon: 'error',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            position: 'top'
          })
        }
      })
      .catch(err => {
        console.log(err);
        Swal.fire({
          text: 'Something went wrong',
          toast: true,
          icon: 'error',
          showConfirmButton: false,
          timer: 2000,
          position: 'top'
        })
      })
      return;
    }

    return (
      <div>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input type="text" name="firstName" id="firstName" className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input type="text" name="lastName" id="lastName" className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <button type="button" onClick={setName} className="btn btn-outline-primary w-100">Save</button>
      </div>
    )
  }

  function logOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('homeTarget');
    window.location.assign('login');
  }
  return (
    <Main page={'settings'} additionalClasses={"h-100"}>
      {(() => {

        if (loading) return <WaterLoader></WaterLoader>;
        if (error) return <p>Something went wrong</p>;

        return (<div className="h-100 d-flex flex-column justify-content-between">
          <NameEdit user={initialUser}></NameEdit>
          <button className="btn btn-primary w-100 sticky-bottom" onClick={logOut}>Logout</button>
        </div>)

      })()}
    </Main>
  )
}