"use client";

// ============================================================================
// Control Center Panel - Rule Configuration
// ============================================================================

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Play,
  Square,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  Sliders,
  Users,
  GitCommit,
  FileText,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
} from "lucide-react";
import {
  GlassCard,
  GlowingBadge,
  StatusIndicator,
  SliderInput,
  ToggleSwitch,
} from "../ui/Cards";
import { ConfirmModal } from "../ui/Modals";
import { ScoringWeightsChart } from "./Charts";
import type { RuleConfiguration, HackathonStatus } from "../../types";

// ============================================================================
// Hackathon Status Control
// ============================================================================
interface StatusControlProps {
  status: HackathonStatus;
  onStatusChange: (status: HackathonStatus) => Promise<boolean>;
  isSaving: boolean;
}

function StatusControl({ status, onStatusChange, isSaving }: StatusControlProps) {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    targetStatus: HackathonStatus;
  }>({ isOpen: false, targetStatus: "not-started" });

  const statusConfig = {
    "not-started": {
      label: "Not Started",
      color: "slate" as const,
      action: "Start Hackathon",
      nextStatus: "live" as HackathonStatus,
      actionColor: "bg-green-500 hover:bg-green-600",
      icon: Play,
    },
    live: {
      label: "Live",
      color: "green" as const,
      action: "End Hackathon",
      nextStatus: "ended" as HackathonStatus,
      actionColor: "bg-red-500 hover:bg-red-600",
      icon: Square,
    },
    ended: {
      label: "Ended",
      color: "amber" as const,
      action: "Reset Hackathon",
      nextStatus: "not-started" as HackathonStatus,
      actionColor: "bg-slate-500 hover:bg-slate-600",
      icon: RefreshCw,
    },
  };

  const config = statusConfig[status];

  const handleConfirm = async () => {
    await onStatusChange(confirmModal.targetStatus);
    setConfirmModal({ isOpen: false, targetStatus: "not-started" });
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <StatusIndicator
            status={status === "live" ? "live" : status === "ended" ? "ended" : "not-started"}
            size="lg"
          />
          <div>
            <h4 className="text-white font-semibold">Hackathon Status</h4>
            <GlowingBadge
              color={config.color === "slate" ? "slate" : config.color}
              size="sm"
              pulse={status === "live"}
            >
              {config.label}
            </GlowingBadge>
          </div>
        </div>

        <motion.button
          onClick={() =>
            setConfirmModal({ isOpen: true, targetStatus: config.nextStatus })
          }
          disabled={isSaving}
          className={`px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 ${config.actionColor} disabled:opacity-50 transition-colors`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <config.icon className="w-5 h-5" />
          {config.action}
        </motion.button>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, targetStatus: "not-started" })}
        onConfirm={handleConfirm}
        title={`${confirmModal.targetStatus === "live" ? "Start" : confirmModal.targetStatus === "ended" ? "End" : "Reset"} Hackathon?`}
        message={
          confirmModal.targetStatus === "live"
            ? "This will start the hackathon timer and enable all tracking features."
            : confirmModal.targetStatus === "ended"
            ? "This will end the hackathon and finalize all scores. This action cannot be undone."
            : "This will reset all hackathon data. Make sure you have exported all reports first."
        }
        type={confirmModal.targetStatus === "ended" ? "danger" : "warning"}
        isLoading={isSaving}
      />
    </>
  );
}

// ============================================================================
// Time Window Configuration
// ============================================================================
interface TimeWindowConfigProps {
  timeWindow: { start: string; end: string };
  onChange: (key: "start" | "end", value: string) => void;
}

