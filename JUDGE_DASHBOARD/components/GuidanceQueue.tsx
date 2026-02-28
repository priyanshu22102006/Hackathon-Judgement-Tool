"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MapPin,
  Clock,
  ArrowUpDown,
  Navigation,
  ListOrdered,
  AlertTriangle,
  CheckCircle,
  Play,
  X,
  Code,
  Palette,
  Bug,
  Lightbulb,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  Star,
  UserCheck,
} from "lucide-react";
import { judgeService } from "../services/judgeService";
import type { GuidanceRequest, MentorInfo } from "../types";

// ============================================================================
// Helper Components
// ============================================================================

const PriorityBadge = ({ priority }: { priority: GuidanceRequest["priority"] }) => {
  const styles = {
    urgent: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: GuidanceRequest["status"] }) => {
  const styles = {
    pending: "bg-amber-500/20 text-amber-400",
    "in-progress": "bg-blue-500/20 text-blue-400",
    resolved: "bg-green-500/20 text-green-400",
    cancelled: "bg-slate-500/20 text-slate-400",
  };

  const icons = {
    pending: <Clock className="w-3 h-3" />,
    "in-progress": <Play className="w-3 h-3" />,
    resolved: <CheckCircle className="w-3 h-3" />,
    cancelled: <X className="w-3 h-3" />,
  };

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const RequestTypeIcon = ({ type }: { type: GuidanceRequest["requestType"] }) => {
  const icons = {
    technical: <Code className="w-4 h-4 text-purple-400" />,
    design: <Palette className="w-4 h-4 text-pink-400" />,
    debugging: <Bug className="w-4 h-4 text-red-400" />,
    strategy: <Lightbulb className="w-4 h-4 text-yellow-400" />,
    general: <HelpCircle className="w-4 h-4 text-cyan-400" />,
  };

  return icons[type];
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

// ============================================================================
// Request Card Component
// ============================================================================

interface RequestCardProps {
  request: GuidanceRequest;
  onStatusChange: (requestId: string, status: GuidanceRequest["status"]) => void;
}

function RequestCard({ request, onStatusChange }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-slate-800/40 backdrop-blur-sm border rounded-xl overflow-hidden transition-all ${
        request.status === "in-progress"
          ? "border-blue-500/40 shadow-lg shadow-blue-500/10"
          : request.priority === "urgent"
          ? "border-red-500/30"
          : "border-slate-700/50"
      }`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <RequestTypeIcon type={request.requestType} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white truncate">
                  {request.teamName}
                </h4>
                <PriorityBadge priority={request.priority} />
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                {request.description}
              </p>
              {/* Current Mentor Assignment */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-500">Assigned to:</span>
                <span className="text-xs text-cyan-400 font-medium">{request.mentorName}</span>
                {/* AI Suggested Different Mentor Indicator */}
                {request.suggestedMentorId && request.suggestedMentorId !== request.mentorId && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded text-[10px] text-pink-400">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI suggests: {request.suggestedMentorName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center flex-wrap gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {request.teamLocation.tableNumber}
          </span>
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" />
            {request.distanceFromMentor}m away
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTimeAgo(request.requestedAt)}
          </span>
          {request.queuePosition !== undefined && request.queuePosition > 0 && (
            <span className="flex items-center gap-1">
              <ListOrdered className="w-3.5 h-3.5" />
              #{request.queuePosition} in queue
            </span>
          )}
          {/* AI Match Score Badge */}
          {request.aiMatchScore !== undefined && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
              request.aiMatchScore >= 70 
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : request.aiMatchScore >= 40
                ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
            }`}>
              <Sparkles className="w-3 h-3" />
              {request.aiMatchScore}% match
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50"
          >
            <div className="p-4 space-y-3">
              {/* Full Description */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-300">{request.description}</p>
              </div>

              {/* Tech Stack */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {request.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded-md text-purple-300 text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location Details */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Location</p>
                  <p className="text-sm text-white">
                    {request.teamLocation.zone} - Table {request.teamLocation.tableNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Est. Wait</p>
                  <p className="text-sm text-white">{request.estimatedWaitTime} mins</p>
                </div>
              </div>

              {/* AI Match Insights */}
              {(request.aiMatchScore !== undefined || (request.aiMatchReasons && request.aiMatchReasons.length > 0)) && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">AI Match Insights</span>
                  </div>
                  
                  {/* Match Score Bar */}
                  {request.aiMatchScore !== undefined && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Match Score</span>
                        <span className={`font-medium ${
                          (request.aiMatchScore ?? 0) >= 70 ? "text-green-400" :
                          (request.aiMatchScore ?? 0) >= 40 ? "text-yellow-400" : "text-slate-400"
                        }`}>
                          {request.aiMatchScore}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            (request.aiMatchScore ?? 0) >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                            (request.aiMatchScore ?? 0) >= 40 ? "bg-gradient-to-r from-yellow-500 to-orange-400" :
                            "bg-gradient-to-r from-slate-500 to-slate-400"
                          }`}
                          style={{ width: `${request.aiMatchScore || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expertise Match */}
                  {request.expertiseMatchPct !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Expertise alignment: <span className="text-white">{request.expertiseMatchPct}%</span></span>
                    </div>
                  )}

                  {/* AI Reasons */}
                  {request.aiMatchReasons && request.aiMatchReasons.length > 0 && (
                    <div className="space-y-1">
                      {request.aiMatchReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                          <span className="text-slate-300">{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Better Mentor */}
                  {request.suggestedMentorId && request.suggestedMentorId !== request.mentorId && (
                    <div className="mt-2 pt-2 border-t border-purple-500/20">
                      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-2">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <UserCheck className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-300 font-medium">AI Mentor Recommendation</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Based on team's tech stack (<span className="text-purple-300">{request.techStack.slice(0, 3).join(", ")}</span>), 
                          AI suggests reassigning to <span className="text-cyan-400 font-semibold">{request.suggestedMentorName}</span> for optimal expertise alignment.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // In production, this would reassign the mentor
                              alert(`Reassigning ${request.teamName} to ${request.suggestedMentorName}`);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs transition-colors"
                          >
                            <UserCheck className="w-3 h-3" />
                            Accept AI Suggestion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current mentor is the best match */}
                  {request.suggestedMentorId && request.suggestedMentorId === request.mentorId && (
                    <div className="mt-2 pt-2 border-t border-purple-500/20">
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Current mentor <span className="font-medium">{request.mentorName}</span> is the optimal match for this team</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {request.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(request.id, "in-progress");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Session
                  </button>
                )}
                {request.status === "in-progress" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(request.id, "resolved");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
                {(request.status === "pending" || request.status === "in-progress") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(request.id, "cancelled");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Main Guidance Queue Component
// ============================================================================

interface GuidanceQueueProps {
  mentorId?: string; // Optional: filter by specific mentor
}

export function GuidanceQueue({ mentorId }: GuidanceQueueProps) {
  const [requests, setRequests] = useState<GuidanceRequest[]>([]);
  const [allMentors, setAllMentors] = useState<MentorInfo[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | "all">(mentorId || "all");
  const [sortBy, setSortBy] = useState<"queue" | "distance" | "priority">("queue");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress">("all");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);

  // Fetch mentors list
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentors = await judgeService.getMentors();
        setAllMentors(mentors);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await judgeService.getGuidanceRequests();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch guidance requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Get selected mentor info
  const selectedMentor = useMemo(() => {
    if (selectedMentorId === "all") return null;
    return allMentors.find((m) => m.id === selectedMentorId) || null;
  }, [selectedMentorId, allMentors]);

  // Sort and filter requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Filter by selected mentor
    if (selectedMentorId !== "all") {
      result = result.filter((r) => r.mentorId === selectedMentorId);
    }

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus);
    }

    // Sort
    return judgeService.sortGuidanceRequests(result, sortBy);
  }, [requests, sortBy, filterStatus, selectedMentorId]);

  const handleStatusChange = async (
    requestId: string,
    status: GuidanceRequest["status"]
  ) => {
    await judgeService.updateRequestStatus(requestId, status);
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  // Stats (based on selected mentor filter)
  const stats = useMemo(() => {
    let filteredByMentor = selectedMentorId === "all" 
      ? requests 
      : requests.filter((r) => r.mentorId === selectedMentorId);
    
    const pending = filteredByMentor.filter((r) => r.status === "pending").length;
    const inProgress = filteredByMentor.filter((r) => r.status === "in-progress").length;
    const urgent = filteredByMentor.filter(
      (r) => r.priority === "urgent" && r.status === "pending"
    ).length;
    const total = filteredByMentor.length;
    return { pending, inProgress, urgent, total };
  }, [requests, selectedMentorId]);

  if (loading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Mentor/Judge Selector */}
      <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Select Mentor/Judge</p>
              <div className="relative">
                <button
                  onClick={() => setShowMentorDropdown(!showMentorDropdown)}
                  className="flex items-center gap-2 bg-slate-800/70 hover:bg-slate-800 border border-slate-600/50 rounded-lg px-4 py-2 transition-colors min-w-[200px]"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">
                    {selectedMentorId === "all" ? "All Mentors" : selectedMentor?.name || "Select..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${showMentorDropdown ? "rotate-180" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {showMentorDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setSelectedMentorId("all");
                          setShowMentorDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                          selectedMentorId === "all" ? "bg-purple-500/20 border-l-2 border-purple-500" : ""
                        }`}
                      >
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-white">All Mentors</span>
                        <span className="text-xs text-slate-500 ml-auto">{requests.length} requests</span>
                      </button>
                      <div className="border-t border-slate-700/50" />
                      {allMentors.map((mentor) => {
                        const mentorRequests = requests.filter((r) => r.mentorId === mentor.id).length;
                        return (
                          <button
                            key={mentor.id}
                            onClick={() => {
                              setSelectedMentorId(mentor.id);
                              setShowMentorDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                              selectedMentorId === mentor.id ? "bg-purple-500/20 border-l-2 border-purple-500" : ""
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${mentor.isAvailable ? "bg-green-400" : "bg-slate-500"}`} />
                            <div className="flex-1 text-left">
                              <span className="text-white font-medium">{mentor.name}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {mentor.expertise.slice(0, 2).map((skill) => (
                                  <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">{mentorRequests} requests</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stats for selected mentor */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Queue for {selectedMentorId === "all" ? "all mentors" : selectedMentor?.name}</p>
              <p className="text-sm text-white">
                <span className="text-amber-400 font-semibold">{stats.pending}</span> pending • 
                <span className="text-blue-400 font-semibold"> {stats.inProgress}</span> in progress
              </p>
            </div>
            {stats.urgent > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">
                  {stats.urgent} urgent
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center justify-between gap-4">
          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort by:</span>
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setSortBy("queue")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sortBy === "queue"
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                Queue
              </button>
              <button
                onClick={() => setSortBy("distance")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sortBy === "distance"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                Nearest
              </button>
              <button
                onClick={() => setSortBy("priority")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sortBy === "priority"
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Priority
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            {(["all", "pending", "in-progress"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === status
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-slate-800/50 text-slate-400 hover:text-white"
                }`}
              >
                {status === "all" ? "All" : status === "in-progress" ? "In Progress" : "Pending"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 font-medium">No requests found</p>
            <p className="text-sm text-slate-500">
              {filterStatus !== "all"
                ? "Try changing the filter"
                : "Teams will appear here when they request guidance"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredRequests.length} of {stats.total} requests
            {selectedMentorId !== "all" && selectedMentor && (
              <span className="text-purple-400"> for {selectedMentor.name}</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sorted by {sortBy}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GuidanceQueue;
