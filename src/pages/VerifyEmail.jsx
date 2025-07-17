import React, { useState, useEffect } from "react";
import apiUrl from "../apiUrls";
import Main from "../components/Main";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get pending verification data from localStorage
    const pendingData = localStorage.getItem('pendingVerification');
    if (pendingData) {
      setUserData(JSON.parse(pendingData));
    } else {
      // Redirect to register if no pending verification data
      window.location.assign('/register');
    }
  }, []);

  function handleVerificationCodeChange(e) {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  }

  function verifyEmail(e) {
    e.preventDefault();

    if (!userData) {
      Swal.fire({
        text: 'No verification data found. Please register again.',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      Swal.fire({
        text: 'Please enter a valid 6-digit verification code',
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

    const request = {
      verificationCode: parseInt(verificationCode),
      userId: userData.userId
    };

    fetch(`${apiUrl}user/verify-email`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          // Clear pending verification data
          localStorage.removeItem('pendingVerification');

          Swal.fire({
            title: 'Email Verified!',
            text: 'Welcome to Fantasy Survivor!',
            icon: 'success',
            showCancelButton: false,
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            localStorage.setItem('jwt', reply.token);
            localStorage.setItem('homeTarget', reply.target);
            window.location.assign(reply.target);
          });
        } else {
          Swal.fire({
            text: reply.message || 'Verification failed',
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

  function resendCode() {
    if (!userData) return;

    setLoading(true);

    fetch(`${apiUrl}user/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ userId: userData.userId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'success') {
          Swal.fire({
            text: 'A new verification code has been sent to your email',
            icon: 'success',
            toast: true,
            showCancelButton: false,
            showConfirmButton: false,
            timer: 3000,
            position: 'top'
          });
        } else {
          Swal.fire({
            text: reply.message || 'Failed to resend verification code',
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
          text: 'Something went wrong while resending the code',
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

  if (!userData) {
    return (
      <div className="d-flex flex-column justify-content-center h-100">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column justify-content-center h-100">
      <div className="card mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-body">
          <h4 className="card-title text-center mb-4">Verify Your Email</h4>
          <p className="text-center text-muted mb-4">
            We've sent a 6-digit verification code to <strong>{userData.email}</strong>.
            Please check your email (including spam folder) and enter the code below.
          </p>

          <form onSubmit={verifyEmail}>
            <div className="mb-3">
              <label htmlFor="verificationCode" className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-control form-control-lg text-center"
                id="verificationCode"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="000000"
                maxLength="6"
                style={{ letterSpacing: '0.5em', fontSize: '1.5rem' }}
              />
              <div className="form-text text-center">
                Enter the 6-digit code from your email
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                className="btn btn-link"
                onClick={resendCode}
                disabled={loading}
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <Link to="/register" className="text-muted small">
              Need to use a different email? Register again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
