"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Flag,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import type { FairnessIndicator, DetectedFlag } from "../../types";
import { TiltCard, GlowingBadge, CircularProgress } from "../ui/Cards";

interface FairnessCardProps {
  fairness: FairnessIndicator;
}

export function FairnessCard({ fairness }: FairnessCardProps) {
  return (
    <TiltCard className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Fairness Score</h3>
      </div>
      <div className="flex flex-col items-center">
        <CircularProgress value={fairness.teamFairnessScore} />
        <p className="text-gray-400 mt-4">{fairness.balanceStatus}</p>
        {fairness.dominanceWarning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-400 text-sm mt-2 text-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2"
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            {fairness.dominanceWarning}
          </motion.p>
        )}
      </div>
    </TiltCard>
  );
}

interface FlagsListProps {
  flags: DetectedFlag[];
  onExplain: (flag: DetectedFlag) => void;
}

export function FlagsList({ flags, onExplain }: FlagsListProps) {
  const unresolvedCount = flags.filter((f) => !f.explained).length;

  return (
    <TiltCard className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Detected Flags</h3>
        </div>
        <GlowingBadge variant={unresolvedCount > 0 ? "danger" : "success"}>
          {unresolvedCount} unresolved
        </GlowingBadge>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {flags.map((flag, i) => (
          <motion.div
            key={flag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start justify-between p-3 rounded-xl border ${
              flag.explained
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {flag.explained ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`font-semibold ${
                    flag.explained ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {flag.flagName}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{flag.reason}</p>
              {flag.explained && flag.explanation && (
                <p className="text-green-400 text-sm mt-1 italic">
                  Explanation: {flag.explanation}
                </p>
              )}
            </div>
            {!flag.explained && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExplain(flag)}
                className="px-3 py-1 bg-purple-600/50 border border-purple-500 rounded-lg text-purple-200 text-sm hover:bg-purple-600 transition-all flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                Explain
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}
