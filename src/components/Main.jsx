import "../assets/bootstrap.min.css"
import HomeIcon from '@mui/icons-material/Home';
import PoolIcon from '@mui/icons-material/Pool';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import icon from '../assets/island-white.png'
import { useUser } from '../contexts/UserContext';
import { useState, useEffect } from 'react';

const headerHeight = '64px';
const footerHeight = '58px';

const Main = ({ children, page, additionalClasses }) => {
  const { needsEmailVerification } = useUser();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // For draft page, use full width without container padding
  let contentClasses = page === 'draft' ? "" : "container py-3";
  if(additionalClasses) contentClasses += (contentClasses ? " " : "") + additionalClasses;

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Desktop Header Navigation - Only visible on desktop */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark d-none d-lg-flex" style={{height: headerHeight, flexShrink: 0}}>
        <div className="container-fluid">
          {/* Brand */}
          <div 
            className="navbar-brand d-flex align-items-center"
            style={{cursor: 'pointer'}}
            onClick={() => window.location.assign(localStorage.getItem('homeTarget') || '/')}
          >
            <img 
              src={icon} 
              alt="Fantasy Survivor" 
              height="32"
              className="me-2"
            />
            <span>Fantasy Survivor</span>
          </div>

          {/* Navigation Links */}
          <div className="navbar-nav flex-row ms-auto">
            <div 
              className={`nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center ${page === 'home' || page === 'draft' ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => window.location.assign('../')}
            >
              <HomeIcon className="me-1" fontSize="small" />
              Home
            </div>
            <div 
              className={`nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center ${page === 'players' ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => window.location.assign('../players')}
            >
              <PoolIcon className="me-1" fontSize="small" />
              Players
            </div>
            <div 
              className={`nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center ${page === 'notes' ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => window.location.assign('../notes')}
            >
              <EmailIcon className="me-1" fontSize="small" />
              Notes
            </div>
            <div 
              className={`nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center position-relative ${page === 'settings' ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => window.location.assign('../settings')}
            >
              <SettingsIcon className="me-1" fontSize="small" />
              Settings
              {needsEmailVerification && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle bg-danger rounded-circle"
                  style={{ width: '8px', height: '8px', marginLeft: '-4px', marginTop: '4px' }}
                >
                  <span className="visually-hidden">Email verification needed</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Only visible on mobile */}
      <nav className="navbar bg-dark d-lg-none d-flex justify-content-around position-sticky top-0" style={{
        height: headerHeight,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        flexShrink: 0,
        zIndex: 1030
      }} data-bs-theme="dark">
        <img src={icon} className="h-100" onClick={() => window.location.assign(localStorage.getItem('homeTarget') || '/')} />
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1" style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className={`${contentClasses} ${isDesktop && page !== 'draft' ? 'py-4' : ''}`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <nav className='d-lg-none border-top border-black bg-white position-sticky bottom-0' style={{
        height: footerHeight,
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingTop: '8px',
        flexShrink: 0,
        zIndex: 1030
      }}>
        <div className="row text-center mx-0 h-100">
          <div className="col-3 d-flex flex-column justify-content-center align-items-center" onClick={() => window.location.assign('../')}>
            <HomeIcon color={page === 'home' || page === 'draft' ? 'primary' : ''}></HomeIcon>
          </div>
          <div className="col-3 d-flex flex-column justify-content-center align-items-center" onClick={() => window.location.assign('../players')}>
            <PoolIcon color={page === 'players' ? 'primary' : ''}></PoolIcon>
          </div>
          <div className="col-3 d-flex flex-column justify-content-center align-items-center" onClick={() => window.location.assign('../notes')}>
            <EmailIcon color={page === 'notes' ? 'primary' : ''}></EmailIcon>
          </div>
          <div className="col-3 d-flex flex-column justify-content-center align-items-center position-relative" onClick={() => window.location.assign('../settings')}>
            <SettingsIcon color={page === 'settings' ? 'primary' : ''}></SettingsIcon>
            {needsEmailVerification && (
              <span 
                className="position-absolute top-0 start-50 translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ width: '8px', height: '8px', marginTop: '8px' }}
              >
                <span className="visually-hidden">Email verification needed</span>
              </span>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Main
