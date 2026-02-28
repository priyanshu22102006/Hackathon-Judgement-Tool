"use client";

// ============================================================================
// Mentor Support Center - Unified Alerts & Mentor Routing Component
// ============================================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Radio,
  AlertTriangle,
  AlertCircle,
  Clock,
  Wrench,
  Activity,
  ChevronRight,
  UserPlus,
  Users,
  CheckCircle2,
  Loader2,
  RefreshCw,
  UserCog,
  Code2,
  Sparkles,
  XCircle,
  Search,
  Filter,
  Zap,
} from "lucide-react";
import { GlassCard, GlowingBadge } from "../ui/Cards";
import { AlertCard } from "../ui/Modals";
import type { MentorSupportAlerts, TeamAlert } from "../../types";
import type { MentorTicket, TicketStatus } from "../../types/mentorTicket";
import { MOCK_MENTOR_TICKETS, AVAILABLE_MENTORS } from "../../types/mentorTicket";

// ============================================================================
// Types
// ============================================================================
type TabType = "alerts" | "routing";

interface MentorSupportCenterProps {
  alerts: MentorSupportAlerts;
  onDismissAlert: (alertId: string) => void;
  onSendMentor: (teamId: string) => void;
  onOverrideAssignment?: (ticketId: string, newMentor: string) => void;
}

