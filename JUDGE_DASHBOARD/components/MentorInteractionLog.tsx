"use client";

import React, { useMemo } from "react";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  HelpCircle,
  User,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import type { MentorTicket } from "../types/mentorTicket";
import { getTeamTickets, getTeamTicketStats } from "../types/mentorTicket";

interface MentorInteractionLogProps {
  teamName: string;
}

// External help probability gauge
function ProbabilityGauge({
  score,
  level,
  color,
}: {
  score: number;
  level: "Low" | "Medium" | "High";
  color: string;
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-500/20",
      border: "border-green-500/40",
      fill: "bg-green-500",
      text: "text-green-400",
    },
    yellow: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/40",
      fill: "bg-yellow-500",
      text: "text-yellow-400",
    },
    red: {
      bg: "bg-red-500/20",
      border: "border-red-500/40",
      fill: "bg-red-500",
      text: "text-red-400",
    },
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`p-4 rounded-xl ${classes.bg} border ${classes.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${classes.text}`} />
          <span className="text-sm font-medium text-white">External Help Probability</span>
        </div>
        <span className={`text-lg font-bold ${classes.text}`}>{score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${classes.fill} transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {/* Level indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Based on mentor request volume</span>
        <span className={`flex items-center gap-1 font-medium ${classes.text}`}>
          {level === "Low" ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : level === "High" ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
          {level} Risk
        </span>
      </div>
    </div>
  );
}

// Single ticket entry (read-only)
function TicketEntry({ ticket, index }: { ticket: MentorTicket; index: number }) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative pl-8 pb-6 border-l-2 border-slate-700/50 last:pb-0 last:border-transparent">
      {/* Timeline dot */}
      <div className={`absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full border-2 ${
        ticket.status === "Resolved"
          ? "bg-green-500/30 border-green-500"
          : ticket.status === "Assigned"
          ? "bg-blue-500/30 border-blue-500"
          : "bg-yellow-500/30 border-yellow-500"
      }`}>
        <div className={`absolute inset-1 rounded-full ${
          ticket.status === "Resolved"
            ? "bg-green-500"
            : ticket.status === "Assigned"
            ? "bg-blue-500"
            : "bg-yellow-500"
        }`} />
      </div>

      <div className="ml-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
            #{index + 1}
          </span>
          <span className="text-xs text-slate-400">{formatDate(ticket.timestamp)}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            ticket.status === "Resolved"
              ? "bg-green-500/20 text-green-400"
              : ticket.status === "Assigned"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}>
            {ticket.status}
          </span>
        </div>

        {/* Problem Description */}
        <p className="text-sm text-slate-300 mb-2 leading-relaxed">
          {ticket.problemDescription}
        </p>

        {/* Tech Stack & Mentor */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Code2 className="w-3 h-3" />
            {ticket.aiDetectedTechStack.map((tech, i) => (
              <span key={tech}>
                <span className="text-purple-400">{tech}</span>
                {i < ticket.aiDetectedTechStack.length - 1 && ", "}
              </span>
            ))}
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-500">
            <User className="w-3 h-3" />
            <span className="text-cyan-400">{ticket.aiAssignedMentor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats summary card
function StatsSummary({
  totalTickets,
  resolvedTickets,
  techStacks,
}: {
  totalTickets: number;
  resolvedTickets: number;
  techStacks: string[];
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
        <HelpCircle className="w-5 h-5 text-purple-400 mx-auto mb-1" />
        <div className="text-xl font-bold text-white">{totalTickets}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Requests</div>
      </div>
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
        <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
        <div className="text-xl font-bold text-white">{resolvedTickets}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Resolved</div>
      </div>
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
        <Code2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
        <div className="text-xl font-bold text-white">{techStacks.length}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Tech Areas</div>
      </div>
    </div>
  );
}

export function MentorInteractionLog({ teamName }: MentorInteractionLogProps) {
  const stats = useMemo(() => getTeamTicketStats(teamName), [teamName]);
  const tickets = useMemo(() => getTeamTickets(teamName), [teamName]);

  // Sort tickets by timestamp (newest first)
  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [tickets]
  );

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Mentor Interaction Log</h3>
            <p className="text-sm text-slate-400">
              {teamName} • {tickets.length} request{tickets.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-slate-500 text-xs">
            <Shield className="w-3 h-3" />
            Read-only
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* External Help Probability */}
        <ProbabilityGauge {...stats.externalHelpProbability} />

        {/* Stats Summary */}
        <StatsSummary
          totalTickets={stats.totalTickets}
          resolvedTickets={stats.resolvedTickets}
          techStacks={stats.techStacksMentioned}
        />

        {/* Tech Stacks Mentioned */}
        {stats.techStacksMentioned.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
              <BarChart3 className="w-3.5 h-3.5" />
              Technologies that required help
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stats.techStacksMentioned.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Timeline */}
        {sortedTickets.length > 0 ? (
          <details className="group" open>
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300 hover:text-white transition-colors mb-4">
              <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              Request Timeline ({sortedTickets.length})
            </summary>
            <div className="space-y-0">
              {sortedTickets.map((ticket, index) => (
                <TicketEntry key={ticket.ticketId} ticket={ticket} index={index} />
              ))}
            </div>
          </details>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p className="text-slate-400 font-medium">No mentor requests</p>
            <p className="text-sm text-slate-500">This team worked independently</p>
          </div>
        )}

        {/* Integrity Note */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300/90">
            <span className="font-semibold">Integrity Note:</span> High volume of mentor requests may indicate 
            heavy reliance on external guidance. Consider this alongside code complexity and innovation scores 
            when evaluating team capability.
          </div>
        </div>
      </div>
    </div>
  );
}
