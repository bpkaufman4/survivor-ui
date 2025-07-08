import { useState } from "react";
import apiUrl from "../../apiUrls";
import Swal from "sweetalert2";
import { useUser } from "../../contexts/UserContext";

export default function EmailVerification({ user }) {
  const { refreshUser } = useUser();
  const [email, setEmail] = useState(user.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  function handleEmailUpdate() {
    if (!email) {
      Swal.fire({
        text: 'Please enter an email address',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    fetch(`${apiUrl}user/update-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        authorization: localStorage.getItem('jwt'),
        "Content-type": "application/json"
      }
    })
    .then(response => response.json())
    .then(reply => {
      if(reply.status === 'success') {
        setPendingEmail(email);
        setShowVerificationInput(true);
        Swal.fire({
          text: 'Verification code sent to your email',
          icon: 'success', 
          toast: true,
          showConfirmButton: false,
          timer: 3000,
          position: 'top'
        });
      } else {
        Swal.fire({
          text: reply.message || 'Something went wrong',
          icon: 'error',
          toast: true,
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
        toast: true,
        icon: 'error',
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
    });
  }

  function handleVerification() {
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

    fetch(`${apiUrl}user/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ 
        verificationCode: parseInt(verificationCode), 
        userId: user.userId 
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => response.json())
    .then(reply => {
      if (reply.status === 'success') {
        Swal.fire({
          title: 'Email Verified!',
          text: 'Your email has been successfully verified.',
          icon: 'success',
          showCancelButton: false,
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          refreshUser(); // Refresh user data to update verification status
          setShowVerificationInput(false);
          setVerificationCode('');
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
    });
  }

  function handleVerificationCodeChange(e) {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  }

  if (user.email && user.emailVerified) {
    return (
      <div className="alert alert-success" role="alert">
        <div className="d-flex align-items-center">
          <span className="me-2">✅</span>
          <div>
            <strong>Email Verified</strong>
            <div className="small">{user.email}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-warning mb-3">
      <div className="card-header bg-warning text-dark">
        <strong>Email Verification Required</strong>
      </div>
      <div className="card-body">
        {!showVerificationInput ? (
          <>
            <p className="card-text mb-3">
              {user.email ? 
                `Please verify your email address: ${user.email}` : 
                'Please add and verify your email address to secure your account.'
              }
            </p>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
            <button 
              type="button" 
              onClick={handleEmailUpdate} 
              className="btn btn-warning w-100"
            >
              {user.email ? 'Send Verification Code' : 'Add Email & Send Verification'}
            </button>
          </>
        ) : (
          <>
            <p className="card-text mb-3">
              We've sent a verification code to <strong>{pendingEmail}</strong>
            </p>
            <div className="mb-3">
              <label htmlFor="verificationCode" className="form-label">Verification Code</label>
              <input 
                type="text" 
                className="form-control text-center"
                id="verificationCode"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="000000"
                maxLength="6"
                style={{ letterSpacing: '0.3em', fontSize: '1.2rem' }}
              />
            </div>
            <div className="d-grid gap-2">
              <button 
                type="button" 
                onClick={handleVerification} 
                className="btn btn-success"
                disabled={verificationCode.length !== 6}
              >
                Verify Email
              </button>
              <button 
                type="button" 
                onClick={() => setShowVerificationInput(false)} 
                className="btn btn-outline-secondary"
              >
                Change Email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
