import { useState } from "react";
import Main from "../components/Main";
import WaterLoader from "../components/WaterLoader";
import { useUser } from "../contexts/UserContext";
import { NameEdit, EmailPreferences, EmailVerification, PushNotificationSettings } from "./SettingsComponents";

export default function Settings() {
  const { user, needsEmailVerification } = useUser();
  const [error, setError] = useState(false);

  function logOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('homeTarget');
    window.location.assign('login');
  }

  return (
    <Main page={'settings'}>
      {(() => {
        if (!user) return <WaterLoader></WaterLoader>;
        if (error) return <p>Something went wrong</p>;

        return (
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-12">
                <div className="d-flex flex-column gap-3">
                  {/* Email verification always full width when present */}
                  {needsEmailVerification && (
                    <div className="row">
                      <div className="col-12">
                        <EmailVerification user={user} />
                      </div>
                    </div>
                  )}
                  
                  {/* Name and Email preferences can share a row on larger screens */}
                  <div className="row g-3">
                    <div className="col-12 col-lg-6">
                      <PushNotificationSettings user={user} />
                    </div>
                    <div className="col-12 col-lg-6">
                      <EmailPreferences user={user} />
                    </div>
                  </div>
                  
                  {/* Push notifications full width */}
                  <div className="row">
                    <div className="col-12">
                      <NameEdit user={user} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="mb-3">
              <button className="btn btn-outline-danger w-100" onClick={logOut}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}