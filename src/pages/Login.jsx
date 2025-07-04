import React, { useState } from "react";
import apiUrl from "../apiUrls";
import Main from "../components/Main";
import Swal from "sweetalert2";

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
    .then(reply => {
      if(reply.status === 'success') {
        localStorage.setItem('jwt', reply.token);
        localStorage.setItem('homeTarget', reply.target);
        window.location.assign(reply.target);
      } else {
        Swal.fire({
          text: 'Invalid username/email or password',
          toast: true,
          icon: 'error',
          timer: 3000,
          showConfirmButton: false,
          position: 'top'
        })
      }
    })
    .catch(err => {
      console.log(err);
      Swal.fire({
        text: 'Something went wrong',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      })
    })
  }

  return(
    <Main>
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">Welcome Back</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>
              
              <form id="loginForm" onSubmit={login}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username or Email</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="username" 
                    id="username" 
                    placeholder="Enter your username or email" 
                    aria-label="Username or Email" 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="password" 
                    id="password" 
                    placeholder="Enter your password" 
                    aria-label="Password"
                  />
                </div>
                <div className="mb-3">
                  <button className="btn btn-primary w-100" type="submit">
                    Log In
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="mb-2">
                    Need an account? <a href="register" className="text-decoration-none">Sign Up</a>
                  </p>
                  <button 
                    type="button"
                    className="btn btn-link text-decoration-none" 
                    onClick={showInstructions}
                  >
                    Forgot Password?
                  </button>
                </div>
                
                {passwordDisplay && (
                  <div className="alert alert-info mt-3">
                    <small>
                      Password reset is a work in progress. Text BK at 913-991-3541 and he'll get you squared away.
                    </small>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </Main>
  )
}

export default Login;