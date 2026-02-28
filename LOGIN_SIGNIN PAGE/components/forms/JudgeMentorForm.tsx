"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Key,
  Briefcase,
  Linkedin,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Scale,
  GraduationCap,
  Shield,
  Check,
  Sparkles,
} from "lucide-react";
import {
  domainExpertiseOptions,
} from "../../lib/validations";

// ============================================================================
// Form Types (local definition to avoid zod refine inference issues)
// ============================================================================

export interface JudgeMentorRegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isMentor: boolean;
  hackathonAccessToken: string;
  domainExpertise: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  availabilityStart?: string;
  availabilityEnd?: string;
  availabilityTimezone?: string;
  conflictDeclaration: boolean;
}

// Simple validation schema without refines for form
const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
  isMentor: z.boolean(),
  hackathonAccessToken: z.string().min(6, "Access token required"),
  domainExpertise: z.array(z.string()).min(1, "Select at least one expertise"),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  availabilityStart: z.string().optional(),
  availabilityEnd: z.string().optional(),
  availabilityTimezone: z.string().optional(),
  conflictDeclaration: z.boolean().refine(val => val === true, "Declaration required"),
});

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
// Role Toggle Component
// ============================================================================

interface RoleToggleProps {
  isMentor: boolean;
  onChange: (isMentor: boolean) => void;
}

function RoleToggle({ isMentor, onChange }: RoleToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-white/5">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${!isMentor
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            : "text-slate-400 hover:text-white"
          }
        `}
      >
        <Scale className="w-4 h-4" />
        <span className="font-medium">Judge</span>
      </button>

      <div className="relative">
        <motion.button
          type="button"
          onClick={() => onChange(!isMentor)}
          className={`
            relative w-14 h-7 rounded-full transition-colors
            ${isMentor ? "bg-green-500" : "bg-amber-500"}
          `}
        >
          <motion.div
            animate={{ x: isMentor ? 28 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
          />
        </motion.button>
      </div>

      <button
        type="button"
        onClick={() => onChange(true)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${isMentor
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : "text-slate-400 hover:text-white"
          }
        `}
      >
        <GraduationCap className="w-4 h-4" />
        <span className="font-medium">Mentor</span>
      </button>
    </div>
  );
}

// ============================================================================
// Domain Expertise Selector
// ============================================================================

interface DomainSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}

