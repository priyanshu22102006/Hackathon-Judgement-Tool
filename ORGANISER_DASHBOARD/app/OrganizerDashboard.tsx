"use client";

// ============================================================================
// Organizer Dashboard - Main Page Component
// ============================================================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Settings, Activity, Shield, Clock } from "lucide-react";

import {
  useDashboardData,
  useConfiguration,
  useAlerts,
  useReports,
  useToasts,
  staggerContainer,
  fadeInUp,
} from "../hooks";
import {
  AnimatedBackground,
  GlassCard,
  GlowingBadge,
  StatusIndicator,
} from "../components/ui/Cards";
import { ToastContainer } from "../components/ui/Modals";
import {
  OverviewCards,
  LiveActivitySummary,
} from "../components/dashboard/OverviewSection";
import {
  ActivityHeatmap,
  ComplianceChart,
  LocationChart,
  ComplianceHistoryChart,
  ViolationsChart,
} from "../components/dashboard/Charts";
import { ControlCenter } from "../components/dashboard/ControlCenter";
import { RecentCommitsFeed } from "../components/dashboard/RecentCommits";
import { MentorSupportCenter } from "../components/dashboard/MentorSupportCenter";

// ============================================================================
// Main Dashboard Component
// ============================================================================
export default function OrganizerDashboard() {
  const dashboard = useDashboardData();
  const configHook = useConfiguration(dashboard.configuration);
  const alertsHook = useAlerts();
  const reportsHook = useReports();
  const { toasts, addToast, removeToast } = useToasts();

  // Client-side only time display to avoid hydration mismatch
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    setFormattedTime(new Date(dashboard.lastUpdated).toLocaleTimeString());
  }, [dashboard.lastUpdated]);

  // Handle configuration save
  const handleSave = async () => {
    const success = await configHook.saveConfiguration();
    if (success) {
      addToast("success", "Settings Saved", "Configuration updated successfully");
    } else {
      addToast("error", "Save Failed", "Failed to save configuration");
    }
    return success;
  };

  // Handle status change
  const handleStatusChange = async (status: "not-started" | "live" | "ended") => {
    const success = await configHook.updateHackathonStatus(status);
    if (success) {
      const messages = {
        "not-started": "Hackathon has been reset",
        live: "Hackathon is now LIVE!",
        ended: "Hackathon has ended",
      };
      addToast(
        status === "live" ? "success" : "info",
        "Status Updated",
        messages[status]
      );
    } else {
      addToast("error", "Update Failed", "Failed to update hackathon status");
    }
    return success;
  };

  // Handle alert dismiss
  const handleDismissAlert = async (alertId: string) => {
    const success = await alertsHook.dismissAlert(alertId);
    if (success) {
      addToast("info", "Alert Dismissed", "Alert has been dismissed");
    }
  };

  // Handle send mentor
  const handleSendMentor = async (teamId: string) => {
    const success = await alertsHook.sendMentor(teamId);
    if (success) {
      addToast("success", "Mentor Assigned", "A mentor has been notified");
    } else {
      addToast("error", "Assignment Failed", "Failed to assign mentor");
    }
  };

  // Handle generate reports
  const handleGenerateReports = async () => {
    const url = await reportsHook.generateReports();
    if (url) {
      addToast("success", "Reports Ready", "Reports generated successfully");
    } else {
      addToast("error", "Generation Failed", "Failed to generate reports");
    }
    return url;
  };

  // Show loading toast on refresh
  useEffect(() => {
    if (dashboard.isLoading) {
      // Optionally show loading state
    }
  }, [dashboard.isLoading]);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <AnimatedBackground />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-[1920px] mx-auto space-y-6"
      >
        {/* Header */}
        <motion.header
          variants={fadeInUp}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Organizer Dashboard
              </h1>
              <StatusIndicator
                status={configHook.config.hackathonStatus}
                label={
                  configHook.config.hackathonStatus === "live"
                    ? "Live"
                    : configHook.config.hackathonStatus === "ended"
                    ? "Ended"
                    : "Not Started"
                }
                size="md"
              />
            </div>
            <p className="text-slate-400 text-sm">
              Monitor, manage, and control your hackathon in real-time
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span suppressHydrationWarning>
                Updated{" "}
                {formattedTime || "--:--:--"}
              </span>
            </div>
            {/* Refresh Button */}
            <motion.button
              onClick={dashboard.refetch}
              disabled={dashboard.isLoading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw
                className={`w-5 h-5 ${dashboard.isLoading ? "animate-spin" : ""}`}
              />
            </motion.button>
          </div>
        </motion.header>

        {/* KPI Overview Cards */}
        <motion.section variants={fadeInUp}>
          <OverviewCards data={dashboard.overview} teams={dashboard.teams} />
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Charts & Monitoring */}
          <div className="lg:col-span-8 space-y-6">
            {/* Activity Heatmap */}
            <motion.div variants={fadeInUp}>
              <ActivityHeatmap data={dashboard.liveActivity.realTimeActivityHeatmap} />
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <ComplianceChart
                  compliant={dashboard.compliance.teamsFullyCompliant}
                  warnings={dashboard.compliance.teamsWithWarnings}
                  violations={dashboard.compliance.teamsWithMajorViolations}
                  teams={dashboard.teams}
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <LocationChart
                  onSite={dashboard.compliance.onSiteTeamsCount}
                  mixed={dashboard.compliance.mixedLocationTeams}
                  outsideGeoFence={dashboard.compliance.outsideGeoFenceTeams}
                  teams={dashboard.teams}
                />
              </motion.div>
            </div>

            {/* Compliance History & Violations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <ComplianceHistoryChart
                  data={dashboard.compliance.complianceHistory}
                  teams={dashboard.teams}
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <ViolationsChart data={dashboard.compliance.violationTypes} />
              </motion.div>
            </div>

            {/* Live Activity Summary & Recent Commits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <GlassCard glow="green" className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Live Activity
                    </h3>
                  </div>
                  <LiveActivitySummary
                    teamsCurrentlyCoding={dashboard.liveActivity.teamsCurrentlyCoding}
                    teamsIdleForLongTime={dashboard.liveActivity.teamsIdleForLongTime}
                    peakActivityTime={dashboard.liveActivity.peakActivityTime}
                  />
                </GlassCard>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <RecentCommitsFeed commits={dashboard.liveActivity.recentCommits} />
              </motion.div>
            </div>
          </div>

          {/* Right Column - Mentor Support Center & Control Center */}
          <div className="lg:col-span-4 space-y-6">
            {/* Unified Mentor Support Center (Alerts + AI Routing) */}
            <motion.div variants={fadeInUp} className="lg:h-[600px]">
              <MentorSupportCenter
                alerts={dashboard.alerts}
                onDismissAlert={handleDismissAlert}
                onSendMentor={handleSendMentor}
                onOverrideAssignment={(ticketId, newMentor) => {
                  addToast("info", "Mentor Reassigned", `Ticket ${ticketId} reassigned to ${newMentor}`);
                }}
              />
            </motion.div>

            {/* Control Center */}
            <motion.div variants={fadeInUp} className="lg:h-[calc(100vh-500px)] lg:min-h-[600px]">
              <ControlCenter
                config={configHook.config}
                onUpdateConfig={configHook.updateConfig}
                onUpdateScoringWeight={configHook.updateScoringWeight}
                onSave={handleSave}
                onStatusChange={handleStatusChange}
                onGenerateReports={handleGenerateReports}
                isSaving={configHook.isSaving}
                hasChanges={configHook.hasChanges}
                isGeneratingReports={reportsHook.isGenerating}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          variants={fadeInUp}
          className="text-center py-4 text-slate-500 text-sm"
        >
          <p>CommitLens Organizer Dashboard • Real-time Hackathon Management</p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
