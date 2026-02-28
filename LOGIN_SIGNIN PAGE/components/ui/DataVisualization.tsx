"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, GitBranch, GitMerge, Code, Zap } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: "commit" | "branch" | "merge";
  pulseDelay: number;
}

interface Connection {
  from: string;
  to: string;
  color: string;
}

// ============================================================================
// Animated Commit Node
// ============================================================================

function CommitNode({ node }: { node: Node }) {
  const IconMap = {
    commit: GitCommit,
    branch: GitBranch,
    merge: GitMerge,
  };
  const Icon = IconMap[node.type];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: node.pulseDelay,
      }}
      className="absolute"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 0 ${node.color}40`,
            `0 0 20px 10px ${node.color}00`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: node.pulseDelay,
        }}
        className={`
          w-${node.radius} h-${node.radius} rounded-full
          flex items-center justify-center
          bg-slate-900/80 backdrop-blur-sm border-2
        `}
        style={{
          width: `${node.radius}px`,
          height: `${node.radius}px`,
          borderColor: node.color,
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: node.color }}
        />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Connection Line
// ============================================================================

function ConnectionLine({
  from,
  to,
  color,
  nodes,
}: {
  from: string;
  to: string;
  color: string;
  nodes: Node[];
}) {
  const fromNode = nodes.find((n) => n.id === from);
  const toNode = nodes.find((n) => n.id === to);

  if (!fromNode || !toNode) return null;

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
    >
      <defs>
        <linearGradient
          id={`gradient-${from}-${to}`}
          x1={`${fromNode.x}%`}
          y1={`${fromNode.y}%`}
          x2={`${toNode.x}%`}
          y2={`${toNode.y}%`}
        >
          <stop offset="0%" stopColor={fromNode.color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={toNode.color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <motion.line
        x1={`${fromNode.x}%`}
        y1={`${fromNode.y}%`}
        x2={`${toNode.x}%`}
        y2={`${toNode.y}%`}
        stroke={`url(#gradient-${from}-${to})`}
        strokeWidth="2"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
    </motion.svg>
  );
}

// ============================================================================
// Floating Code Particles
// ============================================================================

function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 1, 0],
        y: [y, y - 50, y - 100],
        x: [x, x + (Math.random() - 0.5) * 30, x + (Math.random() - 0.5) * 50],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
      className="absolute text-purple-400/30 text-xs font-mono"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {["</>", "{}", "[]", "=>", "++", "//"][Math.floor(Math.random() * 6)]}
    </motion.div>
  );
}

// ============================================================================
// Stats Card
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay: number;
}

function StatCard({ icon, label, value, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-bold" style={{ color }}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Data Visualization Component
// ============================================================================

export function DataVisualization() {
  const [nodes] = useState<Node[]>([
    { id: "1", x: 20, y: 20, radius: 40, color: "#a855f7", type: "commit", pulseDelay: 0 },
    { id: "2", x: 45, y: 15, radius: 35, color: "#06b6d4", type: "branch", pulseDelay: 0.2 },
    { id: "3", x: 75, y: 25, radius: 40, color: "#22c55e", type: "merge", pulseDelay: 0.4 },
    { id: "4", x: 15, y: 50, radius: 30, color: "#f59e0b", type: "commit", pulseDelay: 0.6 },
    { id: "5", x: 50, y: 45, radius: 45, color: "#ec4899", type: "branch", pulseDelay: 0.8 },
    { id: "6", x: 80, y: 55, radius: 35, color: "#8b5cf6", type: "commit", pulseDelay: 1 },
    { id: "7", x: 25, y: 80, radius: 35, color: "#06b6d4", type: "merge", pulseDelay: 1.2 },
    { id: "8", x: 55, y: 75, radius: 40, color: "#a855f7", type: "commit", pulseDelay: 1.4 },
    { id: "9", x: 85, y: 85, radius: 30, color: "#22c55e", type: "branch", pulseDelay: 1.6 },
  ]);

  const connections: Connection[] = [
    { from: "1", to: "2", color: "#a855f7" },
    { from: "2", to: "3", color: "#06b6d4" },
    { from: "1", to: "4", color: "#a855f7" },
    { from: "4", to: "5", color: "#f59e0b" },
    { from: "2", to: "5", color: "#06b6d4" },
    { from: "5", to: "6", color: "#ec4899" },
    { from: "3", to: "6", color: "#22c55e" },
    { from: "4", to: "7", color: "#f59e0b" },
    { from: "5", to: "8", color: "#ec4899" },
    { from: "6", to: "9", color: "#8b5cf6" },
    { from: "7", to: "8", color: "#06b6d4" },
    { from: "8", to: "9", color: "#a855f7" },
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 0.5,
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 30,
  }));

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Connection Lines */}
      <div className="absolute inset-0">
        {connections.map((conn, i) => (
          <ConnectionLine
            key={`${conn.from}-${conn.to}`}
            from={conn.from}
            to={conn.to}
            color={conn.color}
            nodes={nodes}
          />
        ))}
      </div>

      {/* Commit Nodes */}
      <div className="absolute inset-0">
        {nodes.map((node) => (
          <CommitNode key={node.id} node={node} />
        ))}
      </div>

      {/* Floating Particles */}
      {particles.map((particle, i) => (
        <FloatingParticle
          key={i}
          delay={particle.delay}
          x={particle.x}
          y={particle.y}
        />
      ))}

      {/* Stats Overlay */}
      <div className="absolute bottom-8 left-8 right-8 space-y-3">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-xl font-bold text-white mb-4 flex items-center gap-2"
        >
          <Zap className="w-5 h-5 text-amber-400" />
          Live Commit Tracking
        </motion.h3>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<GitCommit className="w-5 h-5 text-purple-400" />}
            label="Commits Today"
            value="1,247"
            color="#a855f7"
            delay={1.7}
          />
          <StatCard
            icon={<Code className="w-5 h-5 text-cyan-400" />}
            label="Lines Added"
            value="24.5K"
            color="#06b6d4"
            delay={1.9}
          />
          <StatCard
            icon={<GitBranch className="w-5 h-5 text-green-400" />}
            label="Active Teams"
            value="156"
            color="#22c55e"
            delay={2.1}
          />
          <StatCard
            icon={<GitMerge className="w-5 h-5 text-amber-400" />}
            label="Fairness Score"
            value="94.2%"
            color="#f59e0b"
            delay={2.3}
          />
        </div>
      </div>

      {/* Brand Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute top-8 left-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
          HackCheck
        </h1>
        <p className="text-slate-400 mt-2 max-w-xs">
          Real-time GitHub commit tracking for transparent and fair hackathon evaluations
        </p>
      </motion.div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  );
}
