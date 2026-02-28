"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import type { CodeEvolutionTimeline, MemberContribution } from "../../types";

// ============================================================================
// Code Evolution Timeline Chart
// ============================================================================
interface CodeEvolutionChartProps {
  data: CodeEvolutionTimeline;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white font-medium">{label}</p>
        <p className="text-purple-400">
          <span className="text-slate-400">Commits: </span>
          {payload[0].value}
        </p>
        {payload[0].payload.phase && (
          <p className="text-xs text-slate-400 mt-1 capitalize">
            Phase: {payload[0].payload.phase}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function CodeEvolutionChart({ data }: CodeEvolutionChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.timelineData}>
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#commitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ============================================================================
// Contribution Pie Chart
// ============================================================================
interface ContributionPieChartProps {
  data: MemberContribution[];
}

const COLORS = ["#a855f7", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"];

export function ContributionPieChart({ data }: ContributionPieChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col"
    >
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="percentage"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0].payload as MemberContribution;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
                      <p className="text-white font-medium">{entry.name}</p>
                      <p className="text-purple-400">{entry.percentage}%</p>
                      <p className="text-xs text-slate-400">
                        {entry.commits} commits • {entry.linesAdded.toLocaleString()} lines
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-slate-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Integrity Score Bar Chart
// ============================================================================
interface IntegrityBarChartProps {
  preBuiltScore: number;
  externalHelpProb: number;
  commitQuality: number;
}

export function IntegrityBarChart({
  preBuiltScore,
  externalHelpProb,
  commitQuality,
}: IntegrityBarChartProps) {
  const data = [
    {
      name: "Pre-built",
      value: preBuiltScore,
      color: preBuiltScore > 30 ? "#ef4444" : "#22c55e",
      invertedMeaning: true,
    },
    {
      name: "External Help",
      value: externalHelpProb,
      color: externalHelpProb > 30 ? "#ef4444" : "#22c55e",
      invertedMeaning: true,
    },
    {
      name: "Code Quality",
      value: commitQuality,
      color: commitQuality > 70 ? "#22c55e" : "#f59e0b",
      invertedMeaning: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-48"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            width={90}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const entry = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
                    <p className="text-white font-medium">{entry.name}</p>
                    <p style={{ color: entry.color }}>{entry.value}%</p>
                    {entry.invertedMeaning && (
                      <p className="text-xs text-slate-400 mt-1">
                        {entry.value > 30 ? "⚠️ Concern" : "✓ Normal range"}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ============================================================================
// Timeline with Milestones
// ============================================================================
interface MilestoneTimelineProps {
  milestones: Array<{ name: string; timestamp: string }>;
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <div className="flex items-center justify-between py-4 overflow-x-auto">
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center flex-shrink-0"
        >
          {/* Connector line */}
          {index > 0 && (
            <div className="absolute h-0.5 bg-purple-500/30 w-full -translate-y-3" />
          )}

          {/* Dot */}
          <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-purple-300 shadow-lg shadow-purple-500/50" />

          {/* Info */}
          <div className="mt-3 text-center">
            <p className="text-xs font-medium text-white">{milestone.name}</p>
            <p className="text-xs text-slate-400">{milestone.timestamp}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
