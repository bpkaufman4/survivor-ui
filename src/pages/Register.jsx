import React, { useState } from "react";
import apiUrl from "../apiUrls";
import Main from "../components/Main";
import Swal from "sweetalert2";

function Register() {
  function register(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const pwd = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate all fields are present
    if (!username || !pwd || !firstName || !lastName || !confirmPassword) {
      Swal.fire({
        text: 'All fields are required',
        icon: 'error',
        toast: true,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });
      return;
    }

    // Validate passwords match
    if (pwd !== confirmPassword) {
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


    const request = { username, pwd, firstName, lastName };
    
    fetch(`${apiUrl}user/register`, {
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
        Swal.fire({
          title: 'Registration Successful!',
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
          text: (typeof reply.message === 'string') ? reply.message : 'Registration failed',
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
      })
    })
  }

  return(
    <Main page={"home"}>
      <div className="d-flex flex-column justify-content-center h-100">
        <form id="loginForm" onSubmit={register}>
          <div className="input-group mb-3">
            <input type="text" className="form-control" name="username" id="username" placeholder="Username" aria-label="Username" aria-describedby="Username"/>
          </div>
          <div className="input-group mb-3">
            <input type="text" className="form-control" name="firstName" id="firstName" placeholder="First Name" aria-label="First Name"/>
          </div>
          <div className="input-group mb-3">
            <input type="text" className="form-control" name="lastName" id="lastName" placeholder="Last Name" aria-label="Last Name"/>
          </div>
          <div className="input-group mb-3">
            <input type="password" className="form-control" name="password" id="password" placeholder="Password" aria-label="Password"/>
          </div>
          <div className="input-group mb-3">
            <input type="password" className="form-control" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" aria-label="Confirm Password"/>
          </div>
          <div>
            <button className="btn btn-primary w-100" type="submit">Sign Up</button>
          </div>
          <div>
            <p>Already have an account? <a href="login">Log In</a></p>
          </div>
        </form>
      </div>
    </Main>
  )
}

export default Register;