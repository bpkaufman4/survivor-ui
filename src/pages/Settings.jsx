import { useState } from "react";
import Main from "../components/Main";
import WaterLoader from "../components/WaterLoader";
import { useUser } from "../contexts/UserContext";
import { NameEdit, EmailPreferences, EmailVerification } from "./SettingsComponents";

export default function Settings() {
  const { user, needsEmailVerification } = useUser();
  const [error, setError] = useState(false);

  function logOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('homeTarget');
    window.location.assign('login');
  }

  return (
    <Main page={'settings'} additionalClasses={"h-100"}>
      {(() => {
        if (!user) return <WaterLoader></WaterLoader>;
        if (error) return <p>Something went wrong</p>;

        return (
          <div className="h-100 d-flex flex-column">
            {/* Logout button at the top */}
            <div className="mb-3">
              <button className="btn btn-outline-danger w-100" onClick={logOut}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>

            {/* Settings components */}
            <div className="flex-grow-1">
              <NameEdit user={user} />
              <EmailPreferences user={user} />
              {needsEmailVerification && <EmailVerification user={user} />}
            </div>
          </div>
        );
      })()}
    </Main>
  );
}