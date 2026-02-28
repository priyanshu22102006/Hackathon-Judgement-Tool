"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, MouseEvent } from "react";
import { Loader2 } from "lucide-react";

// ============================================================================
// Animated Background
// ============================================================================
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/40 to-slate-950" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -80, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ============================================================================
// 3D Tilt Card
// ============================================================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "green" | "amber" | "none";
  intensity?: number;
}

export function TiltCard({
  children,
  className = "",
  glow = "purple",
  intensity = 15,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowColors = {
    purple: "shadow-purple-500/20 hover:shadow-purple-500/40",
    cyan: "shadow-cyan-500/20 hover:shadow-cyan-500/40",
    green: "shadow-green-500/20 hover:shadow-green-500/40",
    amber: "shadow-amber-500/20 hover:shadow-amber-500/40",
    none: "",
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`
        bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10
        shadow-2xl ${glowColors[glow]} transition-shadow duration-500
        ${className}
      `}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
    </motion.div>
  );
}

// ============================================================================
// Glass Card (Simple)
// ============================================================================
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function GlassCard({
  children,
  className = "",
  onClick,
  isSelected = false,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={`
        bg-white/5 backdrop-blur-xl rounded-2xl border
        ${isSelected ? "border-purple-500 ring-2 ring-purple-500/30" : "border-white/10"}
        transition-all duration-300 ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Glowing Badge
// ============================================================================
interface GlowingBadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "green" | "amber" | "red" | "cyan";
  pulse?: boolean;
}

export function GlowingBadge({
  children,
  variant = "purple",
  pulse = false,
}: GlowingBadgeProps) {
  const variants = {
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/20",
    green: "bg-green-500/20 text-green-300 border-green-500/30 shadow-green-500/20",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/20",
    red: "bg-red-500/20 text-red-300 border-red-500/30 shadow-red-500/20",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-cyan-500/20",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
        border shadow-lg ${variants[variant]}
        ${pulse ? "animate-pulse" : ""}
      `}
    >
      {children}
    </span>
  );
}

// ============================================================================
// Loading Spinner
// ============================================================================
export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

  return (
    <Loader2
      className={`${sizes[size]} text-purple-400 animate-spin ${className}`}
    />
  );
}

// ============================================================================
// GitHub Button
// ============================================================================
interface GitHubButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GitHubButton({
  onClick,
  isLoading = false,
  disabled = false,
}: GitHubButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
        bg-white text-slate-900 font-semibold text-lg
        shadow-lg shadow-white/10 hover:shadow-white/20
        transition-all duration-300
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="text-slate-900" />
      ) : (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )}
      {isLoading ? "Connecting to GitHub..." : "Login with GitHub"}
    </motion.button>
  );
}

// ============================================================================
// Input Field
// ============================================================================
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email";
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  icon,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 ${icon ? "pl-12" : ""} rounded-xl
            bg-slate-800/50 border ${error ? "border-red-500" : "border-white/10"}
            text-white placeholder:text-slate-500
            focus:outline-none focus:ring-2 ${error ? "focus:ring-red-500/50" : "focus:ring-purple-500/50"}
            transition-all duration-200
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// Checkbox
// ============================================================================
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: string;
}

export function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-all duration-200
              ${
                checked
                  ? "bg-purple-500 border-purple-500"
                  : error
                  ? "border-red-500"
                  : "border-slate-500 group-hover:border-slate-400"
              }
            `}
          >
            {checked && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-full h-full text-white p-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </div>
        </div>
        <span className="text-sm text-slate-300 leading-relaxed">{label}</span>
      </label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 ml-8"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
