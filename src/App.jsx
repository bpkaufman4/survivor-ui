import ReactDom from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminEpisodes from "./pages/AdminEpisodes";
import RequireAdmin from "./components/RequireAdmin";
import './assets/index.css'
import AdminNotes from "./pages/AdminNotes";
import AdminPlayers from "./pages/AdminPlayers";
import AdminSurveys from "./pages/AdminSurveys";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
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
      </Routes>
    </BrowserRouter>
  );
}