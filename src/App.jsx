import ReactDom from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminEpisodes from "./pages/AdminEpisodes";
import RequireAdmin from "./components/RequireAdmin";
import RequireUser from "./components/RequireUser";
import './assets/index.css'
import AdminNotes from "./pages/AdminNotes";
import AdminStatistics from "./pages/AdminStatistics";
import AdminPlayers from "./pages/AdminPlayers";
import AdminSurveys from "./pages/AdminSurveys";
import League from "./pages/League";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import AdminLeagues from "./pages/AdminLeagues"
import AdminDraft from "./pages/AdminDraft";
import AdminJobs from "./pages/AdminJobs";
import AdminPushNotifications from "./pages/AdminPushNotifications";
import Notes from "./pages/Notes";
import Draft from "./pages/Draft";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Leagues from "./pages/Leagues";
import Players from "./pages/Players";
import { UserProvider } from "./contexts/UserContext";
import FCMInitializer from "./components/FCMInitializer";
import IOSPWAPrompt from "./components/IOSPWAPrompt";

export default function App() {
  return (
    <UserProvider>
      <FCMInitializer />
      <IOSPWAPrompt />
      <BrowserRouter>
      <Routes>
        <Route index element={
          <RequireUser>
            <Home />
          </RequireUser>
        } />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
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
        <Route path="admin-scoring" element={
          <RequireAdmin>
            <AdminStatistics />
          </RequireAdmin>
        } />
        <Route path="admin-polls" element={
          <RequireAdmin>
            <AdminSurveys />
          </RequireAdmin>
        } />
        <Route path="admin-jobs" element={
          <RequireAdmin>
            <AdminJobs />
          </RequireAdmin>
        } />
        <Route path="admin-push-notifications" element={
          <RequireAdmin>
            <AdminPushNotifications />
          </RequireAdmin>
        } />
        <Route path="league/:leagueId" element={
          <RequireUser>
            <League />
          </RequireUser>
        } />
        <Route path="draft/:leagueId" element={
          <RequireUser>
            <Draft />
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
        <Route path="leagues" element={
          <RequireUser>
            <Leagues></Leagues>
          </RequireUser>
        } />
        <Route path="players" element={
          <RequireUser>
            <Players></Players>
          </RequireUser>
        } />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  );
}