function DomainSelector({ selected, onChange, error }: DomainSelectorProps) {
  const toggleDomain = (domain: string) => {
    if (selected.includes(domain)) {
      onChange(selected.filter((d) => d !== domain));
    } else {
      onChange([...selected, domain]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {domainExpertiseOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleDomain(option.value)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
              flex items-center gap-2
              ${selected.includes(option.value)
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600"
              }
            `}
          >
            {selected.includes(option.value) && <Check className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>
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
// Time Zones
// ============================================================================

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Europe/Paris", label: "CET (Paris)" },
  { value: "Asia/Dubai", label: "GST (Dubai)" },
  { value: "Asia/Kolkata", label: "IST (India)" },
  { value: "Asia/Singapore", label: "SGT (Singapore)" },
  { value: "Asia/Tokyo", label: "JST (Tokyo)" },
  { value: "Australia/Sydney", label: "AEST (Sydney)" },
];

// ============================================================================
// Judge/Mentor Form Component
// ============================================================================

interface JudgeMentorFormProps {
  onSubmit: (data: JudgeMentorRegistrationData) => void;
  isSubmitting: boolean;
  isLogin?: boolean;
  onToggleMode?: () => void;
}

export function JudgeMentorForm({
  onSubmit,
  isSubmitting,
  isLogin = false,
  onToggleMode,
}: JudgeMentorFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JudgeMentorRegistrationData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isMentor: false,
      hackathonAccessToken: "",
      domainExpertise: [],
      linkedinUrl: "",
      portfolioUrl: "",
      availabilityStart: "",
      availabilityEnd: "",
      availabilityTimezone: "",
      conflictDeclaration: false,
    },
  });

  const handleMentorToggle = (value: boolean) => {
    setIsMentor(value);
    setValue("isMentor", value);
  };

  const handleDomainChange = (domains: string[]) => {
    setSelectedDomains(domains);
    setValue("domainExpertise", domains as any, { shouldValidate: true });
  };

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Scale className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-medium">Judge / Mentor Registration</span>
        </div>
      </div>

      {!isLogin && (
        <>
          {/* Role Toggle */}
          <RoleToggle isMentor={isMentor} onChange={handleMentorToggle} />

          {/* Full Name */}
          <FormField
            label="Full Name"
            icon={<User className="w-4 h-4 text-amber-400" />}
            error={errors.fullName?.message}
          >
            <input
              {...register("fullName")}
              type="text"
              placeholder="Dr. Jane Smith"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.fullName
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                }
              `}
            />
          </FormField>
        </>
      )}

      {/* Email */}
      <FormField
        label="Email"
        icon={<Mail className="w-4 h-4 text-amber-400" />}
        error={errors.email?.message}
      >
        <input
          {...register("email")}
          type="email"
          placeholder="judge@example.com"
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
            ${errors.email
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
            }
          `}
        />
      </FormField>

      {/* Password */}
      <FormField
        label="Password"
        icon={<Lock className="w-4 h-4 text-amber-400" />}
        error={errors.password?.message}
      >
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`
              w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/50 border text-white
              placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
              ${errors.password
                ? "border-red-500/50 focus:ring-red-500/30"
                : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
              }
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </FormField>

      {!isLogin && (
        <>
          {/* Confirm Password */}
          <FormField
            label="Confirm Password"
            icon={<Lock className="w-4 h-4 text-amber-400" />}
            error={errors.confirmPassword?.message}
          >
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`
                  w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/50 border text-white
                  placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                  ${errors.confirmPassword
                    ? "border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                  }
                `}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </FormField>

          {/* Hackathon Access Token */}
          <FormField
            label="Hackathon Access Token"
            icon={<Key className="w-4 h-4 text-amber-400" />}
            error={errors.hackathonAccessToken?.message}
          >
            <input
              {...register("hackathonAccessToken")}
              type="text"
              placeholder="Enter the judge/mentor access token"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all font-mono
                ${errors.hackathonAccessToken
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                }
              `}
            />
          </FormField>

          {/* Domain Expertise */}
          <FormField
            label="Domain Expertise"
            icon={<Briefcase className="w-4 h-4 text-amber-400" />}
            error={errors.domainExpertise?.message}
          >
            <DomainSelector
              selected={selectedDomains}
              onChange={handleDomainChange}
              error={errors.domainExpertise?.message}
            />
          </FormField>

          {/* LinkedIn URL */}
          <FormField
            label="LinkedIn Profile URL"
            icon={<Linkedin className="w-4 h-4 text-amber-400" />}
            error={errors.linkedinUrl?.message}
          >
            <input
              {...register("linkedinUrl")}
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.linkedinUrl
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                }
              `}
            />
          </FormField>

          {/* Portfolio URL */}
          <FormField
            label="Portfolio / Website URL (Optional)"
            icon={<Globe className="w-4 h-4 text-amber-400" />}
            error={errors.portfolioUrl?.message}
          >
            <input
              {...register("portfolioUrl")}
              type="url"
              placeholder="https://yourportfolio.com"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.portfolioUrl
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                }
              `}
            />
          </FormField>

          {/* Mentor Availability (only for mentors) */}
          <AnimatePresence>
            {isMentor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20 space-y-4">
                  <h4 className="text-sm font-medium text-green-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Availability/Shift Hours
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="Start Time"
                      error={errors.availabilityStart?.message}
                    >
                      <input
                        {...register("availabilityStart")}
                        type="time"
                        className={`
                          w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                          focus:outline-none focus:ring-2 transition-all
                          ${errors.availabilityStart
                            ? "border-red-500/50 focus:ring-red-500/30"
                            : "border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                          }
                        `}
                      />
                    </FormField>

                    <FormField
                      label="End Time"
                      error={errors.availabilityEnd?.message}
                    >
                      <input
                        {...register("availabilityEnd")}
                        type="time"
                        className={`
                          w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                          focus:outline-none focus:ring-2 transition-all
                          ${errors.availabilityEnd
                            ? "border-red-500/50 focus:ring-red-500/30"
                            : "border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                          }
                        `}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Timezone"
                    error={errors.availabilityTimezone?.message}
                  >
                    <select
                      {...register("availabilityTimezone")}
                      className={`
                        w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                        appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all
                        ${errors.availabilityTimezone
                          ? "border-red-500/50 focus:ring-red-500/30"
                          : "border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                        }
                      `}
                    >
                      <option value="" className="bg-slate-800">Select timezone...</option>
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value} className="bg-slate-800">
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conflict of Interest Declaration */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register("conflictDeclaration")}
                className="mt-1 w-4 h-4 rounded border-2 border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
              />
              <div className="flex-1">
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Conflict of Interest Declaration
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  I hereby declare that I am not affiliated with any participating teams
                  and will maintain objectivity in my evaluations/mentoring.
                </p>
              </div>
            </label>
            {errors.conflictDeclaration && (
              <p className="text-xs text-red-400 ml-7 mt-2">{errors.conflictDeclaration.message}</p>
            )}
          </div>
        </>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold
          bg-gradient-to-r from-amber-600 to-amber-500 text-white
          hover:from-amber-500 hover:to-amber-400 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-amber-500/25
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isLogin ? "Signing In..." : "Creating Account..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {isLogin ? "Sign In" : `Register as ${isMentor ? "Mentor" : "Judge"}`}
          </>
        )}
      </motion.button>

      {/* Toggle Auth Mode */}
      {onToggleMode && (
        <p className="text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      )}
    </form>
  );
}
