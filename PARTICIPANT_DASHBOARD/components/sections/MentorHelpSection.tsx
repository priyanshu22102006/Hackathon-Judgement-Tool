"use client";

import React, { useState, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  Loader2,
  Code2,
  User,
  ChevronRight,
  AlertCircle,
  Zap,
} from "lucide-react";
import type { MentorTicket, TicketStatus } from "../../types/mentorTicket";
import { getTeamTickets, MOCK_MENTOR_TICKETS, AVAILABLE_MENTORS } from "../../types/mentorTicket";

interface MentorHelpSectionProps {
  teamName: string;
  onTicketSubmit?: (ticket: MentorTicket) => void;
}

// Status badge component
function StatusBadge({ status }: { status: TicketStatus }) {
  const config = {
    Routing: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/40",
      text: "text-yellow-400",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    Assigned: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/40",
      text: "text-blue-400",
      icon: <User className="w-3 h-3" />,
    },
    Resolved: {
      bg: "bg-green-500/20",
      border: "border-green-500/40",
      text: "text-green-400",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
  };

  const { bg, border, text, icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${border} ${text} border`}
    >
      {icon}
      {status}
    </span>
  );
}

// Tech stack chip component
function TechChip({ tech }: { tech: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono">
      <Code2 className="w-3 h-3" />
      {tech}
    </span>
  );
}

// Single ticket card component
function TicketCard({ ticket }: { ticket: MentorTicket }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="group p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">{ticket.ticketId}</span>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {formatTime(ticket.timestamp)}
        </div>
      </div>

      {/* Problem Description */}
      <p className="text-sm text-slate-300 mb-3 line-clamp-2">
        {ticket.problemDescription}
      </p>

      {/* AI Detected Tech Stack */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-purple-400 font-medium">AI Detected Stack</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ticket.aiDetectedTechStack.map((tech) => (
            <TechChip key={tech} tech={tech} />
          ))}
        </div>
      </div>

      {/* Assigned Mentor */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {ticket.aiAssignedMentor.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{ticket.aiAssignedMentor}</p>
            <p className="text-xs text-slate-500">AI Assigned Mentor</p>
          </div>
        </div>
        {ticket.status === "Assigned" && (
          <span className="text-xs text-cyan-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Responding soon
          </span>
        )}
      </div>
    </div>
  );
}

export function MentorHelpSection({ teamName, onTicketSubmit }: MentorHelpSectionProps) {
  const [problemDescription, setProblemDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamTickets, setTeamTickets] = useState<MentorTicket[]>(() =>
    getTeamTickets(teamName)
  );

  // Simulate AI tech stack detection
  const detectTechStack = useCallback((description: string): string[] => {
    const techKeywords: Record<string, string[]> = {
      React: ["react", "jsx", "component", "hook", "usestate", "useeffect"],
      "Next.js": ["next.js", "nextjs", "next", "ssr", "server-side", "app router"],
      TypeScript: ["typescript", "ts", "type", "interface", "generic"],
      "Node.js": ["node", "nodejs", "express", "backend", "server"],
      PostgreSQL: ["postgresql", "postgres", "sql", "database", "query"],
      MongoDB: ["mongodb", "mongoose", "nosql", "document"],
      Python: ["python", "django", "flask", "fastapi"],
      Docker: ["docker", "container", "dockerfile", "compose"],
      AWS: ["aws", "s3", "ec2", "lambda", "cloud"],
      WebSocket: ["websocket", "socket", "real-time", "realtime"],
      GraphQL: ["graphql", "apollo", "mutation", "resolver"],
      TensorFlow: ["tensorflow", "ml", "machine learning", "neural"],
    };

    const lowerDesc = description.toLowerCase();
    const detected: string[] = [];

    for (const [tech, keywords] of Object.entries(techKeywords)) {
      if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
        detected.push(tech);
      }
    }

    return detected.length > 0 ? detected : ["General Programming"];
  }, []);

  // Simulate AI mentor assignment
  const assignMentor = useCallback((techStack: string[]): string => {
    // Find mentor with best expertise match
    let bestMentor = AVAILABLE_MENTORS[0];
    let bestScore = 0;

    for (const mentor of AVAILABLE_MENTORS) {
      const matchScore = mentor.expertise.filter((exp) =>
        techStack.some((tech) => exp.toLowerCase().includes(tech.toLowerCase()) || tech.toLowerCase().includes(exp.toLowerCase()))
      ).length;

      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMentor = mentor;
      }
    }

    return bestMentor.name;
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const detectedStack = detectTechStack(problemDescription);
    const assignedMentor = assignMentor(detectedStack);

    const newTicket: MentorTicket = {
      ticketId: `TKT-${String(MOCK_MENTOR_TICKETS.length + 1).padStart(3, "0")}`,
      teamName,
      problemDescription: problemDescription.trim(),
      aiDetectedTechStack: detectedStack,
      aiAssignedMentor: assignedMentor,
      status: "Routing",
      timestamp: new Date().toISOString(),
    };

    setTeamTickets((prev) => [newTicket, ...prev]);
    setProblemDescription("");
    setIsSubmitting(false);
    onTicketSubmit?.(newTicket);

    // Simulate routing to assigned status after delay
    setTimeout(() => {
      setTeamTickets((prev) =>
        prev.map((t) =>
          t.ticketId === newTicket.ticketId ? { ...t, status: "Assigned" as TicketStatus } : t
        )
      );
    }, 3000);
  };

  const activeTickets = teamTickets.filter((t) => t.status !== "Resolved");
  const resolvedTickets = teamTickets.filter((t) => t.status === "Resolved");

  return (
    <div className="w-full">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">AI Mentor Routing</h3>
              <p className="text-purple-300 text-sm">
                Describe your problem — AI will match you with the perfect mentor
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Describe Your Problem
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Explain the technical issue you're facing in detail. Include error messages, what you've tried, and what technologies you're using..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={!problemDescription.trim() || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is analyzing your request...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Request AI Mentor Match
                  <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Live Ticket Status */}
          {teamTickets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Live Ticket Status
                </h4>
                <span className="text-xs text-slate-500">
                  {activeTickets.length} active · {resolvedTickets.length} resolved
                </span>
              </div>

              {/* Active Tickets */}
              {activeTickets.length > 0 && (
                <div className="space-y-3">
                  {activeTickets.map((ticket) => (
                    <TicketCard key={ticket.ticketId} ticket={ticket} />
                  ))}
                </div>
              )}

              {/* Resolved Tickets (Collapsible) */}
              {resolvedTickets.length > 0 && (
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300 transition-colors">
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                    View {resolvedTickets.length} resolved ticket{resolvedTickets.length > 1 ? "s" : ""}
                  </summary>
                  <div className="mt-3 space-y-3 opacity-60">
                    {resolvedTickets.map((ticket) => (
                      <TicketCard key={ticket.ticketId} ticket={ticket} />
                    ))}
                  </div>
                </details>
              )}

              {/* No Active Tickets */}
              {activeTickets.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                  <p>No active tickets</p>
                  <p className="text-sm text-slate-500">All your mentor requests have been resolved!</p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {teamTickets.length === 0 && (
            <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-500" />
              <p className="text-slate-400">No mentor requests yet</p>
              <p className="text-sm text-slate-500">Stuck on something? Submit a request above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
