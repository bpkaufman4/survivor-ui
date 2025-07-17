import React, { useState, useEffect } from "react";
import apiUrl from "../apiUrls";
import Main from "../components/Main";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [validToken, setValidToken] = useState(null);

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');

    if (tokenParam) {
      setToken(tokenParam);
      setValidToken(true);
    } else {
      setValidToken(false);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire({
        text: 'Please fill in all fields',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        text: 'Passwords do not match',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    if (password.length < 4) {
      Swal.fire({
        text: 'Password must be at least 4 characters',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    setLoading(true);

    fetch(`${apiUrl}user/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          Swal.fire({
            title: 'Password Reset!',
            text: 'Your password has been successfully reset.',
            icon: 'success',
            confirmButtonText: 'Go to Login'
          }).then(() => {
            window.location.assign('/login');
          });
        } else {
          Swal.fire({
            text: reply.message || 'Something went wrong',
            icon: 'error',
            toast: true,
            showCancelButton: false,
            showConfirmButton: false,
            timer: 3000,
            position: 'top'
          });
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
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (validToken === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (validToken === false) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4 text-center">
              <h2 className="card-title text-danger">Invalid Reset Link</h2>
              <p className="text-muted mb-4">
                This password reset link is invalid or has expired.
              </p>
              <div className="d-grid gap-2">
                <Link to="/forgot-password" className="btn btn-primary">
                  Request New Reset Link
                </Link>
                <Link to="/login" className="btn btn-outline-secondary">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="card-title">Reset Password</h2>
              <p className="text-muted">Enter your new password</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="mb-3">
                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
