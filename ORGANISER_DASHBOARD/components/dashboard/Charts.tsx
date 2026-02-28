"use client";

// ============================================================================
// Charts Components with Custom Styled Recharts & Detail Modals
// ============================================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { GlassCard, GlowingBadge } from "../ui/Cards";
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  Users,
  Shield,
  Eye,
} from "lucide-react";
import type {
  ActivityDataPoint,
  ComplianceHistoryPoint,
  ViolationType,
  TeamDetails,
} from "../../types";

// ============================================================================
// Custom Tooltip Component
// ============================================================================
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-slate-300 text-xs font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white text-sm font-semibold">{entry.value}</span>
          <span className="text-slate-400 text-xs">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Chart Detail Modal Component
// ============================================================================
interface ChartDetailModalProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onClose: () => void;
  children: React.ReactNode;
}

function ChartDetailModal({ title, icon, color, onClose, children }: ChartDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl"
      >
        <div className={`p-6 border-b border-white/10 bg-gradient-to-r ${color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {icon}
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Clickable Card Wrapper
// ============================================================================
function ClickableChartWrapper({ 
  children, 
  onClick, 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
  className?: string;
}) {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer group ${className}`}
    >
      <div className="relative">
        {children}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100">
          <Eye className="w-3 h-3" />
          <span>Click for details</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Activity Heatmap Chart
// ============================================================================
interface ActivityHeatmapProps {
  data: ActivityDataPoint[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  return (
    <GlassCard glow="purple" className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Real-Time Activity</h3>
        <span className="text-xs text-slate-400">Last 24 hours</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="commitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={{ stroke: "#475569" }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={{ stroke: "#475569" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="intensity"
              name="Intensity"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#activityGradient)"
            />
            <Area
              type="monotone"
              dataKey="commits"
              name="Commits"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#commitsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ============================================================================
// Compliance Pie Chart
// ============================================================================
interface ComplianceChartProps {
  compliant: number;
  warnings: number;
  violations: number;
  teams?: TeamDetails[];
}

export function ComplianceChart({ compliant, warnings, violations, teams = [] }: ComplianceChartProps) {
  const [showModal, setShowModal] = useState(false);
  
  const data = [
    { name: "Compliant", value: compliant, color: "#22c55e" },
    { name: "Warnings", value: warnings, color: "#f59e0b" },
    { name: "Violations", value: violations, color: "#ef4444" },
  ];

  const total = compliant + warnings + violations;
  
  const compliantTeams = teams.filter(t => t.complianceStatus === "compliant");
  const warningTeams = teams.filter(t => t.complianceStatus === "warning");
  const violationTeams = teams.filter(t => t.complianceStatus === "violation");

  return (
    <>
      <ClickableChartWrapper onClick={() => setShowModal(true)}>
        <GlassCard glow="green" className="h-full hover:ring-2 hover:ring-green-500/30 transition-all">
          <h3 className="text-lg font-semibold text-white mb-4">Rule Compliance</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-300">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </ClickableChartWrapper>

      <AnimatePresence>
        {showModal && (
          <ChartDetailModal
            title="Rule Compliance Details"
            icon={<div className="p-3 rounded-xl bg-green-500/20"><Shield className="w-6 h-6 text-green-400" /></div>}
            color="from-green-500/20 to-transparent"
            onClose={() => setShowModal(false)}
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Compliant</span>
                </div>
                <p className="text-3xl font-bold text-white">{compliant}</p>
                <p className="text-xs text-slate-400">{((compliant/total)*100).toFixed(1)}% of teams</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-400 font-medium">Warnings</span>
                </div>
                <p className="text-3xl font-bold text-white">{warnings}</p>
                <p className="text-xs text-slate-400">{((warnings/total)*100).toFixed(1)}% of teams</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Violations</span>
                </div>
                <p className="text-3xl font-bold text-white">{violations}</p>
                <p className="text-xs text-slate-400">{((violations/total)*100).toFixed(1)}% of teams</p>
              </div>
            </div>

            {/* Teams List by Status */}
            <div className="space-y-6">
              {/* Violations */}
              {violationTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Teams with Violations ({violationTeams.length})
                  </h4>
                  <div className="space-y-2">
                    {violationTeams.map(team => (
                      <div key={team.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">
                            {team.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.members.length} members • {team.lastActivity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-400">{team.fairnessScore}%</p>
                          <p className="text-[10px] text-slate-500">Fairness</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warningTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Teams with Warnings ({warningTeams.length})
                  </h4>
                  <div className="space-y-2">
                    {warningTeams.map(team => (
                      <div key={team.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                            {team.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.members.length} members • {team.lastActivity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-400">{team.fairnessScore}%</p>
                          <p className="text-[10px] text-slate-500">Fairness</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliant */}
              {compliantTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Compliant Teams ({compliantTeams.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {compliantTeams.slice(0, 10).map(team => (
                      <div key={team.id} className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-400 text-[10px] font-bold">
                          {team.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                        </div>
                        <span className="text-xs text-white truncate">{team.name}</span>
                      </div>
                    ))}
                    {compliantTeams.length > 10 && (
                      <div className="p-2 text-xs text-slate-400">+{compliantTeams.length - 10} more teams</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ChartDetailModal>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Location Distribution Chart
// ============================================================================
interface LocationChartProps {
  onSite: number;
  mixed: number;
  outsideGeoFence: number;
  teams?: TeamDetails[];
}

export function LocationChart({ onSite, mixed, outsideGeoFence, teams = [] }: LocationChartProps) {
  const [showModal, setShowModal] = useState(false);
  
  const data = [
    { name: "On-Site", value: onSite, color: "#06b6d4" },
    { name: "Mixed", value: mixed, color: "#a855f7" },
    { name: "Outside Geofence", value: outsideGeoFence, color: "#f59e0b" },
  ];

  const total = onSite + mixed + outsideGeoFence;
  const onSiteTeams = teams.filter(t => t.location === "on-site");
  const mixedTeams = teams.filter(t => t.location === "mixed");
  const remoteTeams = teams.filter(t => t.location === "remote");

  return (
    <>
      <ClickableChartWrapper onClick={() => setShowModal(true)}>
        <GlassCard glow="cyan" className="h-full hover:ring-2 hover:ring-cyan-500/30 transition-all">
          <h3 className="text-lg font-semibold text-white mb-4">Location Monitoring</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {data.map((item) => (
              <div key={item.name} className="text-center">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-slate-400">{item.name}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </ClickableChartWrapper>

      <AnimatePresence>
        {showModal && (
          <ChartDetailModal
            title="Location Monitoring Details"
            icon={<div className="p-3 rounded-xl bg-cyan-500/20"><MapPin className="w-6 h-6 text-cyan-400" /></div>}
            color="from-cyan-500/20 to-transparent"
            onClose={() => setShowModal(false)}
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-cyan-400 font-medium">On-Site</span>
                </div>
                <p className="text-3xl font-bold text-white">{onSite}</p>
                <p className="text-xs text-slate-400">{((onSite/total)*100).toFixed(1)}% of teams</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-400 font-medium">Mixed</span>
                </div>
                <p className="text-3xl font-bold text-white">{mixed}</p>
                <p className="text-xs text-slate-400">{((mixed/total)*100).toFixed(1)}% of teams</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-400 font-medium">Outside Geofence</span>
                </div>
                <p className="text-3xl font-bold text-white">{outsideGeoFence}</p>
                <p className="text-xs text-slate-400">{((outsideGeoFence/total)*100).toFixed(1)}% of teams</p>
              </div>
            </div>

            {/* Location Info */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6">
              <h4 className="text-sm font-semibold text-white mb-2">Geofence Information</h4>
              <p className="text-xs text-slate-400 mb-3">
                Teams are monitored based on their IP addresses and device locations. 
                On-site teams are within the designated hackathon venue.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs text-slate-300">Building A - Main Hall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs text-slate-300">Building B - Lab Area</span>
                </div>
              </div>
            </div>

            {/* Teams by Location */}
            <div className="space-y-6">
              {/* Remote/Outside teams - Priority */}
              {remoteTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Remote/Outside Geofence ({remoteTeams.length})
                  </h4>
                  <div className="space-y-2">
                    {remoteTeams.map(team => (
                      <div key={team.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                            {team.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.members.length} members • Last active: {team.lastActivity}</p>
                          </div>
                        </div>
                        <GlowingBadge color="amber" size="sm">Remote</GlowingBadge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mixed Location */}
              {mixedTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Mixed Location ({mixedTeams.length})
                  </h4>
                  <div className="space-y-2">
                    {mixedTeams.map(team => (
                      <div key={team.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                            {team.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.members.length} members</p>
                          </div>
                        </div>
                        <GlowingBadge color="purple" size="sm">Mixed</GlowingBadge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* On-Site */}
              {onSiteTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> On-Site Teams ({onSiteTeams.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {onSiteTeams.slice(0, 12).map(team => (
                      <div key={team.id} className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
                          {team.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                        </div>
                        <span className="text-xs text-white truncate">{team.name}</span>
                      </div>
                    ))}
                    {onSiteTeams.length > 12 && (
                      <div className="p-2 text-xs text-slate-400 flex items-center">+{onSiteTeams.length - 12} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ChartDetailModal>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Compliance History Line Chart
// ============================================================================
interface ComplianceHistoryChartProps {
  data: ComplianceHistoryPoint[];
  teams?: TeamDetails[];
}

export function ComplianceHistoryChart({ data, teams = [] }: ComplianceHistoryChartProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Calculate trends
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const compliantTrend = lastPoint.compliant - firstPoint.compliant;
  const warningsTrend = lastPoint.warnings - firstPoint.warnings;
  const violationsTrend = lastPoint.violations - firstPoint.violations;

  // Categorize teams by compliance status
  const compliantTeams = teams.filter(t => t.complianceStatus === "compliant");
  const warningTeams = teams.filter(t => t.complianceStatus === "warning");
  const violationTeams = teams.filter(t => t.complianceStatus === "violation");

  return (
    <>
      <ClickableChartWrapper onClick={() => setShowModal(true)}>
        <GlassCard padding="md" className="hover:ring-2 hover:ring-purple-500/30 transition-all">
          <h3 className="text-lg font-semibold text-white mb-4">Compliance Over Time</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="compliant"
                  name="Compliant"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="warnings"
                  name="Warnings"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="violations"
                  name="Violations"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </ClickableChartWrapper>

      <AnimatePresence>
        {showModal && (
          <ChartDetailModal
            title="Compliance History Analysis"
            icon={<div className="p-3 rounded-xl bg-purple-500/20"><TrendingUp className="w-6 h-6 text-purple-400" /></div>}
            color="from-purple-500/20 to-transparent"
            onClose={() => setShowModal(false)}
          >
            {/* Trend Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-400 font-medium">Compliant</span>
                  <div className={`flex items-center gap-1 text-xs ${compliantTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {compliantTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {compliantTrend >= 0 ? '+' : ''}{compliantTrend}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{lastPoint.compliant}</p>
                <p className="text-xs text-slate-400">Current teams</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-400 font-medium">Warnings</span>
                  <div className={`flex items-center gap-1 text-xs ${warningsTrend <= 0 ? 'text-green-400' : 'text-amber-400'}`}>
                    {warningsTrend <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {warningsTrend >= 0 ? '+' : ''}{warningsTrend}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{lastPoint.warnings}</p>
                <p className="text-xs text-slate-400">Current teams</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-400 font-medium">Violations</span>
                  <div className={`flex items-center gap-1 text-xs ${violationsTrend <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {violationsTrend <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {violationsTrend >= 0 ? '+' : ''}{violationsTrend}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{lastPoint.violations}</p>
                <p className="text-xs text-slate-400">Current teams</p>
              </div>
            </div>

            {/* Larger Chart */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6">
              <h4 className="text-sm font-semibold text-white mb-4">Detailed Timeline</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="compliant"
                      name="Compliant"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="warnings"
                      name="Warnings"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="violations"
                      name="Violations"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-slate-700 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/80">
                  <tr>
                    <th className="text-left p-3 text-slate-300 font-medium">Time</th>
                    <th className="text-center p-3 text-green-400 font-medium">Compliant</th>
                    <th className="text-center p-3 text-amber-400 font-medium">Warnings</th>
                    <th className="text-center p-3 text-red-400 font-medium">Violations</th>
                    <th className="text-center p-3 text-slate-300 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((point, index) => (
                    <tr 
                      key={index} 
                      className={`border-t border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedTimeSlot === point.time ? 'bg-purple-500/10' : ''}`}
                      onClick={() => setSelectedTimeSlot(selectedTimeSlot === point.time ? null : point.time)}
                    >
                      <td className="p-3 text-white font-mono text-xs">{point.time}</td>
                      <td className="p-3 text-center text-green-400">{point.compliant}</td>
                      <td className="p-3 text-center text-amber-400">{point.warnings}</td>
                      <td className="p-3 text-center text-red-400">{point.violations}</td>
                      <td className="p-3 text-center text-white font-semibold">{point.compliant + point.warnings + point.violations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Team Breakdown Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Current Team Status Breakdown
              </h4>
              
              {/* Compliant Teams */}
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Compliant Teams</span>
                  </div>
                  <GlowingBadge color="green" size="sm">{compliantTeams.length}</GlowingBadge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {compliantTeams.length > 0 ? compliantTeams.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-sm text-white truncate">{team.name}</span>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-slate-500 col-span-3">No teams data available</p>
                  )}
                </div>
              </div>

              {/* Warning Teams */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-amber-400">Teams with Warnings</span>
                  </div>
                  <GlowingBadge color="amber" size="sm">{warningTeams.length}</GlowingBadge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {warningTeams.length > 0 ? warningTeams.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-sm text-white truncate">{team.name}</span>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-slate-500 col-span-3">No warning teams</p>
                  )}
                </div>
              </div>

              {/* Violation Teams */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-red-400">Teams with Violations</span>
                  </div>
                  <GlowingBadge color="red" size="sm">{violationTeams.length}</GlowingBadge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {violationTeams.length > 0 ? violationTeams.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-sm text-white truncate">{team.name}</span>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-slate-500 col-span-3">No teams with violations</p>
                  )}
                </div>
              </div>
            </div>
          </ChartDetailModal>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Violations Bar Chart
// ============================================================================
interface ViolationsChartProps {
  data: ViolationType[];
}

export function ViolationsChart({ data }: ViolationsChartProps) {
  const [showModal, setShowModal] = useState(false);

  const severityColors = {
    low: "#06b6d4",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  const chartData = data.map((v) => ({
    ...v,
    fill: severityColors[v.severity],
  }));

  const totalViolations = data.reduce((acc, v) => acc + v.count, 0);
  const highSeverityCount = data.filter(v => v.severity === "high").reduce((acc, v) => acc + v.count, 0);
  const mediumSeverityCount = data.filter(v => v.severity === "medium").reduce((acc, v) => acc + v.count, 0);
  const lowSeverityCount = data.filter(v => v.severity === "low").reduce((acc, v) => acc + v.count, 0);

  return (
    <>
      <ClickableChartWrapper onClick={() => setShowModal(true)}>
        <GlassCard padding="md" className="hover:ring-2 hover:ring-amber-500/30 transition-all">
          <h3 className="text-lg font-semibold text-white mb-4">Violation Types</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="type"
                  stroke="#64748b"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </ClickableChartWrapper>

      <AnimatePresence>
        {showModal && (
          <ChartDetailModal
            title="Violation Types Analysis"
            icon={<div className="p-3 rounded-xl bg-amber-500/20"><AlertTriangle className="w-6 h-6 text-amber-400" /></div>}
            color="from-amber-500/20 to-transparent"
            onClose={() => setShowModal(false)}
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Total Violations</p>
                <p className="text-3xl font-bold text-white">{totalViolations}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-xs text-red-400">High Severity</p>
                </div>
                <p className="text-3xl font-bold text-white">{highSeverityCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <p className="text-xs text-amber-400">Medium Severity</p>
                </div>
                <p className="text-3xl font-bold text-white">{mediumSeverityCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <p className="text-xs text-cyan-400">Low Severity</p>
                </div>
                <p className="text-3xl font-bold text-white">{lowSeverityCount}</p>
              </div>
            </div>

            {/* Larger Chart */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6">
              <h4 className="text-sm font-semibold text-white mb-4">Violation Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      width={150}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Occurrences" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Violation List with Team/Participant Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Violation Details by Team & Participant</h4>
              {data.sort((a, b) => {
                const severityOrder = { high: 0, medium: 1, low: 2 };
                return severityOrder[a.severity] - severityOrder[b.severity];
              }).map((violation, index) => (
                <div
                  key={index}
                  className={`rounded-xl border overflow-hidden ${
                    violation.severity === "high"
                      ? "bg-red-500/10 border-red-500/20"
                      : violation.severity === "medium"
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "bg-cyan-500/10 border-cyan-500/20"
                  }`}
                >
                  {/* Violation Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          violation.severity === "high"
                            ? "text-red-400"
                            : violation.severity === "medium"
                            ? "text-amber-400"
                            : "text-cyan-400"
                        }`}
                      />
                      <span className="font-semibold text-white text-lg">{violation.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlowingBadge
                        color={violation.severity === "high" ? "red" : violation.severity === "medium" ? "amber" : "cyan"}
                        size="sm"
                      >
                        {violation.severity.toUpperCase()}
                      </GlowingBadge>
                      <span className="text-xl font-bold text-white">{violation.count} incidents</span>
                    </div>
                  </div>

                  {/* Incidents List */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-400 mb-3">
                      {violation.severity === "high" && "⚠️ Requires immediate attention. May result in disqualification."}
                      {violation.severity === "medium" && "⚡ Should be reviewed. Multiple occurrences may escalate to high severity."}
                      {violation.severity === "low" && "ℹ️ Minor issue. Informational alert for organizers."}
                    </p>
                    
                    {violation.incidents && violation.incidents.length > 0 ? (
                      <div className="space-y-2">
                        {violation.incidents.map((incident, iIndex) => (
                          <motion.div
                            key={iIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: iIndex * 0.05 }}
                            className={`p-3 rounded-lg border ${
                              violation.severity === "high"
                                ? "bg-red-500/5 border-red-500/10"
                                : violation.severity === "medium"
                                ? "bg-amber-500/5 border-amber-500/10"
                                : "bg-cyan-500/5 border-cyan-500/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    <span className="font-semibold text-white">{incident.teamName}</span>
                                  </div>
                                  <span className="text-slate-500">•</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${
                                      violation.severity === "high"
                                        ? "bg-red-400"
                                        : violation.severity === "medium"
                                        ? "bg-amber-400"
                                        : "bg-cyan-400"
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                      violation.severity === "high"
                                        ? "text-red-300"
                                        : violation.severity === "medium"
                                        ? "text-amber-300"
                                        : "text-cyan-300"
                                    }`}>
                                      {incident.participant}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-300">{incident.details}</p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                <Clock className="w-3 h-3" />
                                <span>{incident.timestamp}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No detailed incidents available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ChartDetailModal>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Scoring Weights Radial Chart
// ============================================================================
interface ScoringWeightsChartProps {
  weights: {
    commits: number;
    codeQuality: number;
    collaboration: number;
    consistency: number;
    innovation: number;
  };
}

export function ScoringWeightsChart({ weights }: ScoringWeightsChartProps) {
  const data = [
    { name: "Commits", value: weights.commits, fill: "#a855f7" },
    { name: "Code Quality", value: weights.codeQuality, fill: "#06b6d4" },
    { name: "Collaboration", value: weights.collaboration, fill: "#22c55e" },
    { name: "Consistency", value: weights.consistency, fill: "#f59e0b" },
    { name: "Innovation", value: weights.innovation, fill: "#ec4899" },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            label={{ fill: "#fff", fontSize: 10 }}
            background={{ fill: "#1e293b" }}
            dataKey="value"
          />
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
