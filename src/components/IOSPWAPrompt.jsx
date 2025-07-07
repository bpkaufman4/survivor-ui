import React, { useState, useEffect } from 'react';
import ShareIcon from '../assets/Ios-Share--Streamline-Outlined-Material-Symbols.svg';
import './IOSPWAPrompt.css';

const IOSPWAPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Check if already installed as PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone === true;
    
    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('ios-pwa-prompt-dismissed');
    
    setIsStandalone(isInStandaloneMode);
    
    // Show prompt if:
    // 1. Device is iOS (or in development mode)
    // 2. Not already in standalone mode (PWA)
    // 3. User hasn't dismissed the prompt before
    const shouldShowForDevice = process.env.NODE_ENV === 'development' || isIOS;
    
    if (shouldShowForDevice && !isInStandaloneMode && !hasPromptBeenDismissed) {
      // Show prompt after a short delay to avoid interrupting initial load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed the prompt
    localStorage.setItem('ios-pwa-prompt-dismissed', 'true');
  };

  const handleInstallLater = () => {
    setShowPrompt(false);
    // Don't set the dismissed flag, so they can see it again on next visit
  };

  const handleClearDismissed = () => {
    // This is for testing purposes - you can remove this in production
    localStorage.removeItem('ios-pwa-prompt-dismissed');
    console.log('PWA prompt dismiss flag cleared');
  };

  // Don't render anything if already installed as PWA
  if (isStandalone) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="ios-pwa-prompt-overlay">
      <div className="ios-pwa-prompt">
        <div className="ios-pwa-prompt-header">
          <h3>Install Fantasy Survivor</h3>
          <button 
            className="ios-pwa-prompt-close"
            onClick={handleDismiss}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="ios-pwa-prompt-content">
          <p>Get the full app experience! Install Fantasy Survivor on your home screen for:</p>
          <ul>
            <li>🚀 Faster loading</li>
            <li>📱 Full-screen experience</li>
            <li>🔔 Push notifications</li>
            <li>⚡ Offline capabilities</li>
          </ul>
          
          <div className="ios-pwa-prompt-instructions">
            <div className="ios-pwa-prompt-step">
              <span className="step-number">1</span>
              <span className="step-text">Tap the share button</span>
              <img 
                src={ShareIcon} 
                alt="iOS Share Icon" 
                className="ios-share-icon"
              />
            </div>
            
            <div className="ios-pwa-prompt-step">
              <span className="step-number">2</span>
              <span className="step-text">Tap "Add to Home Screen"</span>
            </div>
            
            <div className="ios-pwa-prompt-step">
              <span className="step-number">3</span>
              <span className="step-text">Tap "Add" to install</span>
            </div>
          </div>
        </div>
        
        <div className="ios-pwa-prompt-actions">
          <button 
            className="ios-pwa-prompt-btn ios-pwa-prompt-btn-secondary"
            onClick={handleInstallLater}
          >
            Maybe Later
          </button>
          <button 
            className="ios-pwa-prompt-btn ios-pwa-prompt-btn-primary"
            onClick={handleDismiss}
          >
            Got It!
          </button>
        </div>
        
        {/* Development helper - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            className="ios-pwa-prompt-dev-btn"
            onClick={handleClearDismissed}
            style={{ fontSize: '10px', padding: '2px 4px', marginTop: '8px' }}
          >
            Clear Dismissed (Dev)
          </button>
        )}
      </div>
    </div>
  );
};

export default IOSPWAPrompt;
