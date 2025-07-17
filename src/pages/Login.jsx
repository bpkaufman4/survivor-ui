import React from "react";
import apiUrl from "../apiUrls";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { recheckAuth } = useAuth();

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
        if (reply.status === 'success') {
          // Store JWT token and navigate using React Router
          localStorage.setItem('jwt', reply.token);
          localStorage.setItem('homeTarget', reply.target);
          localStorage.setItem('userType', reply.userType);
          
          // Update auth context state and then navigate
          recheckAuth().then(() => {
            const targetPath = reply.target.startsWith('/') ? reply.target : '/';
            navigate(targetPath, { replace: true });
          });
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

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
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
                  Need an account? <Link to="/register" className="text-decoration-none">Sign Up</Link>
                </p>
                <Link
                  to="/forgot-password"
                  className="text-decoration-none"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;