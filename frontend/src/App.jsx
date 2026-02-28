import { Routes, Route, NavLink } from "react-router-dom";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";

export default function App() {
  return (
    <>
      <header className="app-header">
        <h1>🛡️ Hackathon Monitor</h1>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            end
          >
            Participant
          </NavLink>
          <NavLink
            to="/judge"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Judge
          </NavLink>
        </nav>
      </header>

      <div className="page">
        <Routes>
          <Route path="/" element={<ParticipantDashboard />} />
          <Route path="/judge" element={<JudgeDashboard />} />
        </Routes>
      </div>
    </>
  );
}
