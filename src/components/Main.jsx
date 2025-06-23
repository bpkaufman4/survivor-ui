import "../assets/bootstrap.min.css"
import HomeIcon from '@mui/icons-material/Home';
import PoolIcon from '@mui/icons-material/Pool';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import icon from '../assets/island-white.png'

const headerHeight = '64px';
const footerHeight = '58px';
const mainHeight = `calc(100vh - ${headerHeight} - ${footerHeight})`;

const Main = ({ children, page, additionalClasses }) => {
  // For draft page, use full width without container padding
  let contentClasses = page === 'draft' ? "" : "container py-3";
  if(additionalClasses) contentClasses += (contentClasses ? " " : "") + additionalClasses;

  return (
    <>
      <nav className="navbar bg-dark d-flex justify-content-around" style={{height: headerHeight}} data-bs-theme="dark">
        <img src={icon} className="h-100" onClick={() => window.location.assign(localStorage.getItem('homeTarget') || '/')} />
      </nav>
      <main style={{height: mainHeight, overflowY: 'overlay'}}>
        <div className={contentClasses}>
          {children}
        </div>
      </main>
      <nav className='fixed-bottom border-top border-black' style={{height: footerHeight}}>
        <div className="row text-center">
          <div className="col-3 pb-4 pt-2" onClick={() => window.location.assign('../')}>
            <HomeIcon color={page === 'home' ? 'primary' : ''}></HomeIcon>
          </div>
          <div className="col-3 pb-4 pt-2">
            <PoolIcon color={page === 'players' ? 'primary' : ''}></PoolIcon>
          </div>
          <div className="col-3 pb-4 pt-2" onClick={() => window.location.assign('../notes')}>
            <EmailIcon color={page === 'notes' ? 'primary' : ''}></EmailIcon>
          </div>
          <div className="col-3 pb-4 pt-2" onClick={() => window.location.assign('../settings')}>
            <SettingsIcon color={page === 'settings' ? 'primary' : ''}></SettingsIcon>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Main