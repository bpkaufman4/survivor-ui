import { useParams } from "react-router-dom";
import websocketUrl from "../websocketUrls";


export default function Draft() {
  const { leagueId } = useParams();

  const ws = new WebSocket(websocketUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", payload: { leagueId } }));
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message);
    if (message.type === "pick_made") {
      console.log("New pick:", message.payload);
    }
  };

  function sendPick(pick) {
    ws.send(JSON.stringify({ type: "pick", payload: pick }));
  }

  return <>{leagueId}</>
}