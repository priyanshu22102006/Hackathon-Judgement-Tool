"use client";

// ============================================================================
// Reusable UI Components - Cards, Badges, Backgrounds
// ============================================================================

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";

// ============================================================================
// Animated Gradient Background
// ============================================================================
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-purple-500/20 blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[100px]"
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[80px]"
        animate={{
          x: [0, 60, -60, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

// ============================================================================
// Glassmorphism Card
// ============================================================================
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "amber" | "green" | "red" | "none";
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className = "",
  glow = "none",
  padding = "md",
}: GlassCardProps) {
  const glowColors = {
    purple: "shadow-purple-500/20",
    cyan: "shadow-cyan-500/20",
    amber: "shadow-amber-500/20",
    green: "shadow-green-500/20",
    red: "shadow-red-500/20",
    none: "",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        ${glow !== "none" ? `shadow-lg ${glowColors[glow]}` : ""}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 3D Tilt Card
// ============================================================================
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "amber" | "green" | "red";
}

export function TiltCard({ children, className = "", glow = "purple" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowColors = {
    purple: "hover:shadow-purple-500/30",
    cyan: "hover:shadow-cyan-500/30",
    amber: "hover:shadow-amber-500/30",
    green: "hover:shadow-green-500/30",
    red: "hover:shadow-red-500/30",
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        transition-shadow duration-300 ${glowColors[glow]} hover:shadow-xl
        ${className}
      `}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
}

// ============================================================================
// Glowing Badge
// ============================================================================
interface GlowingBadgeProps {
  children: ReactNode;
  color?: "purple" | "cyan" | "amber" | "green" | "red" | "slate";
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export function GlowingBadge({
  children,
  color = "purple",
  pulse = false,
  size = "md",
}: GlowingBadgeProps) {
  const colorClasses = {
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-purple-500/20",
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-cyan-500/20",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/20",
    green: "bg-green-500/20 text-green-400 border-green-500/30 shadow-green-500/20",
    red: "bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20",
    slate: "bg-slate-500/20 text-slate-400 border-slate-500/30 shadow-slate-500/20",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border shadow-lg
        ${colorClasses[color]} ${sizeClasses[size]}
      `}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { duration: 2, repeat: Infinity } : {}}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              color === "red" ? "bg-red-400" : color === "green" ? "bg-green-400" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              color === "red" ? "bg-red-500" : color === "green" ? "bg-green-500" : "bg-amber-500"
            }`}
          />
        </span>
      )}
      {children}
    </motion.span>
  );
}

// ============================================================================
// Circular Progress Ring
// ============================================================================
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: "purple" | "cyan" | "amber" | "green" | "red";
  showLabel?: boolean;
  label?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "cyan",
  showLabel = true,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    purple: "text-purple-500",
    cyan: "text-cyan-500",
    amber: "text-amber-500",
    green: "text-green-500",
    red: "text-red-500",
  };

  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color === "purple" ? "#a855f7" : color === "cyan" ? "#06b6d4" : color === "amber" ? "#f59e0b" : color === "green" ? "#22c55e" : "#ef4444"} />
            <stop offset="100%" stopColor={color === "purple" ? "#7c3aed" : color === "cyan" ? "#0891b2" : color === "amber" ? "#d97706" : color === "green" ? "#16a34a" : "#dc2626"} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${colorClasses[color]}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.span>
          {label && (
            <span className="text-xs text-slate-400 mt-1">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Status Indicator
// ============================================================================
interface StatusIndicatorProps {
  status: "live" | "not-started" | "ended" | "warning" | "critical";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({ status, label, size = "md" }: StatusIndicatorProps) {
  const statusConfig = {
    live: { color: "bg-green-500", ping: true, text: "text-green-400" },
    "not-started": { color: "bg-slate-500", ping: false, text: "text-slate-400" },
    ended: { color: "bg-amber-500", ping: false, text: "text-amber-400" },
    warning: { color: "bg-amber-500", ping: true, text: "text-amber-400" },
    critical: { color: "bg-red-500", ping: true, text: "text-red-400" },
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        {config.ping && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full ${config.color} ${sizeClasses[size]}`} />
      </span>
      {label && <span className={`text-sm font-medium ${config.text}`}>{label}</span>}
    </div>
  );
}

// ============================================================================
// Slider Input
// ============================================================================
interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  color?: "purple" | "cyan" | "amber" | "green";
}

export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  color = "cyan",
}: SliderInputProps) {
  const colorClasses = {
    purple: {
      thumb: "bg-purple-400",
      track: "bg-purple-500",
      text: "text-purple-400",
    },
    cyan: {
      thumb: "bg-cyan-400",
      track: "bg-cyan-500",
      text: "text-cyan-400",
    },
    amber: {
      thumb: "bg-amber-400",
      track: "bg-amber-500",
      text: "text-amber-400",
    },
    green: {
      thumb: "bg-green-400",
      track: "bg-green-500",
      text: "text-green-400",
    },
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${colorClasses[color].text}`}>{label}</span>
        <span className="text-sm font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded-md">{value}{unit}</span>
      </div>
      <div className="relative h-3 flex items-center">
        {/* Track Background */}
        <div className="absolute inset-0 h-2 bg-slate-700 rounded-full" />
        {/* Track Fill */}
        <div 
          className={`absolute left-0 h-2 ${colorClasses[color].track} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
        {/* Slider Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer z-10"
        />
        {/* Custom Thumb */}
        <div 
          className={`absolute w-4 h-4 ${colorClasses[color].thumb} rounded-full shadow-lg border-2 border-white pointer-events-none transition-all`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Toggle Switch
// ============================================================================
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function ToggleSwitch({ label, checked, onChange, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <motion.button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-cyan-500" : "bg-slate-600"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ left: checked ? "28px" : "4px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}
