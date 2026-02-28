"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  Building2,
  Phone,
  Briefcase,
  Image,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  organizerRegistrationSchema,
  organizerDesignationOptions,
  type OrganizerRegistrationData,
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
// Organizer Form Component
// ============================================================================

interface OrganizerFormProps {
  onSubmit: (data: OrganizerRegistrationData) => void;
  isSubmitting: boolean;
  isLogin?: boolean;
  onToggleMode?: () => void;
}

export function OrganizerForm({
  onSubmit,
  isSubmitting,
  isLogin = false,
  onToggleMode,
}: OrganizerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizerRegistrationData>({
    resolver: zodResolver(organizerRegistrationSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
      contactPhone: "",
      designation: undefined,
      organizationLogoUrl: "",
    },
  });

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Organizer Registration</span>
        </div>
      </div>

      {!isLogin && (
        <>
          {/* Full Name */}
          <FormField
            label="Full Name"
            icon={<User className="w-4 h-4 text-cyan-400" />}
            error={errors.fullName?.message}
          >
            <input
              {...register("fullName")}
              type="text"
              placeholder="John Doe"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.fullName
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                }
              `}
            />
          </FormField>
        </>
      )}

      {/* Work Email */}
      <FormField
        label="Work Email"
        icon={<Mail className="w-4 h-4 text-cyan-400" />}
        error={errors.workEmail?.message}
      >
        <input
          {...register("workEmail")}
          type="email"
          placeholder="organizer@university.edu"
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
            ${errors.workEmail
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            }
          `}
        />
      </FormField>

      {/* Password */}
      <FormField
        label="Password"
        icon={<Lock className="w-4 h-4 text-cyan-400" />}
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
                : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
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
            icon={<Lock className="w-4 h-4 text-cyan-400" />}
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
                    : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
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

          {/* Organization Name */}
          <FormField
            label="Organization/University Name"
            icon={<Building2 className="w-4 h-4 text-cyan-400" />}
            error={errors.organizationName?.message}
          >
            <input
              {...register("organizationName")}
              type="text"
              placeholder="TechUniversity"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.organizationName
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                }
              `}
            />
          </FormField>

          {/* Contact Phone */}
          <FormField
            label="Contact Phone Number"
            icon={<Phone className="w-4 h-4 text-cyan-400" />}
            error={errors.contactPhone?.message}
          >
            <input
              {...register("contactPhone")}
              type="tel"
              placeholder="+1 (555) 123-4567"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.contactPhone
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                }
              `}
            />
            <p className="text-xs text-slate-500 mt-1">Critical for system health alerts</p>
          </FormField>

          {/* Designation */}
          <FormField
            label="Role/Designation"
            icon={<Briefcase className="w-4 h-4 text-cyan-400" />}
            error={errors.designation?.message}
          >
            <div className="relative">
              <select
                {...register("designation")}
                className={`
                  w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                  appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all
                  ${errors.designation
                    ? "border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  }
                `}
              >
                <option value="" className="bg-slate-800">Select your role...</option>
                {organizerDesignationOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </FormField>

          {/* Organization Logo URL */}
          <FormField
            label="Organization Logo URL (Optional)"
            icon={<Image className="w-4 h-4 text-cyan-400" />}
            error={errors.organizationLogoUrl?.message}
          >
            <input
              {...register("organizationLogoUrl")}
              type="url"
              placeholder="https://example.com/logo.png"
              className={`
                w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white
                placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                ${errors.organizationLogoUrl
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                }
              `}
            />
          </FormField>
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
          bg-gradient-to-r from-cyan-600 to-cyan-500 text-white
          hover:from-cyan-500 hover:to-cyan-400 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-cyan-500/25
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
            {isLogin ? "Sign In" : "Create Organizer Account"}
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
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      )}
    </form>
  );
}
