import ReactDom from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminEpisodes from "./pages/AdminEpisodes";
import RequireAdmin from "./components/RequireAdmin";
import RequireUser from "./components/RequireUser";
import './assets/index.css'
import AdminNotes from "./pages/AdminNotes";
import AdminPlayers from "./pages/AdminPlayers";
import AdminSurveys from "./pages/AdminSurveys";
import League from "./pages/League";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import AdminLeagues from "./pages/AdminLeagues"
import Notes from "./pages/Notes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={
          <RequireUser>
            <Home />
          </RequireUser>
        } />
        <Route path="login" element={<Login />} />
        <Route path="admin-episodes" element={
          <RequireAdmin>
            <AdminEpisodes />
          </RequireAdmin>
        } />
        <Route path="admin-notes" element={
          <RequireAdmin>
            <AdminNotes />
          </RequireAdmin>
        } />
        <Route path="admin-players" element={
          <RequireAdmin>
            <AdminPlayers />
          </RequireAdmin>
        } />
        <Route path="admin-polls" element={
          <RequireAdmin>
            <AdminSurveys />
          </RequireAdmin>
        } />
        <Route path="league/:leagueId" element={
          <RequireUser>
            <League />
          </RequireUser>
        } />
        <Route path="settings" element={
          <RequireUser>
            <Settings />
          </RequireUser>
        } />
        <Route path="admin-leagues" element={
          <RequireAdmin>
            <AdminLeagues />
          </RequireAdmin>
        } />
        <Route path="notes" element={
          <RequireUser>
            <Notes></Notes>
          </RequireUser>
        } />
      </Routes>
    </BrowserRouter>
  );
}