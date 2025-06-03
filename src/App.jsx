import ReactDom from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminEpisodes from "./pages/AdminEpisodes";
import RequireAdmin from "./components/RequireAdmin";
import './assets/index.css'

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
      </Routes>
    </BrowserRouter>
  );
}