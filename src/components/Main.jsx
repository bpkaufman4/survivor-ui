import "../assets/bootstrap.min.css"
import HomeIcon from '@mui/icons-material/Home';
import PoolIcon from '@mui/icons-material/Pool';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import icon from '../assets/island-white.png'

const headerHeight = '64px';
const footerHeight = '58px';
const mainHeight = `calc(100vh - ${headerHeight} - ${footerHeight})`;

const Main = ({ children, page }) => {
  return (
    <>
      <nav className="navbar bg-dark d-flex justify-content-around" style={{height: headerHeight}} data-bs-theme="dark">
        <img src={icon} className="h-100" />
      </nav>
      <main className="container py-3" style={{height: mainHeight, overflowY: 'overlay'}}>{children}</main>
      <nav className='fixed-bottom' style={{height: footerHeight}}>
        <div className="row text-center">
          <div className="col-3 py-3">
            <HomeIcon color={page === 'home' ? 'primary' : ''}></HomeIcon>
          </div>
          <div className="col-3 py-3">
            <PoolIcon color={page === 'players' ? 'primary' : ''}></PoolIcon>
          </div>
          <div className="col-3 py-3">
            <EmailIcon color={page === 'messages' ? 'primary' : ''}></EmailIcon>
          </div>
          <div className="col-3 py-3">
            <SettingsIcon color={page === 'settings' ? 'primary' : ''}></SettingsIcon>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Main