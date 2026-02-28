"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GitBranch,
  Plus,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { InputField, Checkbox, GlowingBadge } from "../ui/Cards";
import type { TeamMember, RegistrationState } from "../../types";

// ============================================================================
// Team Member Input Component
// ============================================================================
interface TeamMemberInputProps {
  member: TeamMember;
  index: number;
  onUpdate: (id: string, username: string) => void;
  onRemove: (id: string) => void;
}

function TeamMemberInput({
  member,
  index,
  onUpdate,
  onRemove,
}: TeamMemberInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3"
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={member.githubUsername}
          onChange={(e) => onUpdate(member.id, e.target.value)}
          placeholder={`Member ${index + 1} GitHub username`}
          className={`
            w-full px-4 py-3 pl-10 rounded-xl
            bg-slate-800/50 border
            ${
              member.isValid
                ? "border-green-500/50"
                : member.githubUsername && !member.isValidating
                ? "border-red-500/50"
                : "border-white/10"
            }
            text-white placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
            transition-all duration-200
          `}
        />
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {member.isValidating && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          )}
          {member.isValid && !member.isValidating && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-green-400" />
            </motion.div>
          )}
          {!member.isValid &&
            !member.isValidating &&
            member.githubUsername.length > 0 && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
        </div>
      </div>

      <button
        onClick={() => onRemove(member.id)}
        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// Team Registration Form Component
// ============================================================================
interface TeamRegistrationFormProps {
  data: RegistrationState["data"];
  errors: RegistrationState["errors"];
  isSubmitting: boolean;
  isValidatingRepo: boolean;
  onUpdateField: <K extends keyof RegistrationState["data"]>(
    field: K,
    value: RegistrationState["data"][K]
  ) => void;
  onAddMember: () => void;
  onUpdateMember: (id: string, username: string) => void;
  onRemoveMember: (id: string) => void;
  onSubmit: () => void;
}

export function TeamRegistrationForm({
  data,
  errors,
  isSubmitting,
  isValidatingRepo,
  onUpdateField,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onSubmit,
}: TeamRegistrationFormProps) {
  const validMembersCount = data.teamMembers.filter((m) => m.isValid).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center"
        >
          <Users className="w-8 h-8 text-purple-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Team Registration</h2>
        <p className="text-slate-400 text-sm">
          Register your team to start competing
        </p>
      </div>

      {/* Team Name */}
      <InputField
        label="Team Name"
        value={data.teamName}
        onChange={(value) => onUpdateField("teamName", value)}
        placeholder="e.g., CodeCrafters"
        error={errors.teamName}
        icon={<Users className="w-5 h-5" />}
        disabled={isSubmitting}
      />

      {/* GitHub Repository Link */}
      <div className="space-y-2">
        <InputField
          label="GitHub Repository Link"
          value={data.githubRepoLink}
          onChange={(value) => onUpdateField("githubRepoLink", value)}
          placeholder="https://github.com/username/repo"
          type="url"
          error={errors.githubRepoLink}
          icon={<GitBranch className="w-5 h-5" />}
          disabled={isSubmitting}
        />
        <p className="text-xs text-slate-500 ml-1">
          We'll configure webhooks to track your team's progress transparently
        </p>
      </div>

      {/* Team Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-300">
            Team Members
          </label>
          {data.teamMembers.length > 0 && (
            <GlowingBadge variant={validMembersCount > 0 ? "green" : "amber"}>
              {validMembersCount} / {data.teamMembers.length} verified
            </GlowingBadge>
          )}
        </div>

        <AnimatePresence>
          {data.teamMembers.map((member, index) => (
            <TeamMemberInput
              key={member.id}
              member={member}
              index={index}
              onUpdate={onUpdateMember}
              onRemove={onRemoveMember}
            />
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAddMember}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </motion.button>

        {errors.teamMembers && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {errors.teamMembers}
          </motion.p>
        )}
      </div>

      {/* Consent Checkbox */}
      <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
        <Checkbox
          checked={data.consentAccepted}
          onChange={(checked) => onUpdateField("consentAccepted", checked)}
          label={
            <span>
              I accept the{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                transparency & consent policy
              </a>
              . I understand that my team's coding activity, commits, and
              repository actions will be monitored during the hackathon for
              fairness purposes.
            </span>
          }
          error={errors.consent}
        />
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
          bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-lg
          shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
          transition-all duration-300
          ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isValidatingRepo
              ? "Validating repository access..."
              : "Registering team..."}
          </>
        ) : (
          "Register Team"
        )}
      </motion.button>
    </motion.div>
  );
}
