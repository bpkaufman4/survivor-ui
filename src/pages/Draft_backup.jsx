import { useParams, useNavigate } from "react-router-dom";
import websocketUrl from "../websocketUrls";
import { useEffect, useRef, useState } from "react";
import { handleGet } from "../helpers/helpers";
import Main from "../components/Main";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "../assets/draft.css"

export default function Draft() {

  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [draftOrder, setDraftOrder] = useState([]);
  const [currentPickingTeam, setCurrentPickingTeam] = useState(null);
  const [currentPick, setCurrentPick] = useState(null);
  const [myTeamId, setMyTeamId] = useState(null);
  const [timerStart, setTimerStart] = useState(null);
  const [timerDuration, setTimerDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [splitRatio, setSplitRatio] = useState(30); // Draft order section percentage
  const [isDragging, setIsDragging] = useState(false);
  const socketRef = useRef(null);
  const containerRef = useRef(null);

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
            if (payload.draftOrder) {
              setDraftOrder(payload.draftOrder);

              console.log('Draft order:', payload.draftOrder);
              console.log('Looking for currentPick === 1');

              const [pickingTeam] = payload.draftOrder.filter(p => {
                console.log(`Pick ${p.pickNumber}: currentPick = ${p.currentPick}`);
                return p.currentPick === 1;
              });

              console.log('Found picking team:', pickingTeam);

              if (pickingTeam) {
                setCurrentPick(pickingTeam);
                setCurrentPickingTeam(pickingTeam.team);
                console.log('Set current picking team:', pickingTeam.team);
              } else {
                setCurrentPick(null);
                setCurrentPickingTeam(null);
                console.log('No current pick found');
              }
            }
            if (payload.availablePlayers) setAvailablePlayers(payload.availablePlayers);
            if (payload.myTeam) setMyTeamId(payload.myTeam.teamId);
            break;
          case 'draft-timer-started':
            setTimerStart(payload.startTime);
            setTimerDuration(payload.timeoutMs);
            break;
          case 'pick-made':
            // Update draft order and current pick when a pick is made
            if (payload.draftOrder) {
              setDraftOrder(payload.draftOrder);

              const [pickingTeam] = payload.draftOrder.filter(p => p.currentPick === 1);
              if (pickingTeam) {
                setCurrentPick(pickingTeam);
                setCurrentPickingTeam(pickingTeam.team);
              } else {
                setCurrentPick(null);
                setCurrentPickingTeam(null);
              }
            }
            if (payload.availablePlayers) setAvailablePlayers(payload.availablePlayers);
            break;
          case 'auto-pick-made':
            // Handle auto picks the same way as manual picks
            // The server should send updated draft data with this message
            console.log('Auto pick made:', payload);
            break;
        }
      }
    };

    async function getMe() {
      const me = await handleGet('user/me', setError);
      if (me.status === 'success') setUserId(me.data.userId);
    }

    getMe();

    return () => {
      ws.close();
    };
  }, [leagueId])

  useEffect(() => {
    if (!timerStart || !timerDuration) {
      setTimeLeft(null);
      return;
    }
    const update = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((timerStart + timerDuration - now) / 1000));
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [timerStart, timerDuration]);

  if (error) return <p>Something went wrong</p>
  const currentPicker = !currentPickingTeam ? '' : currentPickingTeam.teamId === myTeamId ? 'You' : `${currentPickingTeam.owner.firstName} ${currentPickingTeam.owner.lastName}`;
  
  // Handle resize dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const getClientY = (e) => {
    // Handle both mouse and touch events
    return e.touches ? e.touches[0].clientY : e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const clientY = getClientY(e);
    const mouseY = clientY - containerRect.top;
    
    // Calculate new split ratio as percentage
    const newRatio = Math.max(10, Math.min(80, (mouseY / containerHeight) * 100));
    setSplitRatio(newRatio);
  };

  const handleTouchMove = (e) => {
    handleMouseMove(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
      document.body.style.touchAction = 'none'; // Prevent scrolling on mobile while dragging
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
      };
    }
  }, [isDragging]);

  return (
    <Main page="draft" additionalClasses="p-0 d-flex flex-column h-100">
      {/* Ultra-compact single row header */}
      <div className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between px-2 py-1">
          {/* Left side: Back button and title */}
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-secondary btn-sm me-2 p-1" 
              onClick={() => navigate(`/league/${leagueId}`)}
              style={{lineHeight: 1}}
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <h6 className="mb-0">Draft</h6>
          </div>
          
          {/* Center: Current picker status */}          <div className="flex-grow-1 text-center mx-3">
            {currentPick ? (
              <small>On the clock: <strong className="text-primary">{currentPicker}</strong></small>
            ) : (
              <small className="text-muted">Draft Inactive</small>
            )}
          </div>

          {/* Right side: Timer */}
          <div>
            {currentPick && (
              <span className={`badge ${
                timeLeft === null ? 'bg-secondary' :
                timeLeft <= 10 ? 'bg-danger' :
                timeLeft <= 30 ? 'bg-warning' :
                'bg-success'
              } text-white`}>
                {timeLeft !== null
                  ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                  : '--:--'}
              </span>            )}
          </div>
        </div>
      </div>

      {/* Main content area taking all available space */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden" ref={containerRef}>
        {/* Top section - Draft Order (dynamic percentage) */}
        <div className="border-bottom d-flex flex-column" style={{height: `${splitRatio}%`, minHeight: '100px'}}>
          <div className="flex-grow-1 overflow-auto">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{width: '50px'}} className="py-1 px-2">Pick</th>
                  <th className="py-1 px-2">Team</th>
                  <th className="py-1 px-2">Contestant</th>
                </tr>
              </thead>
              <tbody>
                {draftOrder && draftOrder.map(dp => {

                  let rowClasses = '';

                  if (dp.currentPick === 1) {
                    rowClasses = 'table-warning';
                  } else if (dp.team.teamId === myTeamId) {
                    rowClasses = 'table-info';
                  }

                  return (
                    <tr key={dp.draftPickId} className={rowClasses}>                      <td className="py-1 px-2"><strong>#{dp.pickNumber}</strong></td>
                      <td className="py-1 px-2">{dp.team.owner.firstName} {dp.team.owner.lastName}</td>
                      <td className="py-1 px-2">{dp.player ? `${dp.player.firstName} ${dp.player.lastName}` : <em className="text-muted">TBD</em>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resize handle */}
        <div 
          className="bg-light border-top border-bottom d-flex align-items-center justify-content-center"
          style={{
            height: '20px',
            cursor: 'row-resize',
            backgroundColor: isDragging ? '#dee2e6' : '#f8f9fa',
            borderColor: isDragging ? '#6c757d' : '#dee2e6'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div 
            style={{
              width: '40px',
              height: '3px',
              backgroundColor: '#6c757d',
              borderRadius: '2px'
            }}
          />
        </div>

        {/* Bottom section - Available Players (remaining space) */}
        <div className="d-flex flex-column" style={{height: `${100 - splitRatio}%`, minHeight: '100px'}}>          <div className="px-2 py-1 border-bottom bg-light">
            <small className="text-muted fw-bold">AVAILABLE PLAYERS</small>
          </div>
          <div className="flex-grow-1 overflow-auto">
            <table className="table table-hover mb-0">
              <tbody>
                {availablePlayers && availablePlayers.map(ap => {
                  function pickPlayer() {
                    socketRef.current?.send(JSON.stringify({ 
                      type: "pick", 
                      payload: { 
                        player: ap, 
                        token: localStorage.getItem('jwt'), 
                        leagueId, 
                        pick: currentPick                      } 
                    }));
                  }

                  return (
                    <tr key={ap.playerId}>
                      <td className="py-1 px-2">
                        <img 
                          src={ap.photoUrl} 
                          alt={`${ap.firstName} ${ap.lastName}`} 
                          className="rounded"
                          style={{ height: '32px', width: '32px', objectFit: 'cover' }}                        />
                      </td>
                      <td className="align-middle py-1 px-2">
                        <strong>{ap.firstName} {ap.lastName}</strong>
                      </td>
                      {(currentPickingTeam && currentPickingTeam.teamId === myTeamId) && 
                        <td className="align-middle py-1 px-2">
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={pickPlayer}
                          >
                            Pick
                          </button>
                        </td>
                      }
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Main>
  )
}