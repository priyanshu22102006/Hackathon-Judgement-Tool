"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ArrowLeft, Sparkles } from "lucide-react";

import { useAuth, useRegistration, useToasts } from "../hooks";
import { authService } from "../services/authService";
import {
  AnimatedBackground,
  TiltCard,
  GitHubButton,
  GlowingBadge,
} from "../components/ui/Cards";
import { ToastContainer, SuccessModal } from "../components/ui/Modals";
import { RoleSelector } from "../components/forms/RoleSelector";
import { TeamRegistrationForm } from "../components/forms/TeamRegistrationForm";

// ============================================================================
// Main Login/Signin Page Component
// ============================================================================
export default function LoginSigninPage() {
  const auth = useAuth();
  const registration = useRegistration();
  const { toasts, addToast, dismissToast } = useToasts();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState("");

  // Handle GitHub login
  const handleGitHubLogin = async () => {
    if (!auth.selectedRole) {
      addToast("warning", "Please select your role first");
      return;
    }
    
    await auth.loginWithGitHub();
    if (auth.selectedRole === "participant") {
      addToast("info", "Welcome! Please complete your team registration.");
    } else {
      addToast("success", `Logged in as ${auth.selectedRole}`);
    }
  };

  // Handle team registration
  const handleRegisterTeam = async () => {
    const result = await registration.submitRegistration();
    if (result.success) {
      setRegisteredTeamId(`team-${Date.now()}`);
      setShowSuccessModal(true);
      addToast("success", "Team registered successfully!");
      
      // Open the repository link in a new tab
      if (result.repoUrl) {
        authService.openRepository(result.repoUrl);
      }
    } else if (registration.errors.consent) {
      addToast("error", "Please accept the consent policy");
    } else if (registration.errors.githubRepoLink) {
      addToast("error", "Please provide a valid repository link");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await auth.logout();
    registration.reset();
    addToast("info", "Logged out successfully");
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // In a real app, this would redirect to the dashboard
  };

  // Determine which view to show
  const showRegistrationForm =
    auth.isLoggedIn && auth.user?.role === "participant" && !registration.isRegistered;

  const showLoggedInMessage =
    auth.isLoggedIn && auth.user?.role !== "participant";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              CommitLens
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Transparent Commit Tracking System
          </p>
        </motion.div>

        {/* Main Card */}
        <TiltCard glow="purple" className="p-8">
          <AnimatePresence mode="wait">
            {/* Login View */}
            {!auth.isLoggedIn && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Welcome
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Sign in to access your dashboard
                  </p>
                </div>

                {/* Role Selector */}
                <RoleSelector
                  selectedRole={auth.selectedRole}
                  onSelectRole={auth.selectRole}
                />

                {/* Error Message */}
                {auth.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-sm text-red-400 text-center">
                      {auth.error}
                    </p>
                  </motion.div>
                )}

                {/* GitHub Login Button */}
                <GitHubButton
                  onClick={handleGitHubLogin}
                  isLoading={auth.isLoading}
                  disabled={!auth.selectedRole}
                />

                {/* Helper text */}
                {!auth.selectedRole && (
                  <p className="text-xs text-slate-500 text-center">
                    Select a role above to continue
                  </p>
                )}
              </motion.div>
            )}

            {/* Registration Form (Participant only) */}
            {showRegistrationForm && (
              <motion.div
                key="registration"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Back/Logout header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </button>
                  <GlowingBadge variant="purple">
                    @{auth.user?.githubUsername}
                  </GlowingBadge>
                </div>

                <TeamRegistrationForm
                  data={registration.data}
                  errors={registration.errors}
                  isSubmitting={registration.isSubmitting}
                  isValidatingRepo={registration.isValidatingRepo}
                  onUpdateField={registration.updateField}
                  onAddMember={registration.addTeamMember}
                  onUpdateMember={registration.updateTeamMember}
                  onRemoveMember={registration.removeTeamMember}
                  onSubmit={handleRegisterTeam}
                />
              </motion.div>
            )}

            {/* Logged In View (Non-participant) */}
            {showLoggedInMessage && (
              <motion.div
                key="loggedin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6"
              >
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-1"
                >
                  <img
                    src={auth.user?.avatarUrl}
                    alt={auth.user?.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </motion.div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Welcome, {auth.user?.name}!
                  </h2>
                  <p className="text-slate-400 text-sm">
                    @{auth.user?.githubUsername}
                  </p>
                </div>

                <GlowingBadge
                  variant={
                    auth.user?.role === "organizer"
                      ? "green"
                      : auth.user?.role === "judge"
                      ? "amber"
                      : "cyan"
                  }
                >
                  {auth.user?.role?.charAt(0).toUpperCase()}
                  {auth.user?.role?.slice(1)}
                </GlowingBadge>

                <p className="text-slate-500 text-sm">
                  You have successfully logged in. Redirecting to your
                  dashboard...
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

            {/* Registration Complete View */}
            {auth.isLoggedIn && registration.isRegistered && (
              <motion.div
                key="registered"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <GlowingBadge variant="green" pulse>
                  ✓ Team Registered
                </GlowingBadge>
                
                <h2 className="text-xl font-bold text-white">
                  You're all set!
                </h2>
                <p className="text-slate-400 text-sm">
                  Your team has been registered. Redirecting to participant
                  dashboard...
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

        {/* Dev Mode Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={auth.toggleMockAuth}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            [Dev] Toggle Auth State
          </button>
        </motion.div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        teamId={registeredTeamId}
        onClose={handleSuccessModalClose}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
