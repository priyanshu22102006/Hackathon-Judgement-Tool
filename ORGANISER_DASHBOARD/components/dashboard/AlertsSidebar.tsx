"use client";

// ============================================================================
// Alerts Sidebar Component
// ============================================================================

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  Wrench,
  Activity,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { GlassCard, GlowingBadge } from "../ui/Cards";
import { AlertCard } from "../ui/Modals";
import type { MentorSupportAlerts, TeamAlert } from "../../types";

// ============================================================================
// Alert Section
// ============================================================================
interface AlertSectionProps {
  title: string;
  icon: React.ReactNode;
  alerts: TeamAlert[];
  color: "amber" | "red" | "cyan";
  onDismiss?: (alertId: string) => void;
  onSendMentor?: (teamId: string) => void;
}

function AlertSection({
  title,
  icon,
  alerts,
  color,
  onDismiss,
  onSendMentor,
}: AlertSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
        <GlowingBadge color={color} size="sm" pulse={color === "red"}>
          {alerts.length}
        </GlowingBadge>
      </div>
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.teamId}
            severity={alert.severity}
            teamName={alert.teamName}
            issue={alert.issue}
            duration={alert.duration}
            timestamp={alert.timestamp}
            onDismiss={onDismiss ? () => onDismiss(alert.teamId) : undefined}
            onSendMentor={onSendMentor ? () => onSendMentor(alert.teamId) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Alerts Sidebar
// ============================================================================
interface AlertsSidebarProps {
  alerts: MentorSupportAlerts;
  onDismissAlert: (alertId: string) => void;
  onSendMentor: (teamId: string) => void;
}

export function AlertsSidebar({
  alerts,
  onDismissAlert,
  onSendMentor,
}: AlertsSidebarProps) {
  const hasAlerts = alerts.totalActiveAlerts > 0;

  return (
    <GlassCard glow={hasAlerts ? "amber" : "none"} padding="none" className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={hasAlerts ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bell className={`w-5 h-5 ${hasAlerts ? "text-amber-400" : "text-slate-400"}`} />
            </motion.div>
            <h3 className="text-lg font-semibold text-white">Mentor Alerts</h3>
          </div>
          <GlowingBadge
            color={alerts.totalActiveAlerts > 5 ? "red" : "amber"}
            pulse={alerts.totalActiveAlerts > 5}
          >
            {alerts.totalActiveAlerts} Active
          </GlowingBadge>
        </div>
      </div>

      {/* Scrollable Alert Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Urgent Help */}
        <AlertSection
          title="Urgent Help Requested"
          icon={<AlertCircle className="w-4 h-4 text-red-400" />}
          alerts={alerts.teamsNeedingUrgentHelp}
          color="red"
          onDismiss={onDismissAlert}
          onSendMentor={onSendMentor}
        />

        {/* Build Failures */}
        <AlertSection
          title="Build Failures"
          icon={<Wrench className="w-4 h-4 text-red-400" />}
          alerts={alerts.teamsWithRepeatedBuildFailures}
          color="red"
          onDismiss={onDismissAlert}
          onSendMentor={onSendMentor}
        />

        {/* Inactive Teams */}
        <AlertSection
          title="Inactive Teams"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          alerts={alerts.teamsInactiveForXHours}
          color="amber"
          onDismiss={onDismissAlert}
          onSendMentor={onSendMentor}
        />

        {/* Low Activity */}
        <AlertSection
          title="Low Activity"
          icon={<Activity className="w-4 h-4 text-cyan-400" />}
          alerts={alerts.teamsWithVeryLowActivity}
          color="cyan"
          onDismiss={onDismissAlert}
        />

        {/* Empty State */}
        {!hasAlerts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">All Clear!</h4>
            <p className="text-slate-400 text-sm">
              No teams need immediate attention
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Actions Footer */}
      {hasAlerts && (
        <div className="p-4 border-t border-white/10">
          <motion.button
            className="w-full py-2 rounded-xl bg-purple-500/20 text-purple-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus className="w-4 h-4" />
            Assign Mentors to All
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </GlassCard>
  );
}
