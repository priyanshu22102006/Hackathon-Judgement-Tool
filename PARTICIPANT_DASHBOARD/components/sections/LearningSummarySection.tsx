"use client";

import React from "react";
import {
  BookOpen,
  Zap,
  Target,
  Lightbulb,
  Users,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import type { LearningSummary } from "../../types";

interface LearningSummarySectionProps {
  summary: LearningSummary;
}

export function LearningSummarySection({ summary }: LearningSummarySectionProps) {
  return (
    <footer>
      <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Learning Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-green-300">Strengths</h4>
            </div>
            <ul className="space-y-2">
              {summary.strengths.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-gray-300 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-yellow-300">Areas to Improve</h4>
            </div>
            <ul className="space-y-2">
              {summary.improvements.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-gray-300 text-sm"
                >
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Collaboration Feedback */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-purple-300">Collaboration</h4>
            </div>
            <ul className="space-y-2">
              {summary.collaborationFeedback.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-gray-300 text-sm"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
