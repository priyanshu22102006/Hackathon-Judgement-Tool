"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Award,
  AlertTriangle,
  Gift,
  Clock,
} from "lucide-react";
import type { TeamRemarks, Remark } from "../../types";

interface RemarksSectionProps {
  teamRemarks: TeamRemarks;
}

const getCategoryBadgeColor = (category: Remark["category"]) => {
  switch (category) {
    case "improvement":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "praise":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "concern":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "suggestion":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const getCategoryIcon = (category: Remark["category"]) => {
  switch (category) {
    case "improvement":
      return <TrendingUp className="w-3.5 h-3.5" />;
    case "praise":
      return <Award className="w-3.5 h-3.5" />;
    case "concern":
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case "suggestion":
      return <MessageCircle className="w-3.5 h-3.5" />;
    default:
      return <MessageCircle className="w-3.5 h-3.5" />;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export function RemarksSection({ teamRemarks }: RemarksSectionProps) {
  const { remarks, totalPointsAwarded, pendingImprovements, addressedImprovements } = teamRemarks;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Feedback from Judges & Mentors
            </h3>
            <p className="text-sm text-gray-400">
              Review and address the feedback to earn bonus points
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-xl">
          <Gift className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-semibold">+{totalPointsAwarded} pts</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-slate-800/30 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-400">{remarks.length}</p>
          <p className="text-xs text-gray-400">Total Remarks</p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-400">{pendingImprovements}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-400">{addressedImprovements}</p>
          <p className="text-xs text-gray-400">Addressed</p>
        </div>
      </div>

      {/* Remarks List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {remarks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No feedback yet</p>
          </div>
        ) : (
          remarks.map((remark, index) => (
            <motion.div
              key={remark.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all ${
                remark.isAddressed
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-slate-800/30 border-slate-700/30 hover:border-purple-500/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  {/* Category & Role Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getCategoryBadgeColor(
                        remark.category
                      )}`}
                    >
                      {getCategoryIcon(remark.category)}
                      {remark.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        remark.authorRole === "judge"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-cyan-500/20 text-cyan-400"
                      }`}
                    >
                      {remark.authorRole}
                    </span>
                    {remark.isAddressed && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Addressed
                        {remark.pointsAwarded && (
                          <span className="ml-1 font-semibold">
                            +{remark.pointsAwarded} pts
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Remark Content */}
                  <p className="text-sm text-gray-300 mb-2">{remark.content}</p>

                  {/* Author & Time */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium">{remark.authorName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(remark.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Action Hint for Improvements */}
                {remark.category === "improvement" && !remark.isAddressed && (
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
                      <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                      Address to earn points
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
