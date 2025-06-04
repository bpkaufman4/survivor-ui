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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
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
        <Route path="admin-surveys" element={
          <RequireAdmin>
            <AdminSurveys />
          </RequireAdmin>
        } />
        <Route path="league/:leagueId" element={
          <RequireUser>
            <League />
          </RequireUser>
        } />
      </Routes>
    </BrowserRouter>
  );
}