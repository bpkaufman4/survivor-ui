import { useState } from "react";
import AdminMain from "../components/AdminMain";
import Table from "./AdminLeaguesComponents/Table";

export default function AdminLeagues() {

  const [view, setView] = useState('table')

  function Content() {
    switch(view) {
      default:
      case 'table':
        return <Table />;
    }
  }

  return (<AdminMain page="admin-leagues">
    <Content></Content>
  </AdminMain>);
}