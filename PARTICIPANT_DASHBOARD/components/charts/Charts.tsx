"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { TrendingUp, BarChart3, Flag, AlertTriangle, Info, X, FileCode, Clock } from "lucide-react";
import type { HourWiseCommit, MemberStat, MemberFlag } from "../../types";
import { TiltCard } from "../ui/Cards";

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 shadow-2xl"
      >
        <p className="text-purple-300 font-semibold">{label}</p>
        <p className="text-white">
          <span className="text-cyan-400">{payload[0].value}</span> commits
        </p>
      </motion.div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const flagCount = data.flags?.length || 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl"
      >
        <p className="text-cyan-300 font-bold mb-2">@{label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-300">
            Commits:{" "}
            <span className="text-white font-semibold">{data.commitsCount}</span>
          </p>
          <p className="text-green-400">+{data.linesAdded} lines</p>
          <p className="text-red-400">-{data.linesDeleted} lines</p>
          <p className="text-purple-400">{data.contributionPercentage}% contribution</p>
          {flagCount > 0 && (
            <p className="text-amber-400 flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
              <Flag className="w-3 h-3" />
              {flagCount} flag{flagCount > 1 ? 's' : ''} raised - Click for details
            </p>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};

interface CommitTimelineChartProps {
  data: HourWiseCommit[];
}

export function CommitTimelineChart({ data }: CommitTimelineChartProps) {
  return (
    <TiltCard className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Hour-wise Commit Timeline</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomLineTooltip />} />
          <Line
            type="monotone"
            dataKey="commits"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#06b6d4" }}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </TiltCard>
  );
}

interface ContributionBarChartProps {
  data: MemberStat[];
}

const barColors = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"];

const getFlagIcon = (type: string) => {
  switch (type) {
    case "suspicious":
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case "warning":
      return <Flag className="w-4 h-4 text-amber-400" />;
    default:
      return <Info className="w-4 h-4 text-blue-400" />;
  }
};

const getFlagColor = (type: string) => {
  switch (type) {
    case "suspicious":
      return "border-red-500/30 bg-red-500/10";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10";
    default:
      return "border-blue-500/30 bg-blue-500/10";
  }
};

export function ContributionBarChart({ data }: ContributionBarChartProps) {
  const [selectedMember, setSelectedMember] = useState<MemberStat | null>(null);

  const handleBarClick = (memberData: any) => {
    if (memberData && memberData.activePayload && memberData.activePayload[0]) {
      const member = memberData.activePayload[0].payload as MemberStat;
      if (member.flags && member.flags.length > 0) {
        setSelectedMember(member);
      }
    }
  };

  // Calculate total flags for display
  const totalFlags = data.reduce((sum, member) => sum + (member.flags?.length || 0), 0);

  return (
    <>
      <TiltCard className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Commits per Team Member</h3>
          </div>
          {totalFlags > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <Flag className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">{totalFlags} Flags</span>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} onClick={handleBarClick} style={{ cursor: "pointer" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="username" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="commitsCount" radius={[8, 8, 0, 0]}>
              {data.map((member, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={member.flags && member.flags.length > 0 ? "#f59e0b" : barColors[index % barColors.length]}
                  stroke={member.flags && member.flags.length > 0 ? "#ef4444" : "transparent"}
                  strokeWidth={member.flags && member.flags.length > 0 ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Flag indicators below chart */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((member, index) => (
            member.flags && member.flags.length > 0 && (
              <button
                key={member.username}
                onClick={() => setSelectedMember(member)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg hover:border-amber-500/50 transition-all group"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: barColors[index % barColors.length] }} />
                <span className="text-gray-300 text-sm">@{member.username}</span>
                <span className="flex items-center gap-1 text-amber-400 text-xs">
                  <Flag className="w-3 h-3" />
                  {member.flags.length}
                </span>
              </button>
            )
          ))}
        </div>
      </TiltCard>

      {/* Flag Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Flag className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Flags for @{selectedMember.username}</h2>
                    <p className="text-gray-400 text-sm">{selectedMember.flags?.length || 0} flag(s) raised</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Member Stats Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-800/50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{selectedMember.commitsCount}</p>
                  <p className="text-xs text-gray-400">Commits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">+{selectedMember.linesAdded}</p>
                  <p className="text-xs text-gray-400">Lines Added</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">-{selectedMember.linesDeleted}</p>
                  <p className="text-xs text-gray-400">Lines Deleted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{selectedMember.contributionPercentage}%</p>
                  <p className="text-xs text-gray-400">Contribution</p>
                </div>
              </div>

              {/* Flags List */}
              <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-280px)]">
                {selectedMember.flags?.map((flag) => (
                  <motion.div
                    key={flag.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-xl p-4 ${getFlagColor(flag.flagType)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getFlagIcon(flag.flagType)}
                        <span className="font-semibold text-white">{flag.flagName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          flag.flagType === "suspicious" ? "bg-red-500/20 text-red-300" :
                          flag.flagType === "warning" ? "bg-amber-500/20 text-amber-300" :
                          "bg-blue-500/20 text-blue-300"
                        }`}>
                          {flag.flagType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {flag.timestamp}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{flag.reason}</p>

                    {/* File and Line Info */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded-lg">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300 font-mono">{flag.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded-lg">
                        <span className="text-gray-400">Line:</span>
                        <span className="text-amber-300 font-mono font-bold">{flag.lineNumber}</span>
                      </div>
                    </div>

                    {/* Code Snippet */}
                    <div className="bg-gray-950 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500 text-xs">Code snippet:</span>
                      </div>
                      <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                        <code>
                          <span className="text-gray-500 select-none">{flag.lineNumber} | </span>
                          {flag.codeSnippet}
                        </code>
                      </pre>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
