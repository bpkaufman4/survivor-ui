import { useParams, useNavigate } from "react-router-dom";
import websocketUrl from "../websocketUrls";
import { useEffect, useRef, useState } from "react";
import { handleGet } from "../helpers/helpers";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "../assets/draft.css"
import chimeSound from "../assets/nfl-draft-chime.mp3"
import Swal from "sweetalert2"

export default function DraftComponent({ isAdminView = false, onBack = null }) {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [draftOrder, setDraftOrder] = useState(null);
  const [currentPickingTeam, setCurrentPickingTeam] = useState(null);
  const [currentPick, setCurrentPick] = useState(null);
  const [myTeamId, setMyTeamId] = useState(null);
  const [timerStart, setTimerStart] = useState(null);
  const [timerDuration, setTimerDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [draftStartTime, setDraftStartTime] = useState(null);
  const [draftComplete, setDraftComplete] = useState(false);
  const [splitRatio, setSplitRatio] = useState(30); // Draft order section percentage
  const [isDragging, setIsDragging] = useState(false);
  const socketRef = useRef(null);
  const containerRef = useRef(null);
  const prevCanPickRef = useRef(false);

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", payload: { token: localStorage.getItem('jwt'), leagueId } }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.payload) {
        const payload = message.payload;
        console.log(payload);

        switch (message.type) {
          default:
          case 'init':
            setAvailablePlayers(payload.availablePlayers || []);
            setDraftOrder(payload.draftOrder || []);
            setCurrentPickingTeam(payload.currentPickingTeam);
            setCurrentPick(payload.currentPick);
            setMyTeamId(payload.myTeamId);
            setUserId(payload.userId);
            setDraftStartTime(payload.draftStartTime);
            setDraftComplete(payload.draftComplete);
            setLoading(false);

            if (payload.timer) {
              setTimerStart(payload.timer.start);
              setTimerDuration(payload.timer.duration);
            }
            break;
          case 'pick':
            setAvailablePlayers(payload.availablePlayers || []);
            setDraftOrder(payload.draftOrder || []);
            setCurrentPickingTeam(payload.currentPickingTeam);
            setCurrentPick(payload.currentPick);
            setDraftComplete(payload.draftComplete);
            break;
          case 'timer-start':
            setTimerStart(payload.start);
            setTimerDuration(payload.duration);
            break;
          case 'timer-stop':
            setTimerStart(null);
            setTimerDuration(null);
            setTimeLeft(null);
            break;
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      if (loading) {
        setError('Connection lost. Please refresh the page.');
        setLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Unable to connect to the draft. Please check your connection and try again.');
      setLoading(false);
    };

    return () => {
      ws.close();
    };
  }, [leagueId]);

  // Timer logic
  useEffect(() => {
    if (timerStart && timerDuration) {
      const startTime = new Date(timerStart).getTime();
      const endTime = startTime + (timerDuration * 1000);

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [timerStart, timerDuration]);

  // Draft start countdown
  useEffect(() => {
    if (draftStartTime && !currentPick) {
      const interval = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(draftStartTime).getTime();
        const remaining = Math.max(0, startTime - now);
        
        if (remaining > 0) {
          setTimeUntilStart(remaining);
        } else {
          setTimeUntilStart(null);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [draftStartTime, currentPick]);

  // Sound and notification effects
  useEffect(() => {
    const canPick = currentPickingTeam?.teamId === myTeamId;
    
    if (canPick && !prevCanPickRef.current) {
      // Play sound when it becomes my turn
      const audio = new Audio(chimeSound);
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('Your Turn!', {
          body: 'It\'s your turn to pick in the draft.',
          icon: '/island.png'
        });
      }
    }
    
    prevCanPickRef.current = canPick;
  }, [currentPickingTeam, myTeamId]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      navigate('/leagues');
    }
  }

  function makePick(playerId) {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "pick",
        payload: { playerId }
      }));
    }
  }

  // Split panel mouse handling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(Math.max(newRatio, 20), 60)); // Limit between 20% and 60%
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Loading state
  if (loading) {
    return (
      <div className={`draft-container ${isAdminView ? 'admin-view' : ''}`}>
        <div className={`draft-header ${isAdminView ? 'admin-draft-header' : ''}`}>
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary me-3" onClick={handleBack}>
              <ArrowBackIcon />
            </button>
            <h2 className="mb-0">
              Draft {isAdminView && <span className="badge bg-danger ms-2">Admin View</span>}
            </h2>
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Connecting to draft...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`draft-container ${isAdminView ? 'admin-view' : ''}`}>
        <div className={`draft-header ${isAdminView ? 'admin-draft-header' : ''}`}>
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary me-3" onClick={handleBack}>
              <ArrowBackIcon />
            </button>
            <h2 className="mb-0">
              Draft {isAdminView && <span className="badge bg-danger ms-2">Admin View</span>}
            </h2>
          </div>
        </div>
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Connection Error</h4>
            <p>{typeof error === 'string' ? error : 'There was an error loading the draft. Please try again.'}</p>
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatCountdown(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  const canPick = currentPickingTeam?.teamId === myTeamId;
  const myTeam = draftOrder?.find(team => team.teamId === myTeamId);
  
  return (
    <div className={`draft-container ${isAdminView ? 'admin-view' : ''}`}>
      {/* Header */}
      <div className={`draft-header ${isAdminView ? 'admin-draft-header' : ''}`}>
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-secondary me-3" onClick={handleBack}>
            <ArrowBackIcon />
          </button>
          <h2 className="mb-0">
            Draft {isAdminView && <span className="badge bg-danger ms-2">Admin View</span>}
          </h2>
        </div>
        
        {/* Status and Timer */}
        <div className="draft-status">
          {timeUntilStart ? (
            <div className="draft-countdown">
              <span className="text-warning">Draft starts in: {formatCountdown(timeUntilStart)}</span>
            </div>
          ) : draftComplete ? (
            <div className="draft-complete">
              <span className="text-success fw-bold">Draft Complete!</span>
            </div>
          ) : currentPick ? (
            <div className="draft-active">
              <div className="current-pick-info">
                <span className="pick-number">Pick #{currentPick}</span>
                <span className="picking-team">{currentPickingTeam?.name} is picking</span>
                {canPick && <span className="your-turn text-warning fw-bold">YOUR TURN!</span>}
              </div>
              {timeLeft && (
                <div className="timer">
                  <span className={`time ${timeLeft <= 10 ? 'text-danger' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Draft Interface */}
      <div className="draft-main" ref={containerRef}>
        {/* Draft Order Panel */}
        <div className="draft-order-panel" style={{ width: `${splitRatio}%` }}>
          <div className="panel-header">
            <h5>Draft Order</h5>
            {myTeam && (
              <div className="my-team-info">
                <small className="text-muted">Your team: {myTeam.name}</small>
              </div>
            )}
          </div>
          
          <div className="draft-order-list">
            {draftOrder?.map((team, index) => (
              <div
                key={team.teamId}
                className={`draft-order-item ${
                  team.teamId === currentPickingTeam?.teamId ? 'picking' : ''
                } ${team.teamId === myTeamId ? 'my-team' : ''}`}
              >
                <div className="team-info">
                  <div className="team-header">
                    <span className="team-position">#{index + 1}</span>
                    <span className="team-name">{team.name}</span>
                    {team.teamId === myTeamId && <span className="you-badge">YOU</span>}
                  </div>
                  <div className="team-owner">
                    {team.owner?.firstName} {team.owner?.lastName}
                  </div>
                </div>
                
                <div className="team-picks">
                  {team.players?.map((player) => (
                    <div key={player.playerId} className="picked-player">
                      <span className="player-name">
                        {player.firstName} {player.lastName}
                      </span>
                      {player.tribe && (
                        <span className="player-tribe">{player.tribe.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Resizer */}
        <div 
          className={`draft-resizer ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          title="Drag to resize panels"
        />

        {/* Available Players Panel */}
        <div className="available-players-panel" style={{ width: `${100 - splitRatio}%` }}>
          <div className="panel-header">
            <h5>Available Players ({availablePlayers?.length || 0})</h5>
            {canPick && (
              <div className="pick-instruction">
                <span className="text-primary">Click a player to draft them</span>
              </div>
            )}
          </div>
          
          <div className="players-grid">
            {availablePlayers?.map((player) => (
              <div
                key={player.playerId}
                className={`player-card ${canPick ? 'pickable' : ''}`}
                onClick={() => canPick && makePick(player.playerId)}
              >
                <div className="player-name">
                  {player.firstName} {player.lastName}
                </div>
                {player.tribe && (
                  <div className="player-tribe">
                    {player.tribe.name}
                  </div>
                )}
              </div>
            )) || []}
          </div>
          
          {(!availablePlayers || availablePlayers.length === 0) && (
            <div className="no-players">
              <p className="text-muted">No available players</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}