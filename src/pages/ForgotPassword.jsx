import React, { useState } from "react";
import apiUrl from "../apiUrls";
import Main from "../components/Main";
import Swal from "sweetalert2";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        text: 'Please enter your email address',
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

    fetch(`${apiUrl}user/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => response.json())
    .then(reply => {
      if (reply.status === 'success') {
        setEmailSent(true);
        Swal.fire({
          title: 'Reset Email Sent!',
          text: 'Check your email for password reset instructions.',
          icon: 'success',
          showCancelButton: false,
          showConfirmButton: false,
          timer: 3000
        });
      } else if (reply.status === 'not_found') {
        // Show manual reset option
        Swal.fire({
          title: 'Account Not Found',
          html: `
            <p>We couldn't find a verified account with this email address.</p>
            <p>Please text Brian at <strong>913-991-3541</strong> for manual password reset assistance.</p>
          `,
          icon: 'info',
          confirmButtonText: 'OK'
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

  return (
    <Main>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">Forgot Password</h2>
                <p className="text-muted">Enter your email to reset your password</p>
              </div>
              
              {!emailSent ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <button 
                      className="btn btn-primary w-100" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <a href="/login" className="text-decoration-none">
                      Back to Login
                    </a>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <div className="alert alert-success" role="alert">
                    <h5>✅ Email Sent!</h5>
                    <p className="mb-0">
                      We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                  </div>
                  <p className="text-muted mb-3">
                    Check your email (including spam folder) and follow the instructions to reset your password.
                  </p>
                  <div className="d-grid gap-2">
                    <a href="/login" className="btn btn-outline-primary">
                      Back to Login
                    </a>
                    <button 
                      className="btn btn-link" 
                      onClick={() => setEmailSent(false)}
                    >
                      Try Different Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}

export default ForgotPassword;
