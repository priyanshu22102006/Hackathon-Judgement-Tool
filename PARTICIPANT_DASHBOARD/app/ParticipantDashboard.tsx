"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, XCircle, Flag } from "lucide-react";

// Components
import {
  AnimatedBackground,
  StatCard,
  ToastContainer,
  ExplanationModal,
  CommitTimelineChart,
  ContributionBarChart,
  HeaderSection,
  FairnessCard,
  FlagsList,
  LearningSummarySection,
  LoadingSpinner,
  BeginnerSurvivalGuide,
  MentorHelpSection,
  RemarksSection,
} from "../components";

// Hooks
import {
  useDashboard,
  useFlags,
  useToasts,
  useTimeRemaining,
} from "../hooks";

// Types
import type { DetectedFlag } from "../types";

interface ParticipantDashboardProps {
  teamId?: string;
}

export default function ParticipantDashboard({
  teamId = "codecrafters",
}: ParticipantDashboardProps) {
  // Fetch dashboard data
  const { data, loading, error, refetch } = useDashboard(teamId);

  // Toast notifications
  const { toasts, addToast, removeToast } = useToasts();

  // Flag management
  const {
    flags,
    submitExplanation,
    submitting: flagSubmitting,
  } = useFlags(data?.transparencyFlags.detectedFlags || [], teamId);

  const [selectedFlag, setSelectedFlag] = useState<DetectedFlag | null>(null);

  // Time remaining countdown
  const timeRemaining = useTimeRemaining(data?.basicInfo.endTime || "");

  // Note: Simulated notifications removed to avoid excess toggling
  // Real notifications should come from actual system events

  // Handle flag explanation submission
  const handleExplanationSubmit = async (flagId: number, explanation: string) => {
    const success = await submitExplanation(flagId, explanation);
    if (success) {
      addToast("success", "Explanation Submitted", "Your explanation has been recorded");
      setSelectedFlag(null);
    } else {
      addToast("alert", "Submission Failed", "Please try again");
    }
  };

  // Loading state
  if (loading) {
    return (
      <AnimatedBackground>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-400 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <AnimatedBackground>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Failed to load dashboard</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold hover:scale-105 active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <HeaderSection
          basicInfo={data.basicInfo}
          locationCompliance={data.locationCompliance}
          timeRemaining={timeRemaining.formatted}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Commits"
            value={data.commitActivity.totalCommits}
            icon={<Activity className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            label="In-Window"
            value={`${data.commitActivity.commitsInsideWindowPct}%`}
            icon={<CheckCircle className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            label="Outside Window"
            value={data.commitActivity.commitsOutsideWindowCount}
            icon={<XCircle className="w-8 h-8" />}
            color="red"
          />
          <StatCard
            label="Active Flags"
            value={flags.filter((f) => !f.explained).length}
            icon={<Flag className="w-8 h-8" />}
            color="yellow"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommitTimelineChart data={data.commitActivity.hourWiseTimeline} />
          <ContributionBarChart data={data.contributionBreakdown.memberStats} />
        </div>

        {/* Fairness & Flags Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FairnessCard fairness={data.fairnessIndicator} />
          <FlagsList flags={flags} onExplain={setSelectedFlag} />
        </div>

        {/* AI Mentor Routing Section */}
        <MentorHelpSection teamName={data.basicInfo.teamName} />

        {/* Remarks & Feedback from Judges/Mentors */}
        {data.teamRemarks && (
          <RemarksSection teamRemarks={data.teamRemarks} />
        )}

        {/* Beginner Survival Guide */}
        <BeginnerSurvivalGuide />

        {/* Learning Summary Footer */}
        <LearningSummarySection summary={data.transparencyFlags.learningSummary} />
      </div>

      {/* Explanation Modal */}
      <AnimatePresence>
        {selectedFlag && (
          <ExplanationModal
            flag={selectedFlag}
            onClose={() => setSelectedFlag(null)}
            onSubmit={handleExplanationSubmit}
            submitting={flagSubmitting}
          />
        )}
      </AnimatePresence>
    </AnimatedBackground>
  );
}
