import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import JudgeDashboard from "./pages/JudgeDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="top-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🟡</span>
            <span className="nav-brand">Hackathon Monitor</span>
          </div>
          <div className="nav-links">
            <NavLink to="/">Participant</NavLink>
            <NavLink to="/judge">Judge</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ParticipantDashboard />} />
            <Route path="/judge" element={<JudgeDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
