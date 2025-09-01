import ReactDom from "react-dom/client";
import React from "react";
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
import AdminTribes from "./pages/AdminTribes";
import AdminJobs from "./pages/AdminJobs";
import AdminPushNotifications from "./pages/AdminPushNotifications";
import AdminEmails from "./pages/AdminEmails";
import Notes from "./pages/Notes";
import Draft from "./pages/Draft";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Leagues from "./pages/Leagues";
import Players from "./pages/Players";
import { AuthProvider } from "./contexts/AuthContext";
import FCMInitializer from "./components/FCMInitializer";
import IOSPWAPrompt from "./components/IOSPWAPrompt";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  console.log('App component rendering'); // Debug log
  
  return (
    <AuthProvider>
      <FCMInitializer />
      <IOSPWAPrompt />
      <BrowserRouter>
      <Routes>
        {/* Auth routes (no layout) */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        
        {/* Main app routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={
            <RequireUser>
              <Home />
            </RequireUser>
          } />
          <Route path="league/:leagueId" element={
            <RequireUser>
              <League />
            </RequireUser>
          } />
          <Route path="draft/:leagueId" element={
            <Draft />
          } />
          <Route path="settings" element={
            <RequireUser>
              <Settings />
            </RequireUser>
          } />
          <Route path="notes" element={
            <RequireUser>
              <Notes />
            </RequireUser>
          } />
          <Route path="leagues" element={
            <RequireUser>
              <Leagues />
            </RequireUser>
          } />
          <Route path="players" element={
            <RequireUser>
              <Players />
            </RequireUser>
          } />
        </Route>

        {/* Admin routes with AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="episodes" element={
            <RequireAdmin>
              <AdminEpisodes />
            </RequireAdmin>
          } />
          <Route path="notes" element={
            <RequireAdmin>
              <AdminNotes />
            </RequireAdmin>
          } />
          <Route path="players" element={
            <RequireAdmin>
              <AdminPlayers />
            </RequireAdmin>
          } />
          <Route path="scoring" element={
            <RequireAdmin>
              <AdminStatistics />
            </RequireAdmin>
          } />
          <Route path="polls" element={
            <RequireAdmin>
              <AdminSurveys />
            </RequireAdmin>
          } />
          <Route path="jobs" element={
            <RequireAdmin>
              <AdminJobs />
            </RequireAdmin>
          } />
          <Route path="push-notifications" element={
            <RequireAdmin>
              <AdminPushNotifications />
            </RequireAdmin>
          } />
          <Route path="emails" element={
            <RequireAdmin>
              <AdminEmails />
            </RequireAdmin>
          } />
          <Route path="leagues" element={
            <RequireAdmin>
              <AdminLeagues />
            </RequireAdmin>
          } />
          <Route path="tribes" element={
            <RequireAdmin>
              <AdminTribes />
            </RequireAdmin>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default React.memo(App);