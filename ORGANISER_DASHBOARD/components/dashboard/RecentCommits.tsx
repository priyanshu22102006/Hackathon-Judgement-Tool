"use client";

// ============================================================================
// Recent Commits Feed Component
// ============================================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, User, Clock, Code, X, Search, Filter, ExternalLink } from "lucide-react";
import { GlassCard, GlowingBadge } from "../ui/Cards";
import type { RecentCommit } from "../../types";

// ============================================================================
// Commit Type Helper
// ============================================================================
const getCommitType = (message: string) => {
  if (message.startsWith("feat:")) return { type: "feature", color: "green" };
  if (message.startsWith("fix:")) return { type: "fix", color: "amber" };
  if (message.startsWith("docs:")) return { type: "docs", color: "cyan" };
  if (message.startsWith("style:")) return { type: "style", color: "purple" };
  if (message.startsWith("refactor:")) return { type: "refactor", color: "pink" };
  if (message.startsWith("test:")) return { type: "test", color: "orange" };
  return { type: "commit", color: "slate" };
};

const colorClasses: Record<string, string> = {
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  slate: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

// ============================================================================
// Commit Item
// ============================================================================
interface CommitItemProps {
  commit: RecentCommit;
  index: number;
  showLine?: boolean;
}

function CommitItem({ commit, index, showLine = true }: CommitItemProps) {
  const { type, color } = getCommitType(commit.message);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
    >
      {/* Commit Icon */}
      <div className="relative mt-0.5">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <GitCommit className="w-4 h-4 text-purple-400" />
        </div>
        {/* Connection line */}
        {showLine && index < 4 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-purple-500/50 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium text-sm truncate">
            {commit.team}
          </span>
          <span
            className={`px-1.5 py-0.5 text-xs rounded border ${colorClasses[color]}`}
          >
            {type}
          </span>
        </div>
        <p className="text-slate-300 text-xs truncate group-hover:text-white transition-colors">
          {commit.message}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {commit.author}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {commit.timestamp}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Recent Commits Feed
// ============================================================================
interface RecentCommitsFeedProps {
  commits: RecentCommit[];
}

export function RecentCommitsFeed({ commits }: RecentCommitsFeedProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  // Generate more commits for modal view
  const allCommits = useMemo(() => {
    const additionalCommits: RecentCommit[] = [
      { id: "c6", team: "Algorithm Aces", message: "feat: Add sorting optimization", timestamp: "18 min ago", author: "frank_algo" },
      { id: "c7", team: "Cloud Chasers", message: "fix: Memory leak in cache module", timestamp: "22 min ago", author: "grace_cloud" },
      { id: "c8", team: "Code Crusaders", message: "refactor: Clean up legacy handlers", timestamp: "25 min ago", author: "bob_coder" },
      { id: "c9", team: "Team Alpha", message: "docs: Update README with setup guide", timestamp: "30 min ago", author: "alice_dev" },
      { id: "c10", team: "Binary Builders", message: "style: Improve responsive layout", timestamp: "35 min ago", author: "carol_ui" },
      { id: "c11", team: "Pixel Pirates", message: "test: Add unit tests for auth", timestamp: "40 min ago", author: "dave_docs" },
      { id: "c12", team: "Data Dynamos", message: "feat: Implement real-time sync", timestamp: "45 min ago", author: "eve_db" },
      { id: "c13", team: "Neural Ninjas", message: "fix: Resolve CORS issues", timestamp: "50 min ago", author: "ninja_dev" },
      { id: "c14", team: "Stack Stormers", message: "refactor: Optimize API calls", timestamp: "55 min ago", author: "storm_dev" },
      { id: "c15", team: "Logic Lords", message: "feat: Add export functionality", timestamp: "1 hr ago", author: "lord_logic" },
    ];
    return [...commits, ...additionalCommits];
  }, [commits]);

  // Commit type statistics
  const commitStats = useMemo(() => {
    const stats = { feature: 0, fix: 0, docs: 0, style: 0, refactor: 0, test: 0, other: 0 };
    allCommits.forEach((commit) => {
      const { type } = getCommitType(commit.message);
      if (type in stats) {
        stats[type as keyof typeof stats]++;
      } else {
        stats.other++;
      }
    });
    return stats;
  }, [allCommits]);

  // Filtered commits
  const filteredCommits = useMemo(() => {
    return allCommits.filter((commit) => {
      const matchesSearch =
        !searchQuery ||
        commit.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commit.author.toLowerCase().includes(searchQuery.toLowerCase());

      const { type } = getCommitType(commit.message);
      const matchesFilter = !filterType || type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [allCommits, searchQuery, filterType]);

  return (
    <>
      <GlassCard glow="cyan" className="h-full cursor-pointer group" onClick={() => setShowModal(true)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Live Commits</h3>
          </div>
          <div className="flex items-center gap-2">
            <GlowingBadge color="cyan" size="sm" pulse>
              Real-time
            </GlowingBadge>
            <ExternalLink className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Commits List */}
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {commits.map((commit, index) => (
              <CommitItem key={commit.id} commit={commit} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* View All Link */}
        <motion.button
          className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          whileHover={{ scale: 1.02 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        >
          View All Commits →
        </motion.button>
      </GlassCard>

      {/* Full Commits Modal */}
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
              className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <GitCommit className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">All Commits</h2>
                    <p className="text-sm text-slate-400">{allCommits.length} commits from all teams</p>
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
                {/* Commit Type Stats */}
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {[
                    { type: "feature", label: "Features", color: "green", count: commitStats.feature },
                    { type: "fix", label: "Fixes", color: "amber", count: commitStats.fix },
                    { type: "docs", label: "Docs", color: "cyan", count: commitStats.docs },
                    { type: "style", label: "Style", color: "purple", count: commitStats.style },
                    { type: "refactor", label: "Refactor", color: "pink", count: commitStats.refactor },
                    { type: "test", label: "Tests", color: "orange", count: commitStats.test },
                  ].map((stat) => (
                    <button
                      key={stat.type}
                      onClick={() => setFilterType(filterType === stat.type ? null : stat.type)}
                      className={`p-3 rounded-xl border transition-all ${
                        filterType === stat.type
                          ? `${colorClasses[stat.color]} border-current`
                          : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                      }`}
                    >
                      <p className="text-2xl font-bold text-white">{stat.count}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </button>
                  ))}
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search commits, teams, authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  {filterType && (
                    <button
                      onClick={() => setFilterType(null)}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 border border-slate-700 rounded-xl transition-colors"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {/* Commits List */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">
                      {filterType ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Commits` : "Recent Commits"}
                    </h3>
                    <span className="text-xs text-slate-400">{filteredCommits.length} commits</span>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCommits.map((commit, index) => (
                      <motion.div
                        key={commit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <GitCommit className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{commit.team}</span>
                            <span className={`px-2 py-0.5 text-xs rounded border ${colorClasses[getCommitType(commit.message).color]}`}>
                              {getCommitType(commit.message).type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 truncate">{commit.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <User className="w-3 h-3" />
                            <span>{commit.author}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{commit.timestamp}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
