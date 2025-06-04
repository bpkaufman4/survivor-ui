import React, { useState } from "react";
import apiUrl from "../apiUrls";
import Main from "../components/Main";

function Login() {

  const [passwordDisplay, setPasswordDisplay] = useState(false);

  function showInstructions(e) {
    e.preventDefault();
    setPasswordDisplay(true);
  }

  function login(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const pwd = document.getElementById('password').value;

    const request = { username, pwd };

    console.log(request);
    
    fetch(`${apiUrl}login`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      return response.json();
    })
    .then(res => {
      console.log(res);
      localStorage.setItem('jwt', res.token);
      if(res.token) {
        window.location.assign(res.target)
      }
    })
  }

  return(
    <Main>
      <div className="d-flex flex-column justify-content-center h-100">
        <form id="loginForm" onSubmit={login}>
          <div className="input-group mb-3">
            <input type="text" className="form-control" name="username" id="username" placeholder="Username" aria-label="Username" aria-describedby="Username"/>
          </div>
          <div className="input-group mb-3">
            <input type="password" className="form-control" name="password" id="password" placeholder="Password" aria-label="Password"/>
          </div>
          <div>
            <button className="btn btn-primary w-100" type="submit">Log In</button>
          </div>
          <div>
            <p>Need an account? <a href="register">Sign Up</a></p>
            <button className="btn btn-primary" onClick={showInstructions}>Forgot Password?</button>
          </div>
          {passwordDisplay && (
            <div><p>Password reset is a work in progress. Text BK at 913-991-3541 and he'll get you squared away.</p></div>
          )}
        </form>
      </div>
    </Main>
  )
}

export default Login;