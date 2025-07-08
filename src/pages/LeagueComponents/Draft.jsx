import { DateTime } from "luxon";
import { useState, useEffect, useMemo } from "react";
import apiUrl from "../../apiUrls";

export default function Draft({ draftStartTime, onJoinDraft, leagueId }) {

  const [showDateTime, setShowDateTime] = useState(false);
  const [showJoinButton, setShowJoinButton] = useState(false);
  const [startingSoon, setStartingSoon] = useState(false);
  const [draftStatus, setDraftStatus] = useState(null); // null, 'pending', 'active', 'complete'

  // Memoize draftTime to prevent it from changing on every render
  const draftTime = useMemo(() => {
    if (!draftStartTime) {
      console.log('[Draft] No draftStartTime provided');
      return null;
    }
    console.log('[Draft] Creating draftTime from:', draftStartTime);
    return DateTime.fromISO(draftStartTime);
  }, [draftStartTime]);

  console.log('[Draft] Component render - Status:', draftStatus, 'LeagueId:', leagueId, 'DraftTime:', draftTime?.toISO());

  // Don't render anything if we don't have the basic props
  if (!draftTime || !leagueId) {
    console.log('[Draft] Missing required props, not rendering');
    return <></>;
  }

  useEffect(() => {
    console.log('[Draft] Status check useEffect triggered - LeagueId:', leagueId);
    
    async function checkDraftStatus() {
      if (!leagueId) {
        console.log('[Draft] No leagueId provided, skipping status check');
        return;
      }
      
      console.log('[Draft] Checking draft status for league:', leagueId);
      
      try {
        const response = await fetch(`${apiUrl}draft/byLeague/${leagueId}`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        });
        const data = await response.json();
        
        console.log('[Draft] API Response:', data);
        
        if (data.status === 'success' && data.data) {
          const now = new Date();
          const startTime = new Date(data.data.startDate);
          
          console.log('[Draft] Now:', now, 'Start time:', startTime, 'Complete:', data.data.complete);
          
          let newStatus;
          if (data.data.complete) {
            newStatus = 'complete';
          } else if (now >= startTime) {
            newStatus = 'active';
          } else {
            newStatus = 'pending';
          }
          
          console.log('[Draft] Setting status to:', newStatus);
          setDraftStatus(newStatus);
        } else {
          console.log('[Draft] No draft data found, setting status to pending');
          setDraftStatus('pending');
        }
      } catch (error) {
        console.error('[Draft] Error checking draft status:', error);
        setDraftStatus('pending');
      }
    }

    // Initial check
    checkDraftStatus();
    
    // Set up interval for periodic status checks
    const statusInterval = setInterval(() => {
      console.log('[Draft] Periodic status check triggered');
      checkDraftStatus();
    }, 60000); // Check draft status every minute

    return () => {
      console.log('[Draft] Cleaning up status check interval');
      clearInterval(statusInterval);
    };
  }, [leagueId]); // Only depend on leagueId

  // Separate useEffect for time-based UI updates
  useEffect(() => {
    if (!draftTime) {
      console.log('[Draft] No draftTime available for time checks');
      return () => {}; // Return empty cleanup function
    }
    
    console.log('[Draft] Time check useEffect triggered - DraftTime:', draftTime.toISO(), 'Status:', draftStatus);
    
    function checkTime() {
      const newNow = DateTime.now();
      const minutesUntilDraft = draftTime.diff(newNow, 'minutes').toObject().minutes;
      
      console.log('[Draft] Time check - Minutes until draft:', minutesUntilDraft, 'Status:', draftStatus);

      // Only show time-based UI if draft is still pending
      if (draftStatus === 'pending' || draftStatus === null) {
        const shouldShowDateTime = minutesUntilDraft > 5;
        const shouldStartingSoon = minutesUntilDraft <= 5 && minutesUntilDraft > 0;
        const shouldShowJoinButton = minutesUntilDraft <= 5;
        
        // Only update state if values have actually changed to prevent unnecessary re-renders
        setShowDateTime(prev => prev !== shouldShowDateTime ? shouldShowDateTime : prev);
        setStartingSoon(prev => prev !== shouldStartingSoon ? shouldStartingSoon : prev);
        setShowJoinButton(prev => prev !== shouldShowJoinButton ? shouldShowJoinButton : prev);
        
        console.log('[Draft] UI State updates:', {
          showDateTime: shouldShowDateTime,
          startingSoon: shouldStartingSoon,
          showJoinButton: shouldShowJoinButton
        });
      } else {
        console.log('[Draft] Draft not pending, hiding time-based UI');
        setShowDateTime(false);
        setStartingSoon(false);
        setShowJoinButton(false);
      }
    }

    checkTime();
    const timeInterval = setInterval(() => {
      console.log('[Draft] Periodic time check triggered');
      checkTime();
    }, 10000); // Check time every 10 seconds

    return () => {
      console.log('[Draft] Cleaning up time check interval');
      clearInterval(timeInterval);
    };
  }, [draftTime, draftStatus]); // This can depend on draftStatus since it's not updating it

  // Handle different draft statuses
  console.log('[Draft] Render logic - Status:', draftStatus, 'ShowJoinButton:', showJoinButton, 'ShowDateTime:', showDateTime);
  
  if (draftStatus === 'active' || showJoinButton) {
    console.log('[Draft] Rendering active/join button status');
    return (
      <div className="alert alert-primary d-flex align-items-center justify-content-between border-0 shadow-sm mt-3" role="alert">
        <div className="d-flex align-items-center">
          <div>
            <strong>{draftStatus === 'active' ? 'Draft Ongoing!' : startingSoon ? 'Draft Starting Soon!' : 'Draft Ongoing!'}</strong>
            <div className="small text-muted">
              {draftStatus === 'active' ? 'Join your league draft now' : startingSoon ? 'Get ready to draft your team' : 'Join your league draft now'}
            </div>
          </div>
        </div>
        <button onClick={onJoinDraft} className="btn btn-primary btn-lg">
          Join Draft
        </button>
      </div>
    );
  }

  if (draftStatus === 'pending' && showDateTime) {
    console.log('[Draft] Rendering pending/scheduled status');
    return (
      <div className="alert alert-info border-0 shadow-sm mt-3" role="alert">
        <div className="d-flex align-items-center">
          <span className="me-2">📅</span>
          <div>
            <strong>Draft Scheduled</strong>
            <div className="small">
              {draftTime.toLocaleString({ 
                weekday: 'long', 
                month: 'long', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[Draft] Rendering nothing (empty)');
  return <></>;
}