function TimeWindowConfig({ timeWindow, onChange }: TimeWindowConfigProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-purple-400" />
        <h4 className="text-sm font-semibold text-white">Time Window</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Start Time</label>
          <input
            type="datetime-local"
            value={timeWindow.start.slice(0, 16)}
            onChange={(e) => onChange("start", e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">End Time</label>
          <input
            type="datetime-local"
            value={timeWindow.end.slice(0, 16)}
            onChange={(e) => onChange("end", e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Control Center Panel
// ============================================================================
interface ControlCenterProps {
  config: RuleConfiguration;
  onUpdateConfig: <K extends keyof RuleConfiguration>(
    key: K,
    value: RuleConfiguration[K]
  ) => void;
  onUpdateScoringWeight: (
    key: keyof RuleConfiguration["scoringWeightAdjustment"],
    value: number
  ) => void;
  onSave: () => Promise<boolean>;
  onStatusChange: (status: HackathonStatus) => Promise<boolean>;
  onGenerateReports: () => Promise<string | null>;
  isSaving: boolean;
  hasChanges: boolean;
  isGeneratingReports: boolean;
}

export function ControlCenter({
  config,
  onUpdateConfig,
  onUpdateScoringWeight,
  onSave,
  onStatusChange,
  onGenerateReports,
  isSaving,
  hasChanges,
  isGeneratingReports,
}: ControlCenterProps) {
  const handleTimeWindowChange = (key: "start" | "end", value: string) => {
    onUpdateConfig("hackathonTimeWindow", {
      ...config.hackathonTimeWindow,
      [key]: value,
    });
  };

  return (
    <GlassCard glow="purple" padding="none" className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Control Center</h3>
          </div>
          {hasChanges && (
            <GlowingBadge color="amber" size="sm" pulse>
              Unsaved Changes
            </GlowingBadge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Hackathon Name */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
          <label className="text-xs text-slate-400 block mb-2">Hackathon Name</label>
          <input
            type="text"
            value={config.hackathonName}
            onChange={(e) => onUpdateConfig("hackathonName", e.target.value)}
            placeholder="Enter hackathon name"
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-lg font-semibold focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Status Control */}
        <StatusControl
          status={config.hackathonStatus}
          onStatusChange={onStatusChange}
          isSaving={isSaving}
        />

        {/* Time Window */}
        <TimeWindowConfig
          timeWindow={config.hackathonTimeWindow}
          onChange={handleTimeWindowChange}
        />

        {/* Location Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Location Settings</h4>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Allowed Locations (Geofence)
            </label>
            <input
              type="text"
              value={config.allowedLocations}
              onChange={(e) => onUpdateConfig("allowedLocations", e.target.value)}
              placeholder="e.g., Building A, Building B"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <ToggleSwitch
            label="Offline Work Allowed"
            checked={config.offlineWorkAllowed}
            onChange={(checked) => onUpdateConfig("offlineWorkAllowed", checked)}
            description="Allow teams to work without internet connection"
          />
        </div>

        {/* Numeric Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Max Team Size</label>
            <input
              type="number"
              value={config.maxTeamSize}
              onChange={(e) => onUpdateConfig("maxTeamSize", Number(e.target.value))}
              min={1}
              max={10}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Auto-DQ Inactive (hrs)
            </label>
            <input
              type="number"
              value={config.autoDisqualifyInactiveHours}
              onChange={(e) =>
                onUpdateConfig("autoDisqualifyInactiveHours", Number(e.target.value))
              }
              min={1}
              max={24}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Scoring Weights</h4>
          </div>

          <ScoringWeightsChart weights={config.scoringWeightAdjustment} />

          <div className="space-y-3">
            <SliderInput
              label="Commits"
              value={config.scoringWeightAdjustment.commits}
              onChange={(v) => onUpdateScoringWeight("commits", v)}
              color="purple"
            />
            <SliderInput
              label="Code Quality"
              value={config.scoringWeightAdjustment.codeQuality}
              onChange={(v) => onUpdateScoringWeight("codeQuality", v)}
              color="cyan"
            />
            <SliderInput
              label="Collaboration"
              value={config.scoringWeightAdjustment.collaboration}
              onChange={(v) => onUpdateScoringWeight("collaboration", v)}
              color="green"
            />
            <SliderInput
              label="Consistency"
              value={config.scoringWeightAdjustment.consistency}
              onChange={(v) => onUpdateScoringWeight("consistency", v)}
              color="amber"
            />
            <SliderInput
              label="Innovation"
              value={config.scoringWeightAdjustment.innovation}
              onChange={(v) => onUpdateScoringWeight("innovation", v)}
              color="purple"
            />
          </div>
        </div>

        {/* Generate Reports (only when ended) */}
        {config.hackathonStatus === "ended" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-green-400" />
              <h4 className="text-sm font-semibold text-green-400">
                Generate Final Reports
              </h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Create comprehensive reports including team rankings, fairness scores,
              and activity summaries.
            </p>
            <motion.button
              onClick={onGenerateReports}
              disabled={isGeneratingReports}
              className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGeneratingReports ? (
                <>
                  <motion.span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate & Download Reports
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Save Footer */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
            hasChanges
              ? "bg-purple-500 text-white hover:bg-purple-600"
              : "bg-slate-700 text-slate-400"
          } disabled:opacity-50`}
          whileHover={hasChanges ? { scale: 1.02 } : {}}
          whileTap={hasChanges ? { scale: 0.98 } : {}}
        >
          {isSaving ? (
            <>
              <motion.span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Configuration
            </>
          )}
        </motion.button>
      </div>
    </GlassCard>
  );
}
