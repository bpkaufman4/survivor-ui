import Main from "../components/Main";

export default function Settings() {

  function logOut() {
    localStorage.removeItem('jwt');
    window.location.assign('login');
  }
  return (
    <Main page={'settings'}>
      <button className="btn btn-primary w-100" onClick={logOut}>Logout</button>
    </Main>
  )
}