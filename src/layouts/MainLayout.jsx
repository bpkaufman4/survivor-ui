import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import "../assets/bootstrap.min.css"
import HomeIcon from '@mui/icons-material/Home';
import PoolIcon from '@mui/icons-material/Pool';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import icon from '../assets/island-white.png'
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const headerHeight = '64px';
const footerHeight = '74px';

const MainLayout = () => {
  console.log('MainLayout rendering'); // Debug log
  const { needsEmailVerification } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine page type from current route
  const isDraftPage = location.pathname.startsWith('/draft');
  
  // For draft page, use full width without container padding
  let contentClasses = isDraftPage ? "" : "container py-3";

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Desktop Header Navigation - Only visible on desktop */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark d-none d-lg-flex" style={{height: headerHeight, flexShrink: 0}}>
        <div className="container-fluid">
          {/* Brand */}
          <Link 
            className="navbar-brand d-flex align-items-center"
            style={{cursor: 'pointer'}}
            to={localStorage.getItem('homeTarget') || '/'}
          >
            <img 
              src={icon} 
              alt="Fantasy Survivor" 
              height="32"
              className="me-2"
            />
            <span>Fantasy Survivor</span>
          </Link>

          {/* Navigation Links */}
          <div className="navbar-nav flex-row ms-auto">
            <NavLink 
              to="/"
              className={({ isActive }) => `nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center ${isActive || isDraftPage ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
            >
              <HomeIcon className="me-1" fontSize="small" />
              Home
            </NavLink>
            <NavLink 
              to="/players"
              className={({ isActive }) => `nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center ${isActive ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
            >
              <PoolIcon className="me-1" fontSize="small" />
              Players
            </NavLink>
            <NavLink 
              to="/notes"
              className={({ isActive }) => `nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center ${isActive ? 'bg-primary' : ''}`}
              style={{cursor: 'pointer'}}
            >
              <EmailIcon className="me-1" fontSize="small" />
              Notes
            </NavLink>
            <NavLink 
              to="/settings"
              className={({ isActive }) => `nav-link text-white px-3 py-2 mx-1 rounded d-flex align-items-center position-relative ${isActive ? 'bg-primary' : ''}`}
              style={{
                cursor: 'pointer',
                animation: needsEmailVerification ? 'backgroundPulse 2s infinite' : 'none'
              }}
            >
              <SettingsIcon className="me-1" fontSize="small" />
              Settings
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Only visible on mobile */}
      <nav className="navbar bg-dark d-lg-none d-flex justify-content-around position-sticky top-0" style={{
        height: headerHeight,
        padding: '12px',
        flexShrink: 0,
        zIndex: 1030
      }} data-bs-theme="dark">
        <Link to={localStorage.getItem('homeTarget') || '/'}>
          <img src={icon} height={44} alt="Fantasy Survivor" />
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1">
        <div className={`${contentClasses} ${isDesktop && !isDraftPage ? 'py-4' : ''}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <nav className='d-lg-none border-top border-black bg-white position-sticky bottom-0' style={{
        flexShrink: 0,
        zIndex: 1030
      }}>
        <div className="row mx-0 h-100">
          <NavLink 
            to="/" 
            className="col-3 d-flex flex-column justify-content-center align-items-center text-decoration-none pt-2 pb-4"
          >
            {({ isActive }) => (
              <HomeIcon color={isActive || isDraftPage ? 'primary' : 'action'} fontSize="large" />
            )}
          </NavLink>
          <NavLink 
            to="/players" 
            className="col-3 d-flex flex-column justify-content-center align-items-center text-decoration-none pt-2 pb-4"
          >
            {({ isActive }) => (
              <PoolIcon color={isActive ? 'primary' : 'action'} fontSize="large" />
            )}
          </NavLink>
          <NavLink 
            to="/notes" 
            className="col-3 d-flex flex-column justify-content-center align-items-center text-decoration-none pt-2 pb-4"
          >
            {({ isActive }) => (
              <EmailIcon color={isActive ? 'primary' : 'action'} fontSize="large" />
            )}
          </NavLink>
          <NavLink 
            to="/settings"
            className="col-3 d-flex flex-column justify-content-center align-items-center position-relative text-decoration-none pt-2 pb-4"
            style={{
              animation: needsEmailVerification ? 'backgroundPulse 2s infinite' : 'none'
            }}
          >
            {({ isActive }) => (
              <SettingsIcon color={isActive ? 'primary' : 'action'} fontSize="large" />
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default React.memo(MainLayout);
