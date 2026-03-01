import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [role, setRole] = useState("participant"); // 'participant' | 'judge'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    if (role === "participant" && !githubRepo.trim()) {
      setError("Please enter your GitHub repository link.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email, password };
      if (role === "participant") payload.githubRepo = githubRepo.trim();

      const res = await axios.post("/api/auth/login", payload);
      const { token, user } = res.data;

      // Guard: make sure role in DB matches selected tab
      if (user.role !== role) {
        setError(`This account is registered as a ${user.role}, not a ${role}.`);
        return;
      }

      login(token, user);

      if (user.role === "judge") {
        navigate("/judge", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-header">
          <span className="login-icon">🛡️</span>
          <h2>Hackathon Monitor</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Role tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${role === "participant" ? "active" : ""}`}
            onClick={() => { setRole("participant"); setError(""); }}
          >
            👤 Participant
          </button>
          <button
            type="button"
            className={`login-tab ${role === "judge" ? "active" : ""}`}
            onClick={() => { setRole("judge"); setError(""); }}
          >
            ⚖️ Judge
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">
          Email
          <input
            type="email"
            className="login-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
        </label>

        <label className="login-label">
          Password
          <input
            type="password"
            className="login-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {/* GitHub repo — only for participants */}
        {role === "participant" && (
          <label className="login-label">
            GitHub Repository
            <input
              type="text"
              className="login-input"
              placeholder="https://github.com/owner/repo  or  owner/repo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              autoComplete="off"
            />
            <span className="login-hint">
              Your team's hackathon repo — commits will be tracked from here.
            </span>
          </label>
        )}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
