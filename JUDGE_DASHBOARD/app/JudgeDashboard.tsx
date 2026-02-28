"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Filter,
  Star,
  ExternalLink,
  GitBranch,
  MapPin,
  Clock,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Award,
  Gavel,
  MessageCircle,
  Send,
  Gift,
  Plus,
  LayoutGrid,
  ListOrdered,
} from "lucide-react";
import type { Remark } from "../types";

import { useJudge, useToasts, useEvaluation } from "../hooks";
import {
  AnimatedBackground,
  GlassCard,
  TeamCard,
  ScoreBadge,
  StatItem,
  LoadingSpinner,
  Badge,
  ContributionBar,
} from "../components/ui/Cards";
import { ToastContainer, NotesModal } from "../components/ui/Modals";
import {
  CodeEvolutionChart,
  ContributionPieChart,
  IntegrityBarChart,
  MilestoneTimeline,
} from "../components/charts/Charts";
import { MentorInteractionLog } from "../components/MentorInteractionLog";
import { GuidanceQueue } from "../components/GuidanceQueue";
import type { SortOption } from "../types";

// ============================================================================
// Main Judge Dashboard Component
// ============================================================================
export default function JudgeDashboard() {
  const {
    filteredTeams,
    selectedTeam,
    sortBy,
    filterShortlisted,
    isLoading,
    error,
    selectTeam,
    setSortBy,
    toggleFilterShortlisted,
    toggleShortlist,
    updateNotes,
  } = useJudge();

  const { toasts, addToast, dismissToast } = useToasts();
  const {
    isNotesModalOpen,
    currentNotes,
    editingTeamId,
    setCurrentNotes,
    openNotesModal,
    closeNotesModal,
  } = useEvaluation();

  // View state: "evaluation" or "guidance"
  const [activeView, setActiveView] = useState<"evaluation" | "guidance">("evaluation");

  const handleSaveNotes = async () => {
    if (editingTeamId) {
      await updateNotes(editingTeamId, currentNotes);
      addToast("success", "Notes saved successfully");
      closeNotesModal();
    }
  };

  const handleToggleShortlist = async (teamId: string) => {
    await toggleShortlist(teamId);
    const team = filteredTeams.find((t) => t.summary.id === teamId);
    if (team) {
      addToast(
        "info",
        team.shortlisted
          ? `${team.summary.teamName} removed from shortlist`
          : `${team.summary.teamName} added to shortlist`
      );
    }
  };

  // Remarks State
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [newRemarkContent, setNewRemarkContent] = useState("");
  const [newRemarkCategory, setNewRemarkCategory] = useState<Remark["category"]>("improvement");
  const [awardingRemarkId, setAwardingRemarkId] = useState<string | null>(null);
  const [pointsToAward, setPointsToAward] = useState<number>(5);

  const handleAddRemark = async () => {
    if (!selectedTeam || !newRemarkContent.trim()) return;
    
    // In a real app, this would call the service
    addToast("success", "Remark added successfully");
    setNewRemarkContent("");
    setShowRemarkForm(false);
  };

  const handleMarkAddressed = async (remarkId: string) => {
    if (!selectedTeam) return;
    
    // In a real app, this would call the service
    addToast("success", `Improvement addressed! ${pointsToAward} points awarded`);
    setAwardingRemarkId(null);
    setPointsToAward(5);
  };

  const getCategoryBadgeColor = (category: Remark["category"]) => {
    switch (category) {
      case "improvement": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "praise": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "concern": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "suggestion": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getCategoryIcon = (category: Remark["category"]) => {
    switch (category) {
      case "improvement": return <TrendingUp className="w-3.5 h-3.5" />;
      case "praise": return <Award className="w-3.5 h-3.5" />;
      case "concern": return <AlertTriangle className="w-3.5 h-3.5" />;
      case "suggestion": return <MessageCircle className="w-3.5 h-3.5" />;
      default: return <MessageCircle className="w-3.5 h-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white">{error}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />

      <div className="flex h-screen">
        {/* ================================================================ */}
        {/* LEFT SIDEBAR - Team List */}
        {/* ================================================================ */}
        <aside className="w-80 flex-shrink-0 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl p-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Scale className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Judge Panel</h1>
              <p className="text-xs text-slate-400">{filteredTeams.length} teams</p>
            </div>
          </div>

          {/* Sort & Filter Controls */}
          <div className="mb-4 space-y-3">
            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="fairness">Sort by Fairness</option>
                <option value="innovation">Sort by Score</option>
                <option value="violations">Sort by Violations</option>
              </select>
            </div>

            {/* Shortlist filter */}
            <button
              onClick={toggleFilterShortlisted}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filterShortlisted
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-700/50"
              }`}
            >
              <Star className="w-4 h-4" />
              {filterShortlisted ? "Showing Shortlisted" : "Show All Teams"}
            </button>
          </div>

          {/* Team Cards */}
          <div className="space-y-3">
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.summary.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TeamCard
                  team={team}
                  isSelected={selectedTeam?.summary.id === team.summary.id}
                  onSelect={selectTeam}
                  onToggleShortlist={handleToggleShortlist}
                />
              </motion.div>
            ))}
          </div>
        </aside>

        {/* ================================================================ */}
        {/* MAIN CONTENT - Team Evaluation View */}
        {/* ================================================================ */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* View Toggle Tabs */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="flex items-center gap-2 p-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl">
              <button
                onClick={() => setActiveView("evaluation")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === "evaluation"
                    ? "bg-purple-500/20 text-purple-400 shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Team Evaluation
              </button>
              <button
                onClick={() => setActiveView("guidance")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === "guidance"
                    ? "bg-cyan-500/20 text-cyan-400 shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                Guidance Queue
              </button>
            </div>
          </div>

          {/* Guidance Queue View */}
          {activeView === "guidance" && (
            <div className="max-w-4xl mx-auto">
              <GuidanceQueue />
            </div>
          )}

          {/* Team Evaluation View */}
          {activeView === "evaluation" && selectedTeam ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Team Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedTeam.summary.id}
              >
                <GlassCard className="p-6" glow="purple">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">
                          {selectedTeam.summary.teamName}
                        </h2>
                        {selectedTeam.shortlisted && (
                          <Badge variant="warning" glow>
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Shortlisted
                          </Badge>
                        )}
                      </div>
                      <a
                        href={selectedTeam.summary.repoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        <GitBranch className="w-4 h-4" />
                        View Repository
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedTeam.summary.techStack.map((tech) => (
                          <Badge key={tech} variant="info">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ScoreBadge
                      score={selectedTeam.summary.finalScore}
                      label="Score"
                      size="lg"
                    />
                  </div>
                </GlassCard>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <StatItem
                    label="Work During Hackathon"
                    value={`${selectedTeam.compliance.workDuringHackathonPct}%`}
                    icon={<Clock className="w-5 h-5" />}
                    variant={
                      selectedTeam.compliance.workDuringHackathonPct >= 90
                        ? "success"
                        : selectedTeam.compliance.workDuringHackathonPct >= 70
                        ? "warning"
                        : "danger"
                    }
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <StatItem
                    label="Location Status"
                    value={selectedTeam.compliance.locationStatusBadge}
                    icon={<MapPin className="w-5 h-5" />}
                    variant={
                      selectedTeam.compliance.locationStatusBadge === "On-site"
                        ? "success"
                        : "warning"
                    }
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <StatItem
                    label="Fairness Score"
                    value={`${selectedTeam.contributionFairness.fairnessScore}%`}
                    icon={<Users className="w-5 h-5" />}
                    variant={
                      selectedTeam.contributionFairness.fairnessScore >= 80
                        ? "success"
                        : selectedTeam.contributionFairness.fairnessScore >= 60
                        ? "warning"
                        : "danger"
                    }
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <StatItem
                    label="Commit Timing"
                    value={selectedTeam.compliance.commitTimingStatus}
                    icon={<TrendingUp className="w-5 h-5" />}
                    variant={
                      selectedTeam.compliance.commitTimingStatus === "Normal" ||
                      selectedTeam.compliance.commitTimingStatus === "Early"
                        ? "success"
                        : "warning"
                    }
                  />
                </motion.div>
              </div>

              {/* ============================================================ */}
              {/* Evaluation Scores Section - Judge & Mentor Scores */}
              {/* ============================================================ */}
              {selectedTeam.teamScores && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                >
                  <GlassCard className="p-6" glow="purple">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
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
                    
                    <div className="grid grid-cols-2 gap-6">
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
                                className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                              >
                                <div>
                                  <p className="text-white font-medium">{score.name}</p>
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
                                className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
                              >
                                <div>
                                  <p className="text-white font-medium">{score.name}</p>
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
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedTeam.teamScores.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Code Evolution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-purple-400" />
                        Code Evolution Timeline
                      </h3>
                      <CodeEvolutionChart data={selectedTeam.codeEvolution} />
                      {selectedTeam.codeEvolution.milestones.length > 0 && (
                        <div className="mt-6">
                          <p className="text-sm text-slate-400 mb-2">Milestones</p>
                          <MilestoneTimeline
                            milestones={selectedTeam.codeEvolution.milestones}
                          />
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>

                  {/* Contribution Fairness */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="w-5 h-5 text-cyan-400" />
                          Contribution Fairness
                        </h3>
                        <ScoreBadge
                          score={selectedTeam.contributionFairness.fairnessScore}
                          label="Balance"
                          size="sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <ContributionPieChart
                          data={selectedTeam.contributionFairness.memberContributions}
                        />
                        <div className="space-y-3">
                          {selectedTeam.contributionFairness.memberContributions.map(
                            (member, index) => (
                              <ContributionBar
                                key={member.name}
                                name={member.name}
                                percentage={member.percentage}
                                commits={member.commits}
                                linesAdded={member.linesAdded}
                                color={
                                  [
                                    "bg-purple-500",
                                    "bg-cyan-500",
                                    "bg-green-500",
                                    "bg-amber-500",
                                    "bg-red-500",
                                  ][index % 5]
                                }
                              />
                            )
                          )}
                        </div>
                      </div>

                      {selectedTeam.contributionFairness.dominanceIndicator && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                          <p className="text-sm text-amber-300">
                            {selectedTeam.contributionFairness.dominanceIndicator}
                          </p>
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>

                  {/* Team Remarks & Feedback (Left Column) */}
                  {selectedTeam.teamRemarks && selectedTeam.teamRemarks.remarks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38 }}
                    >
                      <GlassCard className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Team Remarks</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-400 font-medium">
                              +{selectedTeam.teamRemarks.totalPointsAwarded} pts
                            </span>
                            <button
                              onClick={() => setShowRemarkForm(!showRemarkForm)}
                              className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4 text-purple-400" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-3 mb-4">
                          <div className="flex-1 p-2 bg-slate-800/40 rounded-lg text-center">
                            <p className="text-lg font-bold text-amber-400">{selectedTeam.teamRemarks.pendingImprovements}</p>
                            <p className="text-[10px] text-slate-500 uppercase">Pending</p>
                          </div>
                          <div className="flex-1 p-2 bg-slate-800/40 rounded-lg text-center">
                            <p className="text-lg font-bold text-green-400">{selectedTeam.teamRemarks.addressedImprovements}</p>
                            <p className="text-[10px] text-slate-500 uppercase">Addressed</p>
                          </div>
                        </div>

                        {/* Remarks List - Compact */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedTeam.teamRemarks.remarks.slice(0, 5).map((remark) => (
                            <div
                              key={remark.id}
                              className={`p-3 rounded-lg border ${
                                remark.isAddressed
                                  ? "bg-green-500/5 border-green-500/20"
                                  : "bg-slate-800/30 border-slate-700/30"
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-1">
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${getCategoryBadgeColor(remark.category)}`}>
                                  {getCategoryIcon(remark.category)}
                                  {remark.category}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  remark.authorRole === "judge" ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"
                                }`}>
                                  {remark.authorRole}
                                </span>
                                {remark.isAddressed && remark.pointsAwarded && (
                                  <span className="ml-auto text-[10px] text-green-400">+{remark.pointsAwarded}</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-2">{remark.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-slate-500">{remark.authorName}</span>
                                {remark.category === "improvement" && !remark.isAddressed && (
                                  <button
                                    onClick={() => setAwardingRemarkId(remark.id)}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded text-[10px] transition-colors"
                                  >
                                    <Gift className="w-3 h-3" />
                                    Award
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedTeam.teamRemarks.remarks.length > 5 && (
                          <p className="text-center text-xs text-slate-500 mt-3">
                            +{selectedTeam.teamRemarks.remarks.length - 5} more remarks below
                          </p>
                        )}
                      </GlassCard>
                    </motion.div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Integrity & Code Quality */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        Integrity & Code Quality
                      </h3>

                      <IntegrityBarChart
                        preBuiltScore={
                          selectedTeam.integrityCodeQuality.preBuiltLikelihoodScore
                        }
                        externalHelpProb={
                          selectedTeam.integrityCodeQuality.externalHelpProbability
                        }
                        commitQuality={
                          selectedTeam.integrityCodeQuality.commitQualityScore
                        }
                      />

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-800/30 rounded-xl">
                          <p className="text-xs text-slate-400 mb-1">Behavior</p>
                          <Badge
                            variant={
                              selectedTeam.integrityCodeQuality.behavior ===
                              "Refactoring"
                                ? "success"
                                : "warning"
                            }
                          >
                            {selectedTeam.integrityCodeQuality.behavior}
                          </Badge>
                        </div>
                        <div className="p-3 bg-slate-800/30 rounded-xl">
                          <p className="text-xs text-slate-400 mb-1">Test Cases</p>
                          <Badge
                            variant={
                              selectedTeam.integrityCodeQuality.testCasesAdded
                                ? "success"
                                : "danger"
                            }
                          >
                            {selectedTeam.integrityCodeQuality.testCasesAdded
                              ? "Added"
                              : "Missing"}
                          </Badge>
                        </div>
                      </div>

                      {/* Indicator Explanations */}
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-slate-400">Analysis Notes:</p>
                        {selectedTeam.integrityCodeQuality.indicatorExplanations.map(
                          (note, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm text-slate-300"
                            >
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              {note}
                            </div>
                          )
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Mentor Interaction Log */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 }}
                  >
                    <MentorInteractionLog teamName={selectedTeam.summary.teamName} />
                  </motion.div>

                  {/* Compliance Warnings */}
                  {selectedTeam.compliance.geoFenceWarnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <GlassCard className="p-6" glow="amber">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          Compliance Warnings
                        </h3>
                        <div className="space-y-2">
                          {selectedTeam.compliance.geoFenceWarnings.map(
                            (warning, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                              >
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-200">{warning}</p>
                              </div>
                            )
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {/* Auto-Generated Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-400" />
                          AI Summary
                        </h3>
                        <button
                          onClick={() =>
                            openNotesModal(
                              selectedTeam.summary.id,
                              selectedTeam.autoGeneratedSummary.judgeNotes
                            )
                          }
                          className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors"
                        >
                          Add Notes
                        </button>
                      </div>

                      {/* Strengths */}
                      {selectedTeam.autoGeneratedSummary.keyStrengths.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-green-400 mb-2">Strengths</p>
                          <div className="space-y-1">
                            {selectedTeam.autoGeneratedSummary.keyStrengths.map(
                              (strength, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-slate-300"
                                >
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  {strength}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Concerns */}
                      {selectedTeam.autoGeneratedSummary.keyConcerns.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-amber-400 mb-2">Concerns</p>
                          <div className="space-y-1">
                            {selectedTeam.autoGeneratedSummary.keyConcerns.map(
                              (concern, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-slate-300"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  {concern}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Judge Notes */}
                      {selectedTeam.autoGeneratedSummary.judgeNotes && (
                        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                          <p className="text-xs text-purple-400 mb-1">Your Notes</p>
                          <p className="text-sm text-slate-300">
                            {selectedTeam.autoGeneratedSummary.judgeNotes}
                          </p>
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : activeView === "evaluation" ? (
            <div className="flex items-center justify-center h-full">
              <GlassCard className="p-8 text-center">
                <Scale className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Select a team to begin evaluation</p>
              </GlassCard>
            </div>
          ) : null}
        </main>
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        teamName={selectedTeam?.summary.teamName || ""}
        notes={currentNotes}
        onNotesChange={setCurrentNotes}
        onSave={handleSaveNotes}
        onClose={closeNotesModal}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
