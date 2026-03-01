import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Only show header when logged in */}
      {user && (
        <header className="app-header">
          <h1>🛡️ Hackathon Monitor</h1>
          <nav>
            {user.role === "participant" && (
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
                end
              >
                Dashboard
              </NavLink>
            )}
            {user.role === "judge" && (
              <NavLink
                to="/judge"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Judge Panel
              </NavLink>
            )}
            <span className="nav-user">
              {user.name || user.email} ({user.role})
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>
      )}

      <div className={user ? "page" : ""}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute role="participant">
                <ParticipantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge"
            element={
              <ProtectedRoute role="judge">
                <JudgeDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}
