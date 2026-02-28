"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Sparkles,
  ArrowLeft,
  LogOut,
  CheckCircle,
  X,
} from "lucide-react";

import { TiltCard, GlowingBadge } from "../../components/ui/Cards";
import { RoleSelector } from "../../components/forms/RoleSelector";
import { ParticipantForm } from "../../components/forms/ParticipantForm";
import { OrganizerForm } from "../../components/forms/OrganizerForm";
import { JudgeMentorForm, type JudgeMentorRegistrationData } from "../../components/forms/JudgeMentorForm";
import type {
  UserRole,
  AuthMode,
  User,
} from "../../types";
import type { ParticipantRegistrationData } from "../../lib/validations";
import type { OrganizerRegistrationData } from "../../lib/validations";

// ============================================================================
// Toast Notification Component
// ============================================================================

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const colors = {
    success: "bg-green-500/20 border-green-500/30 text-green-300",
    error: "bg-red-500/20 border-red-500/30 text-red-300",
    warning: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    info: "bg-blue-500/20 border-blue-500/30 text-blue-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${colors[toast.type]}`}
    >
      <span className="text-sm">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// Success Modal Component
// ============================================================================

function SuccessModal({
  isOpen,
  role,
  onClose,
}: {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const messages: Record<UserRole, string> = {
    participant: "Your team has been registered! Redirecting to participant dashboard...",
    organizer: "Account created successfully! Redirecting to organizer dashboard...",
    judge: "Judge account created! Redirecting to judge dashboard...",
    mentor: "Mentor account created! Redirecting to mentor dashboard...",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
        <p className="text-slate-400 mb-6">{messages[role]}</p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold"
        >
          Continue to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// GitHub OAuth Button
// ============================================================================

function GitHubButton({
  onClick,
  isLoading,
  disabled,
}: {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold
        bg-gradient-to-r from-slate-800 to-slate-700 text-white
        border border-white/10 hover:border-purple-500/50 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg shadow-black/20
      `}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Github className="w-6 h-6" />
        </motion.div>
      ) : (
        <Github className="w-6 h-6" />
      )}
      <span>Sign in with GitHub</span>
    </motion.button>
  );
}

// ============================================================================
// Main Login/Signin Page Component
// ============================================================================

export default function LoginSigninPage() {
  // Auth State
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Registration State
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // UI State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast Management
  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handle GitHub OAuth (Participant)
  const handleGitHubLogin = async () => {
    if (!selectedRole) {
      addToast("warning", "Please select your role first");
      return;
    }

    setIsLoading(true);

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUser({
      id: "user-001",
      githubUsername: "hackathon_dev",
      avatarUrl: "https://avatars.githubusercontent.com/u/12345678?v=4",
      name: "Alex Developer",
      email: "alex@github.com",
      role: "participant",
    });

    setIsLoggedIn(true);
    setIsLoading(false);
    setShowRegistrationForm(true);
    addToast("success", "GitHub authentication successful! Please complete your registration.");
  };

  // Handle Participant Registration
  const handleParticipantSubmit = async (data: ParticipantRegistrationData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsRegistered(true);
    setShowSuccessModal(true);
    addToast("success", "Team registered successfully!");
  };

  // Handle Organizer Registration
  const handleOrganizerSubmit = async (data: OrganizerRegistrationData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUser({
      id: "org-001",
      name: data.fullName,
      email: data.workEmail,
      avatarUrl: "https://i.pravatar.cc/150?img=2",
      role: "organizer",
    });

    setIsLoading(false);
    setIsLoggedIn(true);
    setIsRegistered(true);
    setShowSuccessModal(true);
    addToast("success", "Organizer account created!");
  };

  // Handle Judge/Mentor Registration
  const handleJudgeMentorSubmit = async (data: JudgeMentorRegistrationData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUser({
      id: "judge-001",
      name: data.fullName,
      email: data.email,
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      role: data.isMentor ? "mentor" : "judge",
    });

    setIsLoading(false);
    setIsLoggedIn(true);
    setIsRegistered(true);
    setShowSuccessModal(true);
    addToast("success", `${data.isMentor ? "Mentor" : "Judge"} account created!`);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setSelectedRole(null);
    setShowRegistrationForm(false);
    setIsRegistered(false);
    addToast("info", "Logged out successfully");
  };

  // Handle Success Modal Close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // In production, this would redirect to the appropriate dashboard
  };

  // Toggle Auth Mode
  const toggleAuthMode = () => {
    setAuthMode((prev: AuthMode) => (prev === "login" ? "signup" : "login"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Elegant Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* Subtle gradient orbs */}
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-lg p-6 lg:p-8 relative z-10">

        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div 
            className="inline-flex items-center gap-3 mb-5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 opacity-20 blur-sm -z-10" />
            </div>
            <span className="text-3xl font-semibold tracking-tight text-white">
              Commit<span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">Lens</span>
            </span>
          </motion.div>
          <p className="text-slate-400 text-sm font-light tracking-wide">
            {authMode === "login"
              ? "Welcome back. Sign in to continue."
              : "Join the platform. Create your account."}
          </p>
        </motion.div>

        {/* Main Card */}
        <TiltCard glow={
          selectedRole === "participant" ? "purple" :
          selectedRole === "organizer" ? "cyan" :
          selectedRole === "judge" || selectedRole === "mentor" ? "amber" : "purple"
        } className="p-8 lg:p-10 backdrop-blur-2xl bg-slate-900/60 border-slate-800/50">
            <AnimatePresence mode="wait">
              {/* Initial Role Selection View */}
              {!isLoggedIn && !showRegistrationForm && (
                <motion.div
                  key="role-select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Role Selector */}
                  <RoleSelector
                    selectedRole={selectedRole}
                    onSelectRole={setSelectedRole}
                  />

                  {/* Auth Forms based on role */}
                  <AnimatePresence mode="wait">
                    {selectedRole === "participant" && (
                      <motion.div
                        key="participant-auth"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <GitHubButton
                          onClick={handleGitHubLogin}
                          isLoading={isLoading}
                          disabled={false}
                        />
                        <p className="text-xs text-slate-500 text-center">
                          Participants must authenticate via GitHub for commit tracking
                        </p>
                      </motion.div>
                    )}

                    {selectedRole === "organizer" && (
                      <motion.div
                        key="organizer-auth"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <OrganizerForm
                          onSubmit={handleOrganizerSubmit}
                          isSubmitting={isLoading}
                          isLogin={authMode === "login"}
                          onToggleMode={toggleAuthMode}
                        />
                      </motion.div>
                    )}

                    {selectedRole === "judge" && (
                      <motion.div
                        key="judge-auth"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <JudgeMentorForm
                          onSubmit={handleJudgeMentorSubmit}
                          isSubmitting={isLoading}
                          isLogin={authMode === "login"}
                          onToggleMode={toggleAuthMode}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Helper Text */}
                  {!selectedRole && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-slate-500 text-center"
                    >
                      Select a role above to continue
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Participant Registration Form */}
              {showRegistrationForm && user && selectedRole === "participant" && !isRegistered && (
                <motion.div
                  key="participant-registration"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Back Button */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <GlowingBadge variant="purple">
                      @{user.githubUsername}
                    </GlowingBadge>
                  </div>

                  <ParticipantForm
                    githubUsername={user.githubUsername || ""}
                    onSubmit={handleParticipantSubmit}
                    isSubmitting={isLoading}
                  />
                </motion.div>
              )}

              {/* Registration Complete View */}
              {isRegistered && user && (
                <motion.div
                  key="registered"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-1"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </motion.div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Welcome, {user.name}!
                    </h2>
                    {user.githubUsername && (
                      <p className="text-slate-400 text-sm">
                        @{user.githubUsername}
                      </p>
                    )}
                  </div>

                  <GlowingBadge
                    variant={
                      user.role === "organizer" ? "green" :
                      user.role === "judge" || user.role === "mentor" ? "amber" :
                      "purple"
                    }
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </GlowingBadge>

                  <p className="text-slate-500 text-sm">
                    Registration complete. Redirecting to your dashboard...
                  </p>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 mx-auto px-6 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
        </TiltCard>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-slate-500 mt-8 font-light"
        >
          By continuing, you agree to CommitLens's <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
        </motion.p>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        <SuccessModal
          isOpen={showSuccessModal}
          role={user?.role || "participant"}
          onClose={handleSuccessModalClose}
        />
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
