"use client";

import { motion } from "framer-motion";
import { Users, Trophy, Scale, GraduationCap } from "lucide-react";
import type { UserRole, RoleOption } from "../../types";

// ============================================================================
// Role Options Configuration
// ============================================================================
const roleOptions: RoleOption[] = [
  {
    role: "participant",
    label: "Participant",
    description: "Join hackathon via GitHub OAuth",
    icon: "Users",
    color: "purple",
    authType: "github",
  },
  {
    role: "organizer",
    label: "Organizer",
    description: "Manage hackathon events",
    icon: "Trophy",
    color: "cyan",
    authType: "email",
  },
  {
    role: "judge",
    label: "Judge/Mentor",
    description: "Evaluate or mentor teams",
    icon: "Scale",
    color: "amber",
    authType: "email",
  },
];

// ============================================================================
// Pill-Shaped Role Toggle Component
// ============================================================================
interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Pill-shaped Toggle */}
      <div className="relative flex items-center justify-center">
        <div className="relative flex items-center bg-slate-800/60 backdrop-blur-sm rounded-full p-1 border border-white/10">
          {roleOptions.map((option) => {
            const isSelected = selectedRole === option.role;
            const IconComponent = {
              Users,
              Trophy,
              Scale,
              GraduationCap,
            }[option.icon] || Users;

            return (
              <motion.button
                key={option.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectRole(option.role)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                  transition-colors duration-300 z-10
                  ${isSelected ? "text-white" : "text-slate-400 hover:text-slate-300"}
                `}
              >
                {/* Animated background pill */}
                {isSelected && (
                  <motion.div
                    layoutId="activeTab"
                    className={`
                      absolute inset-0 rounded-full
                      ${option.color === "purple" ? "bg-gradient-to-r from-purple-600 to-purple-500" : ""}
                      ${option.color === "cyan" ? "bg-gradient-to-r from-cyan-600 to-cyan-500" : ""}
                      ${option.color === "amber" ? "bg-gradient-to-r from-amber-600 to-amber-500" : ""}
                    `}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                
                <IconComponent className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Role Description */}
      {selectedRole && (
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs text-slate-400">
            {roleOptions.find((r) => r.role === selectedRole)?.description}
          </p>
          <div className="mt-2 flex justify-center">
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                ${selectedRole === "participant" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : ""}
                ${selectedRole === "organizer" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : ""}
                ${selectedRole === "judge" || selectedRole === "mentor" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : ""}
              `}
            >
              {selectedRole === "participant" ? "🔗 GitHub OAuth" : "📧 Email & Password"}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Expanded Role Cards (Alternative View)
// ============================================================================
interface RoleCardsProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

export function RoleCards({ selectedRole, onSelectRole }: RoleCardsProps) {
  const colorMap = {
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500",
      text: "text-purple-400",
      glow: "shadow-purple-500/30",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500",
      text: "text-cyan-400",
      glow: "shadow-cyan-500/30",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500",
      text: "text-amber-400",
      glow: "shadow-amber-500/30",
    },
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {roleOptions.map((option, index) => {
        const isSelected = selectedRole === option.role;
        const IconComponent = {
          Users,
          Trophy,
          Scale,
          GraduationCap,
        }[option.icon] || Users;
        const colorClasses = colorMap[option.color as keyof typeof colorMap] || colorMap.purple;

        return (
          <motion.button
            key={option.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectRole(option.role)}
            className={`
              relative p-4 rounded-xl text-center transition-all duration-300
              ${isSelected 
                ? `${colorClasses.bg} border-2 ${colorClasses.border} shadow-lg ${colorClasses.glow}` 
                : "bg-slate-800/30 border-2 border-transparent hover:border-slate-700"
              }
            `}
          >
            {/* Glow effect */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute -inset-px rounded-xl bg-gradient-to-r ${
                  option.color === "purple" ? "from-purple-500/20 to-pink-500/20" :
                  option.color === "cyan" ? "from-cyan-500/20 to-blue-500/20" :
                  "from-amber-500/20 to-orange-500/20"
                } blur-sm -z-10`}
              />
            )}

            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-xl ${isSelected ? colorClasses.bg : "bg-slate-800/50"}`}>
                <IconComponent className={`w-6 h-6 ${isSelected ? colorClasses.text : "text-slate-400"}`} />
              </div>
              <span className={`text-sm font-semibold ${isSelected ? colorClasses.text : "text-white"}`}>
                {option.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