// ============================================================================
// Status Dot Component
// ============================================================================
function StatusDot({ status }: { status: TicketStatus }) {
  const config: Record<TicketStatus, { color: string; pulse: boolean }> = {
    Routing: { color: "bg-yellow-400", pulse: true },
    Assigned: { color: "bg-blue-400", pulse: false },
    Resolved: { color: "bg-green-400", pulse: false },
  };

  const { color, pulse } = config[status];

  return (
    <span className="relative flex h-2.5 w-2.5">
      {pulse && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

// ============================================================================
// Override Modal Component
// ============================================================================
function OverrideModal({
  ticket,
  onClose,
  onConfirm,
}: {
  ticket: MentorTicket;
  onClose: () => void;
  onConfirm: (mentorName: string) => void;
}) {
  const [selectedMentor, setSelectedMentor] = useState(ticket.aiAssignedMentor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <UserCog className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Override Assignment</h3>
            <p className="text-sm text-slate-400">Ticket {ticket.ticketId}</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Team: {ticket.teamName}</p>
          <p className="text-sm text-white line-clamp-2">{ticket.problemDescription}</p>
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Current: {ticket.aiAssignedMentor}</p>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select New Mentor
          </label>
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
          >
            {AVAILABLE_MENTORS.map((mentor) => (
              <option key={mentor.name} value={mentor.name}>
                {mentor.name} — {mentor.expertise.slice(0, 2).join(", ")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedMentor);
              onClose();
            }}
            disabled={selectedMentor === ticket.aiAssignedMentor}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirm Override
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Alert Section Component
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
// Ticket Row Component
// ============================================================================
function TicketRow({
  ticket,
  onOverride,
}: {
  ticket: MentorTicket;
  onOverride: () => void;
}) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const timeSince = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - then.getTime()) / 60000);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
  };

  return (
    <div className="group p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all duration-300">
      <div className="flex items-start gap-3">
        {/* Status & Time */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <StatusDot status={ticket.status} />
          <span className="text-[9px] text-slate-500 font-mono">
            {formatTime(ticket.timestamp)}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-slate-500">{ticket.ticketId}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
              ticket.status === "Routing"
                ? "bg-yellow-500/20 text-yellow-400"
                : ticket.status === "Assigned"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-green-500/20 text-green-400"
            }`}>
              {ticket.status}
            </span>
            <span className="text-[10px] text-slate-500">{timeSince(ticket.timestamp)}</span>
          </div>

          {/* Team */}
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="text-sm font-semibold text-white">{ticket.teamName}</span>
          </div>
          
          {/* Problem */}
          <p className="text-xs text-slate-400 line-clamp-1 mb-2">
            {ticket.problemDescription}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1 mb-2">
            {ticket.aiDetectedTechStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[10px]"
              >
                <Code2 className="w-2.5 h-2.5" />
                {tech}
              </span>
            ))}
            {ticket.aiDetectedTechStack.length > 3 && (
              <span className="text-[10px] text-slate-500">
                +{ticket.aiDetectedTechStack.length - 3}
              </span>
            )}
          </div>

          {/* Footer: Mentor & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-[8px] font-bold">
                {ticket.aiAssignedMentor.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className="text-xs text-slate-300">{ticket.aiAssignedMentor}</span>
            </div>

            {ticket.status !== "Resolved" && (
              <button
                onClick={onOverride}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-medium hover:bg-orange-500/20 transition-all"
              >
                <UserCog className="w-3 h-3" />
                Override
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export function MentorSupportCenter({
  alerts,
  onDismissAlert,
  onSendMentor,
  onOverrideAssignment,
}: MentorSupportCenterProps) {
  const [activeTab, setActiveTab] = useState<TabType>("alerts");
  const [tickets, setTickets] = useState<MentorTicket[]>(MOCK_MENTOR_TICKETS);
  const [filteredTickets, setFilteredTickets] = useState<MentorTicket[]>(tickets);
  const [overrideTicket, setOverrideTicket] = useState<MentorTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasAlerts = alerts.totalActiveAlerts > 0;
  const activeTickets = tickets.filter((t) => t.status !== "Resolved").length;
  const routingCount = tickets.filter((t) => t.status === "Routing").length;

  // Filter tickets
  useEffect(() => {
    let filtered = [...tickets];

    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.problemDescription.toLowerCase().includes(q) ||
          t.aiAssignedMentor.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredTickets(filtered);
  }, [tickets, statusFilter, searchQuery]);

  // Handle override
  const handleOverride = (ticketId: string, newMentor: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId ? { ...t, aiAssignedMentor: newMentor } : t
      )
    );
    onOverrideAssignment?.(ticketId, newMentor);
  };

  // Simulate refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <GlassCard 
      glow={hasAlerts || routingCount > 0 ? "amber" : "none"} 
      padding="none" 
      className="h-full flex flex-col"
    >
      {/* Header with Tabs */}
      <div className="border-b border-white/10 flex-shrink-0">
        {/* Title Row */}
        <div className="p-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={hasAlerts || routingCount > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className={`w-5 h-5 ${hasAlerts || routingCount > 0 ? "text-amber-400" : "text-slate-400"}`} />
            </motion.div>
            <h3 className="text-lg font-semibold text-white">Mentor Support Center</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-4 flex gap-1">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
              activeTab === "alerts"
                ? "bg-slate-800/80 text-white border-t border-x border-white/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
            {hasAlerts && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                alerts.totalActiveAlerts > 5 ? "bg-red-500 text-white" : "bg-amber-500 text-black"
              }`}>
                {alerts.totalActiveAlerts}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("routing")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
              activeTab === "routing"
                ? "bg-slate-800/80 text-white border-t border-x border-white/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>AI Routing</span>
            {routingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500 text-black animate-pulse">
                {routingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "alerts" ? (
          // ==================== ALERTS TAB ====================
          <>
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

            {/* Alerts Footer */}
            {hasAlerts && (
              <div className="p-4 border-t border-white/10 flex-shrink-0">
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
          </>
        ) : (
          // ==================== AI ROUTING TAB ====================
          <>
            {/* Filters */}
            <div className="p-3 border-b border-white/10 flex-shrink-0">
              <div className="flex gap-2">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "All")}
                  className="px-2 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="All">All</option>
                  <option value="Routing">Routing</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mt-2 text-[10px]">
                <span className="text-slate-500">
                  <span className="text-white font-medium">{activeTickets}</span> active
                </span>
                <span className="text-slate-500">
                  <span className="text-yellow-400 font-medium">{routingCount}</span> routing
                </span>
                <span className="text-slate-500">
                  <span className="text-white font-medium">{tickets.length}</span> total
                </span>
              </div>
            </div>

            {/* Tickets List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <TicketRow
                    key={ticket.ticketId}
                    ticket={ticket}
                    onOverride={() => setOverrideTicket(ticket)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <AlertCircle className="w-10 h-10 mb-3 text-slate-500" />
                  <p className="font-medium text-sm">No tickets found</p>
                  <p className="text-xs text-slate-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Override Modal */}
      {overrideTicket && (
        <OverrideModal
          ticket={overrideTicket}
          onClose={() => setOverrideTicket(null)}
          onConfirm={(mentor) => handleOverride(overrideTicket.ticketId, mentor)}
        />
      )}
    </GlassCard>
  );
}
