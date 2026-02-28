"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  UserCog,
  Code2,
  ArrowRight,
  Sparkles,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import type { MentorTicket, TicketStatus } from "../../types/mentorTicket";
import { MOCK_MENTOR_TICKETS, AVAILABLE_MENTORS } from "../../types/mentorTicket";

interface LiveMentorFeedProps {
  onOverrideAssignment?: (ticketId: string, newMentor: string) => void;
}

// Status indicator component
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

// Override modal component
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

// Single ticket row component
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
    <div className="group p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Status & Time */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <StatusDot status={ticket.status} />
          <span className="text-[10px] text-slate-500 font-mono">
            {formatTime(ticket.timestamp)}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-slate-500">{ticket.ticketId}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              ticket.status === "Routing"
                ? "bg-yellow-500/20 text-yellow-400"
                : ticket.status === "Assigned"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-green-500/20 text-green-400"
            }`}>
              {ticket.status}
            </span>
            <span className="text-xs text-slate-500">{timeSince(ticket.timestamp)}</span>
          </div>

          {/* Team & Problem */}
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-sm font-semibold text-white">{ticket.teamName}</span>
          </div>
          <p className="text-sm text-slate-300 line-clamp-2 mb-3">
            {ticket.problemDescription}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ticket.aiDetectedTechStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs"
              >
                <Code2 className="w-3 h-3" />
                {tech}
              </span>
            ))}
          </div>

          {/* Footer: Mentor & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {ticket.aiAssignedMentor.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-sm text-white">{ticket.aiAssignedMentor}</span>
              </div>
            </div>

            {ticket.status !== "Resolved" && (
              <button
                onClick={onOverride}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium hover:bg-orange-500/20 hover:border-orange-500/50 transition-all"
              >
                <UserCog className="w-3.5 h-3.5" />
                Override
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveMentorFeed({ onOverrideAssignment }: LiveMentorFeedProps) {
  const [tickets, setTickets] = useState<MentorTicket[]>(MOCK_MENTOR_TICKETS);
  const [filteredTickets, setFilteredTickets] = useState<MentorTicket[]>(tickets);
  const [overrideTicket, setOverrideTicket] = useState<MentorTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter tickets
  useEffect(() => {
    let filtered = [...tickets];

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.problemDescription.toLowerCase().includes(q) ||
          t.aiAssignedMentor.toLowerCase().includes(q)
      );
    }

    // Sort by timestamp (newest first)
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

  const activeCount = tickets.filter((t) => t.status !== "Resolved").length;
  const routingCount = tickets.filter((t) => t.status === "Routing").length;

  return (
    <div className="h-full flex flex-col bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-orange-500/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              {routingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {routingCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Mentor Feed</h3>
              <p className="text-sm text-slate-400">
                {activeCount} active · {tickets.length} total tickets
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, problems..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "All")}
              className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="All">All Status</option>
              <option value="Routing">Routing</option>
              <option value="Assigned">Assigned</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
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
            <p className="font-medium">No tickets found</p>
            <p className="text-sm text-slate-500">Try adjusting your filters</p>
          </div>
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
    </div>
  );
}
