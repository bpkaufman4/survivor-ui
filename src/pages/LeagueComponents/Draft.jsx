import { DateTime } from "luxon";
import { useState, useEffect } from "react";

export default function Draft({ draftStartTime, onJoinDraft }) {

  const [now, setNow] = useState(DateTime.now());
  const [showDateTime, setShowDateTime] = useState(false);
  const [showJoinButton, setShowJoinButton] = useState(false);
  const [startingSoon, setStartingSoon] = useState(false);


  // Convert draft time to DateTime object once
  const draftTime = DateTime.fromISO(draftStartTime);
  const diffInMinutes = draftTime.diff(now, 'minutes').toObject().minutes;

  useEffect(() => {

    function checkTime() {
      const newNow = DateTime.now();
      const minutesUntilDraft = draftTime.diff(newNow, 'minutes').toObject().minutes;
      setNow(newNow);

      setShowDateTime(minutesUntilDraft > 5);
      setStartingSoon(minutesUntilDraft <= 5 && minutesUntilDraft > 0);
      setShowJoinButton(minutesUntilDraft <= 5);
    }

    checkTime();
    const interval = setInterval(checkTime, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (showJoinButton) {
    return (
      <div className="w-100 mt-3 d-flex justify-content-between align-items-center">
        <p className="m-0">{startingSoon ? 'Draft starting soon!' : 'Draft ongoing!'}</p>
        <button onClick={onJoinDraft} className="btn btn-primary">Join Draft</button>
      </div>
    );
  } else if(showDateTime) {
    return (
      <div className="w-100 mt-3">
        <p>Draft: {draftTime.toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    );
  } else {
    return <></>
  }
}
