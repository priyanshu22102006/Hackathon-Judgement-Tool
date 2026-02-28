"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Github,
  Users,
  Link2,
  Mail,
  Hash,
  Plus,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Shield,
  MapPin,
  Code,
  ChevronDown,
} from "lucide-react";
import {
  participantRegistrationSchema,
  techStackOptions,
  type ParticipantRegistrationData,
} from "../../lib/validations";

// ============================================================================
// Form Input Components
// ============================================================================

interface InputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, icon, error, children }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        {icon}
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// Tech Stack Selector
// ============================================================================

interface TechStackSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}

function TechStackSelector({ selected, onChange, error }: TechStackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTech = (tech: string) => {
    if (selected.includes(tech)) {
      onChange(selected.filter((t) => t !== tech));
    } else {
      onChange([...selected, tech]);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl
          bg-slate-800/50 border transition-all
          ${error ? "border-red-500/50" : "border-white/10 hover:border-purple-500/50"}
        `}
      >
        <span className="text-sm text-slate-400">
          {selected.length > 0 ? `${selected.length} technologies selected` : "Select technologies..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-slate-800/30 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {techStackOptions.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${selected.includes(tech)
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600"
                      }
                    `}
                  >
                    {selected.includes(tech) && <Check className="w-3 h-3 inline mr-1" />}
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected tags preview */}
      {selected.length > 0 && !isOpen && (
        <div className="flex flex-wrap gap-1.5">
          {selected.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
          {selected.length > 5 && (
            <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded-full">
              +{selected.length - 5} more
            </span>
          )}
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// Participant Form Component
// ============================================================================

interface ParticipantFormProps {
  githubUsername: string;
  onSubmit: (data: ParticipantRegistrationData) => void;
  isSubmitting: boolean;
}

export function ParticipantForm({
  githubUsername,
  onSubmit,
  isSubmitting,
}: ParticipantFormProps) {
  const [techStack, setTechStack] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ParticipantRegistrationData>({
    resolver: zodResolver(participantRegistrationSchema),
    defaultValues: {
      hackathonInviteCode: "",
      teamName: "",
      teamMembers: [{ githubUsername: "" }],
      githubRepoUrl: "",
      techStack: [],
      preferredEmail: "",
      commitTrackingConsent: false,
      locationTrackingConsent: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });

  const handleTechStackChange = (selected: string[]) => {
    setTechStack(selected);
    setValue("techStack", selected, { shouldValidate: true });
  };

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-5">
      {/* Current User Badge */}
      <div className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <Github className="w-5 h-5 text-purple-400" />
        <span className="text-purple-300 font-medium">@{githubUsername}</span>
        <Check className="w-4 h-4 text-green-400" />
      </div>

      {/* Hackathon Invite Code */}
      <FormField
        label="Hackathon Invite Code"
        icon={<Hash className="w-4 h-4 text-purple-400" />}
        error={errors.hackathonInviteCode?.message}
      >
        <input
          {...register("hackathonInviteCode")}
          type="text"
          placeholder="Enter your hackathon invite code"
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
            ${errors.hackathonInviteCode
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20"
            }
          `}
        />
      </FormField>

      {/* Team Name */}
      <FormField
        label="Team Name"
        icon={<Users className="w-4 h-4 text-purple-400" />}
        error={errors.teamName?.message}
      >
        <input
          {...register("teamName")}
          type="text"
          placeholder="Enter your team name"
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
            ${errors.teamName
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20"
            }
          `}
        />
      </FormField>

      {/* Team Members */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Github className="w-4 h-4 text-purple-400" />
          Team Members (GitHub Usernames)
        </label>
        
        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-2"
            >
              <input
                {...register(`teamMembers.${index}.githubUsername`)}
                type="text"
                placeholder={`teammate_${index + 1}`}
                className={`
                  flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                  placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                  ${errors.teamMembers?.[index]?.githubUsername
                    ? "border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20"
                  }
                `}
              />
              {fields.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => remove(index)}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {fields.length < 4 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => append({ githubUsername: "" })}
            className="flex items-center gap-2 w-full p-3 rounded-xl bg-slate-800/30 border border-dashed border-slate-600 text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </motion.button>
        )}

        {errors.teamMembers?.message && (
          <p className="text-xs text-red-400">{errors.teamMembers.message}</p>
        )}
      </div>

      {/* GitHub Repository URL */}
      <FormField
        label="GitHub Repository URL"
        icon={<Link2 className="w-4 h-4 text-purple-400" />}
        error={errors.githubRepoUrl?.message}
      >
        <input
          {...register("githubRepoUrl")}
          type="url"
          placeholder="https://github.com/username/repo-name"
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
            ${errors.githubRepoUrl
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20"
            }
          `}
        />
      </FormField>

      {/* Tech Stack */}
      <FormField
        label="Primary Tech Stack"
        icon={<Code className="w-4 h-4 text-purple-400" />}
        error={errors.techStack?.message}
      >
        <TechStackSelector
          selected={techStack}
          onChange={handleTechStackChange}
          error={errors.techStack?.message}
        />
      </FormField>

      {/* Preferred Email */}
      <FormField
        label="Preferred Contact Email"
        icon={<Mail className="w-4 h-4 text-purple-400" />}
        error={errors.preferredEmail?.message}
      >
        <input
          {...register("preferredEmail")}
          type="email"
          placeholder="contact@example.com"
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
            ${errors.preferredEmail
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20"
            }
          `}
        />
      </FormField>

      {/* Consent Checkboxes */}
      <div className="space-y-3 p-4 bg-slate-800/30 rounded-xl border border-white/5">
        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          Required Consents
        </h4>

        {/* Commit Tracking Consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register("commitTrackingConsent")}
            className="mt-1 w-4 h-4 rounded border-2 border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/30 focus:ring-offset-0"
          />
          <div className="flex-1">
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              I agree to the transparency and consent policy for live commit tracking
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Your commits will be tracked in real-time for fairness evaluation
            </p>
          </div>
        </label>
        {errors.commitTrackingConsent && (
          <p className="text-xs text-red-400 ml-7">{errors.commitTrackingConsent.message}</p>
        )}

        {/* Location Tracking Consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register("locationTrackingConsent")}
            className="mt-1 w-4 h-4 rounded border-2 border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/30 focus:ring-offset-0"
          />
          <div className="flex-1">
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              I consent to location access via IP tracking
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Required for geo-fence verification during the hackathon
            </p>
          </div>
        </label>
        {errors.locationTrackingConsent && (
          <p className="text-xs text-red-400 ml-7">{errors.locationTrackingConsent.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold
          bg-gradient-to-r from-purple-600 to-purple-500 text-white
          hover:from-purple-500 hover:to-purple-400 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-purple-500/25
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Registering Team...
          </>
        ) : (
          <>
            <Users className="w-5 h-5" />
            Register Team
          </>
        )}
      </motion.button>
    </form>
  );
}
