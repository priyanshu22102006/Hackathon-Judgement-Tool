"use client";

// ============================================================================
// KPI Overview Cards Component with Detail Modals
// ============================================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  GitCommit,
  GitPullRequest,
  TrendingUp,
  UserCheck,
  UserX,
  Award,
  X,
  XCircle,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Search,
  Gavel,
} from "lucide-react";
import { TiltCard, GlowingBadge, CircularProgress } from "../ui/Cards";
import { fadeInUp } from "../../hooks";
import type { HackathonOverview, TeamDetails } from "../../types";

// ============================================================================
// Types
// ============================================================================
type CardType = "teams" | "active" | "inactive" | "commits" | "pullRequests" | "fairness";

interface DetailModalProps {
  type: CardType;
  data: HackathonOverview;
  teams: TeamDetails[];
  onClose: () => void;
}

// ============================================================================
// Detail Modal Component
// ============================================================================
function DetailModal({ type, data, teams, onClose }: DetailModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "commits" | "fairness">("commits");
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);

  // Filter and sort teams based on modal type
  const getFilteredTeams = () => {
    let filtered = [...teams];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.members.some(m => m.toLowerCase().includes(q))
      );
    }

    switch (type) {
      case "active":
        filtered = filtered.filter(t => !t.lastActivity.includes("h"));
        break;
      case "inactive":
        filtered = filtered.filter(t => t.lastActivity.includes("h") || t.complianceStatus === "warning");
        break;
      case "fairness":
        filtered = filtered.sort((a, b) => b.fairnessScore - a.fairnessScore);
        break;
      default:
        break;
    }

    // Apply sorting
    if (sortBy === "commits") {
      filtered.sort((a, b) => b.commits - a.commits);
    } else if (sortBy === "fairness") {
      filtered.sort((a, b) => b.fairnessScore - a.fairnessScore);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const filteredTeams = getFilteredTeams();

  const modalConfig: Record<CardType, { title: string; icon: any; color: string; description: string }> = {
    teams: {
      title: "All Registered Teams",
      icon: Users,
      color: "purple",
      description: `${data.totalRegisteredTeams} teams registered for the hackathon`,
    },
    active: {
      title: "Active Teams",
      icon: UserCheck,
      color: "green",
      description: `${data.activeTeamsCount} teams currently active and coding`,
    },
    inactive: {
      title: "Inactive Teams",
      icon: UserX,
      color: "amber",
      description: `${data.inactiveTeamsCount} teams need attention - inactive or idle`,
    },
    commits: {
      title: "Commit Activity",
      icon: GitCommit,
      color: "cyan",
      description: `${data.totalCommits.toLocaleString()} total commits • ${data.averageCommitsPerTeam} avg per team`,
    },
    pullRequests: {
      title: "Pull Requests",
      icon: GitPullRequest,
      color: "purple",
      description: `${data.totalPullRequests} pull requests across all teams`,
    },
    fairness: {
      title: "Fairness Scores",
      icon: Award,
      color: "green",
      description: `Average fairness score: ${data.averageFairnessScore}%`,
    },
  };

  const config = modalConfig[type];
  const Icon = config.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "text-green-400 bg-green-500/20";
      case "warning": return "text-amber-400 bg-amber-500/20";
      case "violation": return "text-red-400 bg-red-500/20";
      default: return "text-slate-400 bg-slate-500/20";
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "on-site": return <MapPin className="w-3 h-3 text-cyan-400" />;
      case "remote": return <Activity className="w-3 h-3 text-purple-400" />;
      default: return <Activity className="w-3 h-3 text-amber-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className={`p-6 border-b border-white/10 bg-gradient-to-r ${
          config.color === "purple" ? "from-purple-500/20 to-transparent" :
          config.color === "cyan" ? "from-cyan-500/20 to-transparent" :
          config.color === "green" ? "from-green-500/20 to-transparent" :
          "from-amber-500/20 to-transparent"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                config.color === "purple" ? "bg-purple-500/20" :
                config.color === "cyan" ? "bg-cyan-500/20" :
                config.color === "green" ? "bg-green-500/20" :
                "bg-amber-500/20"
              }`}>
                <Icon className={`w-6 h-6 ${
                  config.color === "purple" ? "text-purple-400" :
                  config.color === "cyan" ? "text-cyan-400" :
                  config.color === "green" ? "text-green-400" :
                  "text-amber-400"
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-sm text-slate-400">{config.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams or members..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="commits">Sort by Commits</option>
              <option value="fairness">Sort by Fairness</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Showing</p>
              <p className="text-xl font-bold text-white">{filteredTeams.length} teams</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Total Members</p>
              <p className="text-xl font-bold text-white">
                {filteredTeams.reduce((acc, t) => acc + t.members.length, 0)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Total Commits</p>
              <p className="text-xl font-bold text-cyan-400">
                {filteredTeams.reduce((acc, t) => acc + t.commits, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Avg Fairness</p>
              <p className="text-xl font-bold text-green-400">
                {filteredTeams.length > 0 
                  ? Math.round(filteredTeams.reduce((acc, t) => acc + t.fairnessScore, 0) / filteredTeams.length)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Teams List */}
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTeam(team)}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Team Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {team.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {team.name}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(team.complianceStatus)}`}>
                          {team.complianceStatus}
                        </span>
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {team.members.length} members
                        </span>
                        <span className="flex items-center gap-1">
                          {getLocationIcon(team.location)}
                          {team.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {team.lastActivity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Commits</p>
                      <p className="text-lg font-bold text-cyan-400">{team.commits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Fairness</p>
                      <p className={`text-lg font-bold ${
                        team.fairnessScore >= 80 ? "text-green-400" :
                        team.fairnessScore >= 60 ? "text-amber-400" : "text-red-400"
                      }`}>{team.fairnessScore}%</p>
                    </div>
                    {/* Evaluation Score */}
                    {team.teamScores && (
                      <div className="text-right px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-xs text-purple-300 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Score
                        </p>
                        <p className="text-lg font-bold text-purple-400">
                          {team.teamScores.totalScore}
                        </p>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>

                {/* Judge/Mentor Score Breakdown */}
                {team.teamScores && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-5 gap-2">
                    {team.teamScores.scores.map((score) => (
                      <div
                        key={score.id}
                        className={`px-2 py-1.5 rounded-lg text-center ${
                          score.role === "judge" 
                            ? "bg-purple-500/10 border border-purple-500/20" 
                            : "bg-cyan-500/10 border border-cyan-500/20"
                        }`}
                      >
                        <p className={`text-[10px] truncate ${
                          score.role === "judge" ? "text-purple-300" : "text-cyan-300"
                        }`}>
                          {score.role === "judge" ? <Gavel className="w-2.5 h-2.5 inline mr-0.5" /> : <Users className="w-2.5 h-2.5 inline mr-0.5" />}
                          {score.name.split(" ").slice(-1)[0]}
                        </p>
                        <p className={`text-sm font-bold ${
                          score.role === "judge" ? "text-purple-400" : "text-cyan-400"
                        }`}>{score.score}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Members */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((member) => (
                      <span
                        key={member}
                        className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-lg"
                      >
                        @{member}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredTeams.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                <p className="font-medium">No teams found</p>
                <p className="text-sm text-slate-500">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Team Detail View */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setSelectedTeam(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-purple-500/30 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-slate-700/50 bg-gradient-to-r from-purple-500/10 via-slate-900/95 to-cyan-500/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {selectedTeam.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {selectedTeam.name}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTeam.complianceStatus)}`}>
                          {selectedTeam.complianceStatus.toUpperCase()}
                        </span>
                      </h2>
                      <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4" />
                        {selectedTeam.members.length} members
                        <span className="text-slate-600">•</span>
                        {getLocationIcon(selectedTeam.location)}
                        {selectedTeam.location}
                        <span className="text-slate-600">•</span>
                        <Clock className="w-4 h-4" />
                        Last active: {selectedTeam.lastActivity}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <GitCommit className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs text-cyan-400">Total Commits</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{selectedTeam.commits}</p>
                    <p className="text-xs text-slate-400 mt-1">{Math.round(selectedTeam.commits / selectedTeam.members.length)} per member</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <GitPullRequest className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-purple-400">Pull Requests</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{selectedTeam.pullRequests}</p>
                    <p className="text-xs text-slate-400 mt-1">{selectedTeam.pullRequests > 10 ? 'Active collaboration' : 'Standard activity'}</p>
                  </div>
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${
                    selectedTeam.fairnessScore >= 80 
                      ? 'from-green-500/10 to-green-500/5 border-green-500/20' 
                      : selectedTeam.fairnessScore >= 60 
                      ? 'from-amber-500/10 to-amber-500/5 border-amber-500/20' 
                      : 'from-red-500/10 to-red-500/5 border-red-500/20'
                  } border`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={`w-4 h-4 ${
                        selectedTeam.fairnessScore >= 80 ? 'text-green-400' : 
                        selectedTeam.fairnessScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`} />
                      <p className={`text-xs ${
                        selectedTeam.fairnessScore >= 80 ? 'text-green-400' : 
                        selectedTeam.fairnessScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>Fairness Score</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{selectedTeam.fairnessScore}%</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedTeam.fairnessScore >= 80 ? 'Excellent distribution' : 
                       selectedTeam.fairnessScore >= 60 ? 'Moderate balance' : 'Needs improvement'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-slate-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400">Activity Status</p>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {selectedTeam.lastActivity.includes("min") ? "Active" : "Idle"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{selectedTeam.lastActivity}</p>
                  </div>
                </div>

                {/* Evaluation Scores */}
                {selectedTeam.teamScores && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/20 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        Evaluation Scores
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Total:</span>
                        <span className="text-2xl font-bold text-purple-400">
                          {selectedTeam.teamScores.totalScore}
                        </span>
                        <span className="text-slate-500">
                          / {selectedTeam.teamScores.maxPossibleScore}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Judge Scores */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Gavel className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-purple-300">Judge Scores</span>
                        </div>
                        <div className="space-y-2">
                          {selectedTeam.teamScores.scores
                            .filter(s => s.role === "judge")
                            .map((score) => (
                              <div
                                key={score.id}
                                className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                              >
                                <div>
                                  <p className="text-white font-medium text-sm">{score.name}</p>
                                  <p className="text-xs text-slate-400">{score.criteria || "Technical Review"}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-purple-400">{score.score}</p>
                                  <p className="text-xs text-slate-500">/ {score.maxScore}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Mentor Scores */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-300">Mentor Scores</span>
                        </div>
                        <div className="space-y-2">
                          {selectedTeam.teamScores.scores
                            .filter(s => s.role === "mentor")
                            .map((score) => (
                              <div
                                key={score.id}
                                className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
                              >
                                <div>
                                  <p className="text-white font-medium text-sm">{score.name}</p>
                                  <p className="text-xs text-slate-400">{score.criteria || "Mentorship Review"}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-cyan-400">{score.score}</p>
                                  <p className="text-xs text-slate-500">/ {score.maxScore}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Average Score Bar */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Average Score</span>
                        <span className="text-sm font-medium text-white">
                          {selectedTeam.teamScores.averageScore}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                          style={{ width: `${selectedTeam.teamScores.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Team Members ({selectedTeam.members.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedTeam.members.map((member, index) => (
                      <motion.div
                        key={member}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                          {member.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">@{member}</p>
                          <p className="text-xs text-slate-500">Contributor</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Compliance & Location Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Compliance Status
                    </h3>
                    <div className={`p-4 rounded-xl ${
                      selectedTeam.complianceStatus === 'compliant' 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : selectedTeam.complianceStatus === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    } border`}>
                      <div className="flex items-center gap-3">
                        {selectedTeam.complianceStatus === 'compliant' && <CheckCircle className="w-6 h-6 text-green-400" />}
                        {selectedTeam.complianceStatus === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                        {selectedTeam.complianceStatus === 'violation' && <XCircle className="w-6 h-6 text-red-400" />}
                        <div>
                          <p className="text-white font-semibold capitalize">{selectedTeam.complianceStatus}</p>
                          <p className="text-xs text-slate-400">
                            {selectedTeam.complianceStatus === 'compliant' && 'All rules followed, no issues detected'}
                            {selectedTeam.complianceStatus === 'warning' && 'Minor issues detected, review recommended'}
                            {selectedTeam.complianceStatus === 'violation' && 'Major violations detected, action required'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      Location Details
                    </h3>
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-3">
                        {getLocationIcon(selectedTeam.location)}
                        <div>
                          <p className="text-white font-semibold capitalize">{selectedTeam.location}</p>
                          <p className="text-xs text-slate-400">
                            {selectedTeam.location === 'on-site' && 'Team is present at the venue'}
                            {selectedTeam.location === 'remote' && 'Team is participating remotely'}
                            {selectedTeam.location === 'mixed' && 'Team has both on-site and remote members'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline (Mock) */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      { action: "Pushed commit", detail: "feat: Add new feature", time: "2 min ago", type: "commit" },
                      { action: "Opened PR", detail: "#42 - Feature implementation", time: "15 min ago", type: "pr" },
                      { action: "Merged PR", detail: "#41 - Bug fixes", time: "45 min ago", type: "merge" },
                      { action: "Pushed commit", detail: "fix: Resolve API issues", time: "1 hr ago", type: "commit" },
                      { action: "Team sync", detail: "All members online", time: "2 hr ago", type: "sync" },
                    ].map((activity, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'commit' ? 'bg-cyan-500/20' :
                          activity.type === 'pr' ? 'bg-purple-500/20' :
                          activity.type === 'merge' ? 'bg-green-500/20' : 'bg-amber-500/20'
                        }`}>
                          {activity.type === 'commit' && <GitCommit className="w-4 h-4 text-cyan-400" />}
                          {activity.type === 'pr' && <GitPullRequest className="w-4 h-4 text-purple-400" />}
                          {activity.type === 'merge' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {activity.type === 'sync' && <Users className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{activity.action}</p>
                          <p className="text-xs text-slate-400">{activity.detail}</p>
                        </div>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Overview Cards
// ============================================================================
interface OverviewCardsProps {
  data: HackathonOverview;
  teams?: TeamDetails[];
}

export function OverviewCards({ data, teams = [] }: OverviewCardsProps) {
  const [activeModal, setActiveModal] = useState<CardType | null>(null);

  const cards: Array<{
    type: CardType;
    label: string;
    value: string | number;
    icon: any;
    color: "purple" | "cyan" | "green" | "amber";
    subValue?: string;
    isProgress?: boolean;
    progressValue?: number;
  }> = [
    {
      type: "teams",
      label: "Total Teams",
      value: data.totalRegisteredTeams,
      icon: Users,
      color: "purple",
      subValue: `${data.activeTeamsCount} active`,
    },
    {
      type: "active",
      label: "Active Now",
      value: data.activeTeamsCount,
      icon: UserCheck,
      color: "green",
      subValue: `${Math.round((data.activeTeamsCount / data.totalRegisteredTeams) * 100)}% of total`,
    },
    {
      type: "inactive",
      label: "Inactive Teams",
      value: data.inactiveTeamsCount,
      icon: UserX,
      color: "amber",
      subValue: "Need attention",
    },
    {
      type: "commits",
      label: "Total Commits",
      value: data.totalCommits.toLocaleString(),
      icon: GitCommit,
      color: "cyan",
      subValue: `${data.averageCommitsPerTeam} avg/team`,
    },
    {
      type: "pullRequests",
      label: "Pull Requests",
      value: data.totalPullRequests,
      icon: GitPullRequest,
      color: "purple",
      subValue: "Merged & open",
    },
    {
      type: "fairness",
      label: "Avg Fairness",
      value: `${data.averageFairnessScore}%`,
      icon: Award,
      color: "green",
      isProgress: true,
      progressValue: data.averageFairnessScore,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <motion.div 
            key={card.label} 
            variants={fadeInUp}
            onClick={() => setActiveModal(card.type)}
            className="cursor-pointer"
          >
            <TiltCard glow={card.color} className="p-4 h-full group hover:ring-2 hover:ring-purple-500/50 transition-all">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      card.color === "purple"
                        ? "bg-purple-500/20"
                        : card.color === "cyan"
                        ? "bg-cyan-500/20"
                        : card.color === "green"
                        ? "bg-green-500/20"
                        : "bg-amber-500/20"
                    }`}
                  >
                    <card.icon
                      className={`w-4 h-4 ${
                        card.color === "purple"
                          ? "text-purple-400"
                          : card.color === "cyan"
                          ? "text-cyan-400"
                          : card.color === "green"
                          ? "text-green-400"
                          : "text-amber-400"
                      }`}
                    />
                  </div>
                  {card.isProgress && (
                    <CircularProgress
                      value={card.progressValue || 0}
                      size={40}
                      strokeWidth={4}
                      color={card.color as "green"}
                      showLabel={false}
                    />
                  )}
                </div>

                <h3 className="text-xs text-slate-400 uppercase tracking-wider">
                  {card.label}
                </h3>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                {card.subValue && !card.isProgress && (
                  <p className="text-xs text-slate-500 mt-1">{card.subValue}</p>
                )}
                
                {/* Click indicator */}
                <div className="mt-auto pt-2 flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-purple-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>View details</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModal && (
          <DetailModal
            type={activeModal}
            data={data}
            teams={teams}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Live Activity Summary
// ============================================================================
interface LiveActivitySummaryProps {
  teamsCurrentlyCoding: string[];
  teamsIdleForLongTime: string[];
  peakActivityTime: string;
}

export function LiveActivitySummary({
  teamsCurrentlyCoding,
  teamsIdleForLongTime,
  peakActivityTime,
}: LiveActivitySummaryProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        className="space-y-4 cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        {/* Click indicator */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-green-400 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Details
          </span>
        </div>

        {/* Currently Coding */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 hover:bg-green-500/15 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-green-400">Currently Coding</h4>
            <GlowingBadge color="green" size="sm">
              {teamsCurrentlyCoding.length}
            </GlowingBadge>
          </div>
          <div className="flex flex-wrap gap-2">
            {teamsCurrentlyCoding.slice(0, 6).map((team) => (
              <motion.span
                key={team}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-lg"
              >
                {team}
              </motion.span>
            ))}
            {teamsCurrentlyCoding.length > 6 && (
              <span className="px-2 py-1 text-xs text-slate-400">
                +{teamsCurrentlyCoding.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Peak Activity */}
        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Peak Activity</span>
          </div>
          <GlowingBadge color="cyan" size="sm">
            {peakActivityTime}
          </GlowingBadge>
        </div>

        {/* Idle Teams */}
        {teamsIdleForLongTime.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 hover:bg-amber-500/15 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <UserX className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-amber-400">Long Idle</h4>
              <GlowingBadge color="amber" size="sm" pulse>
                {teamsIdleForLongTime.length}
              </GlowingBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamsIdleForLongTime.map((team) => (
                <span
                  key={team}
                  className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded-lg"
                >
                  {team}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Live Activity Details</h2>
                    <p className="text-sm text-slate-400">Real-time team activity breakdown</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-green-400">Currently Active</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{teamsCurrentlyCoding.length}</p>
                    <p className="text-xs text-slate-400 mt-1">teams coding right now</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs text-cyan-400">Peak Activity</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{peakActivityTime}</p>
                    <p className="text-xs text-slate-400 mt-1">highest activity period</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX className="w-4 h-4 text-amber-400" />
                      <p className="text-xs text-amber-400">Long Idle</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{teamsIdleForLongTime.length}</p>
                    <p className="text-xs text-slate-400 mt-1">teams need attention</p>
                  </div>
                </div>

                {/* Currently Coding Teams */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Teams Currently Coding</h3>
                    <GlowingBadge color="green" size="sm" pulse>
                      {teamsCurrentlyCoding.length}
                    </GlowingBadge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {teamsCurrentlyCoding.map((team, index) => (
                      <motion.div
                        key={team}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-white font-medium">{team}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Idle Teams */}
                {teamsIdleForLongTime.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <UserX className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-semibold text-white">Long Idle Teams</h3>
                      <GlowingBadge color="amber" size="sm" pulse>
                        {teamsIdleForLongTime.length}
                      </GlowingBadge>
                    </div>
                    <div className="space-y-3">
                      {teamsIdleForLongTime.map((team, index) => (
                        <motion.div
                          key={team}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-white font-medium">{team}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-amber-400">
                            <Clock className="w-3 h-3" />
                            <span>No activity detected</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                      Consider sending a mentor to check on these teams or reaching out directly.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
