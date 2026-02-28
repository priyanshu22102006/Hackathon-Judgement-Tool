"use client";

import React from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

// Simplified TiltCard without continuous mouse tracking
export function TiltCard({ children, className = "" }: TiltCardProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

interface GlowingBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export function GlowingBadge({ children, variant = "default" }: GlowingBadgeProps) {
  const variants = {
    default: "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20",
    success: "bg-green-500/20 text-green-300 border-green-500/50 shadow-green-500/20",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-500/20",
    danger: "bg-red-500/20 text-red-300 border-red-500/50 shadow-red-500/20",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border shadow-lg ${variants[variant]}`}
      style={{ boxShadow: `0 0 15px var(--tw-shadow-color)` }}
    >
      {children}
    </motion.span>
  );
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ value, size = 120, strokeWidth = 8 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "#22c55e", glow: "0 0 20px #22c55e" };
    if (score >= 60) return { stroke: "#eab308", glow: "0 0 20px #eab308" };
    return { stroke: "#ef4444", glow: "0 0 20px #ef4444" };
  };

  const colors = getColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: colors.glow }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold text-white"
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "purple" | "green" | "red" | "yellow" | "cyan";
  delay?: number;
}

export function StatCard({ label, value, icon, color, delay = 0 }: StatCardProps) {
  const colorClasses = {
    purple: "text-purple-400",
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    cyan: "text-cyan-400",
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} opacity-50`}>{icon}</div>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-purple-500/30 border-t-purple-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Static Gradient Background - animations removed to reduce toggling */}
      <div className="fixed inset-0 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-950 to-cyan-900/30" />
        <div
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl"
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-3xl"
        />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl"
        />
      </div>
      {children}
    </div>
  );
}
