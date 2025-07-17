import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import "../assets/bootstrap.min.css"
import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const adminPages = [
  {
    display: 'Episodes',
    link: '/admin/episodes'
  },
  {
    display: 'Leagues',
    link: '/admin/leagues'
  },
  {
    display: 'Notes',
    link: '/admin/notes'
  },
  {
    display: 'Players',
    link: '/admin/players'
  },
  {
    display: 'Scoring',
    link: '/admin/scoring'
  },
  {
    display: 'Polls',
    link: '/admin/polls'
  },
  {
    display: 'Tribes',
    link: '/admin/tribes'
  },
  {
    display: 'Jobs',
    link: '/admin/jobs'
  },
  {
    display: 'Push Notifications',
    link: '/admin/push-notifications'
  },
  {
    display: 'Emails',
    link: '/admin/emails'
  }
];

const AdminLayout = () => {
  console.log('AdminLayout rendering'); // Debug log
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setSidebarOpen(false); // Close mobile sidebar when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Mobile Header */}
      {isMobile && (
        <nav className="navbar navbar-dark bg-dark d-lg-none" style={{ flexShrink: 0, zIndex: 1050 }}>
          <div className="container-fluid">
            <button 
              className="navbar-toggler border-0" 
              type="button" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              {sidebarOpen ? <CloseIcon style={{ color: 'white' }} /> : <MenuIcon style={{ color: 'white' }} />}
            </button>
            <span className="navbar-brand mb-0 h1">Admin Panel</span>
          </div>
        </nav>
      )}

      <div className="d-flex flex-grow-1" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div 
          className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark ${
            isMobile ? 'position-fixed h-100 admin-sidebar-mobile' : ''
          }`} 
          style={{
            width: '280px',
            height: isMobile ? '100vh' : '100%',
            left: isMobile ? (sidebarOpen ? '0' : '-280px') : '0',
            top: isMobile ? '0' : 'auto',
            transition: 'left 0.3s ease-in-out',
            zIndex: isMobile ? 1040 : 'auto',
            paddingTop: isMobile ? '4.5rem' : '1rem', // Reduced top padding
            overflowY: isMobile ? 'auto' : 'visible', // Allow overflow for more links
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {!isMobile && (
            <>
              <Link className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none" to="/admin/players">
                <span className="fs-4">Survivor</span>
              </Link>
              <hr />
            </>
          )}
          <ul className="nav nav-pills flex-column mb-auto">
            {adminPages.map(page => (
              <li key={page.link}>
                <Link 
                  to={page.link} 
                  className="nav-link text-white"
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  {page.display}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/" className="nav-link text-white" onClick={() => isMobile && setSidebarOpen(false)}>
                Back to site
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="position-fixed w-100 h-100" 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              zIndex: 1030,
              top: 0,
              left: 0
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div 
          className="flex-grow-1" 
          style={{
            width: isMobile ? '100%' : 'calc(100% - 280px)',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="container-fluid p-3" style={{ maxWidth: '100%' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminLayout);
