import { useState } from "react";
import AdminMain from "../components/AdminMain";
import Table from "./AdminLeaguesComponents/Table";
import SetPlayers from "./AdminLeaguesComponents/SetPlayers";
import "../assets/admin-common.css";
import "../assets/admin-leagues.css";

export default function AdminLeagues() {

  const [view, setView] = useState('table')
  const [setPlayersLeagueId, setSetPlayersLeagueId] = useState(null);
  const [setPlayersUnrestricted, setSetPlayersUnrestricted] = useState(false);

  function Content() {
    switch(view) {
      default:
      case 'table':
        return <Table setView={setView} setSetPlayersLeagueId={setSetPlayersLeagueId} setSetPlayersUnrestricted={setSetPlayersUnrestricted}/>;
      case 'set-players':
        return <SetPlayers setView={setView} leagueId={setPlayersLeagueId} setSetPlayersLeagueId={setSetPlayersLeagueId} isUnrestricted={setPlayersUnrestricted}/>;
    }
  }

  return (
    <Content></Content>
  );
}