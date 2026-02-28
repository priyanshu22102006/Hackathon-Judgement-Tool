"use client";

import { motion } from "framer-motion";
import {
  Star,
  AlertTriangle,
  CheckCircle,
  Users,
  GitCommit,
  Loader2,
  Award,
  Gavel,
} from "lucide-react";
import type { Team } from "../../types";

// ============================================================================
// Animated Background
// ============================================================================
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ============================================================================
// Glass Card - Base component with glassmorphism
// ============================================================================
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "green" | "amber" | "red" | "none";
  onClick?: () => void;
  isSelected?: boolean;
}

export function GlassCard({
  children,
  className = "",
  glow = "none",
  onClick,
  isSelected = false,
}: GlassCardProps) {
  const glowColors = {
    purple: "shadow-purple-500/20 hover:shadow-purple-500/30",
    cyan: "shadow-cyan-500/20 hover:shadow-cyan-500/30",
    green: "shadow-green-500/20 hover:shadow-green-500/30",
    amber: "shadow-amber-500/20 hover:shadow-amber-500/30",
    red: "shadow-red-500/20 hover:shadow-red-500/30",
    none: "",
  };

  const selectedBorder = isSelected
    ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-950"
    : "";

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={`
        bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10
        shadow-2xl ${glowColors[glow]} ${selectedBorder}
        transition-all duration-300 ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Team Card - For sidebar team list
// ============================================================================
interface TeamCardProps {
  team: Team;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleShortlist: (id: string) => void;
}

export function TeamCard({
  team,
  isSelected,
  onSelect,
  onToggleShortlist,
}: TeamCardProps) {
  const { summary, contributionFairness, compliance, shortlisted, teamScores } = team;

  const hasWarnings = compliance.geoFenceWarnings.length > 0;
  const fairnessColor =
    contributionFairness.fairnessScore >= 80
      ? "text-green-400"
      : contributionFairness.fairnessScore >= 60
      ? "text-amber-400"
      : "text-red-400";

  // Get judge and mentor scores
  const judgeScores = teamScores?.scores.filter(s => s.role === "judge") || [];
  const mentorScores = teamScores?.scores.filter(s => s.role === "mentor") || [];

  return (
    <GlassCard
      isSelected={isSelected}
      onClick={() => onSelect(summary.id)}
      glow={shortlisted ? "purple" : "none"}
      className="p-4 relative"
    >
      {/* Shortlist star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleShortlist(summary.id);
        }}
        className="absolute top-3 right-3 p-1 hover:scale-110 transition-transform"
      >
        <Star
          className={`w-5 h-5 ${
            shortlisted
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-500 hover:text-yellow-400"
          }`}
        />
      </button>

      {/* Team info */}
      <div className="pr-8">
        <h3 className="font-semibold text-white mb-1">{summary.teamName}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-white">
            {summary.finalScore}
          </span>
          <span className="text-slate-400 text-sm">pts</span>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className={fairnessColor}>
              {contributionFairness.fairnessScore}%
            </span>
          </div>

          {hasWarnings ? (
            <div className="flex items-center gap-1 text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>{compliance.geoFenceWarnings.length}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>Clean</span>
            </div>
          )}
        </div>

        {/* Judge/Mentor Scores */}
        {teamScores && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Evaluation Scores
              </span>
              <span className="text-sm font-bold text-purple-400">
                {teamScores.totalScore}/{teamScores.maxPossibleScore}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {/* Judge Scores */}
              {judgeScores.slice(0, 2).map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between px-1.5 py-1 bg-purple-500/10 rounded"
                >
                  <span className="text-purple-300 truncate max-w-[60px]" title={score.name}>
                    <Gavel className="w-2.5 h-2.5 inline mr-0.5" />
                    {score.name.split(" ")[1] || score.name.split(" ")[0]}
                  </span>
                  <span className="text-white font-medium">{score.score}</span>
                </div>
              ))}
              {/* Mentor Scores */}
              {mentorScores.slice(0, 2).map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between px-1.5 py-1 bg-cyan-500/10 rounded"
                >
                  <span className="text-cyan-300 truncate max-w-[60px]" title={score.name}>
                    <Users className="w-2.5 h-2.5 inline mr-0.5" />
                    {score.name.split(" ")[0]}
                  </span>
                  <span className="text-white font-medium">{score.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {summary.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-slate-800/50 rounded-full text-xs text-slate-300"
            >
              {tech}
            </span>
          ))}
          {summary.techStack.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-800/50 rounded-full text-xs text-slate-400">
              +{summary.techStack.length - 3}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================================================
// Score Badge - Circular score indicator
// ============================================================================
interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "danger" | "warning" | "success";
}

export function ScoreBadge({
  score,
  label,
  size = "md",
  variant = "default",
}: ScoreBadgeProps) {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const getColor = () => {
    if (variant === "danger" || score < 40) return "text-red-400";
    if (variant === "warning" || score < 70) return "text-amber-400";
    if (variant === "success" || score >= 80) return "text-green-400";
    return "text-purple-400";
  };

  const strokeColor = getColor().replace("text-", "stroke-");

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-slate-800"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={strokeColor}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="text-center">
        <span className={`font-bold ${textSizes[size]} ${getColor()}`}>
          {score}
        </span>
        <p className={`text-slate-400 ${labelSizes[size]} mt-0.5`}>{label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Stat Item - Small stat display
// ============================================================================
interface StatItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatItem({
  label,
  value,
  icon,
  variant = "default",
}: StatItemProps) {
  const variantColors = {
    default: "text-white",
    success: "text-green-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
      {icon && <div className="text-slate-400">{icon}</div>}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`font-semibold ${variantColors[variant]}`}>{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Spinner
// ============================================================================
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={`${sizes[size]} text-purple-400 animate-spin`} />
    </div>
  );
}

// ============================================================================
// Badge - Status badges
// ============================================================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  glow?: boolean;
}

export function Badge({ children, variant = "default", glow = false }: BadgeProps) {
  const variants = {
    default: "bg-slate-700 text-slate-200",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };

  const glowEffect = glow
    ? {
        default: "shadow-slate-500/30",
        success: "shadow-green-500/30 shadow-lg",
        warning: "shadow-amber-500/30 shadow-lg",
        danger: "shadow-red-500/30 shadow-lg",
        info: "shadow-cyan-500/30 shadow-lg",
      }[variant]
    : "";

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${variants[variant]} ${glowEffect}
      `}
    >
      {children}
    </span>
  );
}

// ============================================================================
// Contribution Bar - Horizontal progress bar for member contributions
// ============================================================================
interface ContributionBarProps {
  name: string;
  percentage: number;
  commits: number;
  linesAdded: number;
  color?: string;
}

export function ContributionBar({
  name,
  percentage,
  commits,
  linesAdded,
  color = "bg-purple-500",
}: ContributionBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white">{name}</span>
        <span className="text-xs text-slate-400">
          {commits} commits • {linesAdded.toLocaleString()} lines
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-end mt-0.5">
        <span className="text-xs text-slate-500">{percentage}%</span>
      </div>
    </div>
  );
}
