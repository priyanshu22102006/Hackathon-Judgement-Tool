// ============================================================================
// HackCheck - Zod Validation Schemas
// Client-side validation for all user roles
// ============================================================================

import { z } from "zod";

// ============================================================================
// Common Validators
// ============================================================================

// GitHub Repository URL - Strict validation
export const githubRepoUrlSchema = z
  .string()
  .min(1, "Repository URL is required")
  .regex(
    /^https:\/\/github\.com\/[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}\/[a-zA-Z0-9._-]+\/?$/,
    "Invalid GitHub repository URL. Format: https://github.com/username/repo-name"
  );

// GitHub Username validation
export const githubUsernameSchema = z
  .string()
  .min(1, "GitHub username is required")
  .max(39, "GitHub username must be 39 characters or less")
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
    "Invalid GitHub username format"
  );

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Phone number validation
export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format");

// URL validation (optional)
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .or(z.literal(""))
  .optional();

// ============================================================================
// Tech Stack Options
// ============================================================================

export const techStackOptions = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Svelte",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "FastAPI",
  "Flask",
  "Java",
  "Spring Boot",
  "Go",
  "Rust",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "GraphQL",
  "REST API",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Firebase",
  "Supabase",
  "TensorFlow",
  "PyTorch",
  "OpenAI API",
  "LangChain",
  "Web3.js",
  "Solidity",
  "Ethereum",
  "Solana",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
] as const;

export const techStackSchema = z
  .array(z.string())
  .min(1, "Select at least one technology");

// ============================================================================
// Domain Expertise Options
// ============================================================================

export const domainExpertiseOptions = [
  { value: "AI_ML", label: "AI/ML" },
  { value: "WEB3", label: "Web3/Blockchain" },
  { value: "FULL_STACK", label: "Full Stack Development" },
  { value: "MOBILE", label: "Mobile Development" },
  { value: "CLOUD_DEVOPS", label: "Cloud & DevOps" },
  { value: "CYBERSECURITY", label: "Cybersecurity" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "IOT", label: "IoT" },
  { value: "GAME_DEV", label: "Game Development" },
  { value: "AR_VR", label: "AR/VR" },
] as const;

export const domainExpertiseSchema = z
  .array(z.enum(["AI_ML", "WEB3", "FULL_STACK", "MOBILE", "CLOUD_DEVOPS", "CYBERSECURITY", "DATA_SCIENCE", "IOT", "GAME_DEV", "AR_VR"]))
  .min(1, "Select at least one domain of expertise");

// ============================================================================
// Organizer Designation Options
// ============================================================================

export const organizerDesignationOptions = [
  { value: "LEAD_ORGANIZER", label: "Lead Organizer" },
  { value: "TECHNICAL_COORDINATOR", label: "Technical Coordinator" },
  { value: "EVENT_MANAGER", label: "Event Manager" },
  { value: "VOLUNTEER_COORDINATOR", label: "Volunteer Coordinator" },
  { value: "SPONSORSHIP_LEAD", label: "Sponsorship Lead" },
  { value: "MARKETING_LEAD", label: "Marketing Lead" },
] as const;

// ============================================================================
// PARTICIPANT REGISTRATION SCHEMA
// ============================================================================

export const teamMemberSchema = z.object({
  githubUsername: githubUsernameSchema,
});

export const participantRegistrationSchema = z.object({
  // Hackathon Invite Code
  hackathonInviteCode: z
    .string()
    .min(1, "Hackathon invite code is required")
    .min(6, "Invalid invite code"),

  // Team Details
  teamName: z
    .string()
    .min(1, "Team name is required")
    .min(3, "Team name must be at least 3 characters")
    .max(50, "Team name must be 50 characters or less"),

  teamMembers: z
    .array(teamMemberSchema)
    .min(1, "At least one team member is required")
    .max(4, "Maximum 4 team members allowed"),

  // Repository
  githubRepoUrl: githubRepoUrlSchema,

  // Tech Stack
  techStack: techStackSchema,

  // Contact
  preferredEmail: emailSchema,

  // Consent - Both required
  commitTrackingConsent: z
    .boolean()
    .refine((val) => val === true, "You must agree to commit tracking transparency policy"),
  locationTrackingConsent: z
    .boolean()
    .refine((val) => val === true, "You must consent to location access for geo-fence verification"),
});

export type ParticipantRegistrationData = z.infer<typeof participantRegistrationSchema>;

// ============================================================================
// ORGANIZER REGISTRATION SCHEMA
// ============================================================================

export const organizerRegistrationSchema = z.object({
  // Personal Info
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),

  workEmail: emailSchema,

  password: passwordSchema,

  confirmPassword: z.string().min(1, "Please confirm your password"),

  // Organization Details
  organizationName: z
    .string()
    .min(1, "Organization/University name is required")
    .min(2, "Organization name must be at least 2 characters"),

  contactPhone: phoneSchema,

  designation: z.enum([
    "LEAD_ORGANIZER",
    "TECHNICAL_COORDINATOR",
    "EVENT_MANAGER",
    "VOLUNTEER_COORDINATOR",
    "SPONSORSHIP_LEAD",
    "MARKETING_LEAD",
  ]),

  organizationLogoUrl: urlSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type OrganizerRegistrationData = z.infer<typeof organizerRegistrationSchema>;

// ============================================================================
// JUDGE/MENTOR REGISTRATION SCHEMA
// ============================================================================

export const judgeMentorRegistrationSchema = z.object({
  // Personal Info
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),

  email: emailSchema,

  password: passwordSchema,

  confirmPassword: z.string().min(1, "Please confirm your password"),

  // Role Type
  isMentor: z.boolean().default(false), // false = Judge, true = Mentor

  // Hackathon Access
  hackathonAccessToken: z
    .string()
    .min(1, "Hackathon access token is required")
    .min(6, "Invalid access token"),

  // Professional Details
  domainExpertise: domainExpertiseSchema,

  linkedinUrl: z
    .string()
    .regex(
      /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      "Invalid LinkedIn URL. Format: https://linkedin.com/in/your-profile"
    )
    .or(z.literal(""))
    .optional(),

  portfolioUrl: urlSchema,

  // Availability (for Mentors only)
  availabilityStart: z.string().optional(),
  availabilityEnd: z.string().optional(),
  availabilityTimezone: z.string().optional(),

  // Conflict of Interest Declaration
  conflictDeclaration: z
    .boolean()
    .refine((val) => val === true, "You must declare that you have no conflict of interest with participating teams"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    // If mentor is selected, availability times are required
    if (data.isMentor) {
      return data.availabilityStart && data.availabilityEnd;
    }
    return true;;
  },
  {
    message: "Availability hours are required for mentors",
    path: ["availabilityStart"],
  }
);

export type JudgeMentorRegistrationData = z.infer<typeof judgeMentorRegistrationSchema>;

// ============================================================================
// LOGIN SCHEMA
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
