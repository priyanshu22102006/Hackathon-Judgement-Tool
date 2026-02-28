// ============================================================================
// HackCheck - Authentication & Registration Types
// ============================================================================

export type UserRole = "participant" | "organizer" | "judge" | "mentor";

// Auth Mode - Login or Signup
export type AuthMode = "login" | "signup";

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  githubUsername?: string;
  avatarUrl: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  selectedRole: UserRole | null;
  authMode: AuthMode;
  error: string | null;
}

export interface GitHubProfile {
  login: string;
  id: number;
  avatarUrl: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
}

// ============================================================================
// Team Member Types
// ============================================================================

export interface TeamMember {
  id: string;
  githubUsername: string;
  isValid: boolean;
  isValidating: boolean;
  profile?: GitHubProfile;
}

// ============================================================================
// Participant Registration Types
// ============================================================================

export interface ParticipantRegistrationData {
  hackathonInviteCode: string;
  teamName: string;
  teamMembers: TeamMember[];
  githubRepoUrl: string;
  techStack: string[];
  preferredEmail: string;
  commitTrackingConsent: boolean;
  locationTrackingConsent: boolean;
}

export interface ParticipantRegistrationState {
  data: ParticipantRegistrationData;
  isSubmitting: boolean;
  isValidatingRepo: boolean;
  isRegistered: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// Organizer Registration Types
// ============================================================================

export type OrganizerDesignation =
  | "LEAD_ORGANIZER"
  | "TECHNICAL_COORDINATOR"
  | "EVENT_MANAGER"
  | "VOLUNTEER_COORDINATOR"
  | "SPONSORSHIP_LEAD"
  | "MARKETING_LEAD";

export interface OrganizerRegistrationData {
  fullName: string;
  workEmail: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  contactPhone: string;
  designation: OrganizerDesignation;
  organizationLogoUrl?: string;
}

export interface OrganizerRegistrationState {
  data: OrganizerRegistrationData;
  isSubmitting: boolean;
  isRegistered: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// Judge/Mentor Registration Types
// ============================================================================

export type DomainExpertise =
  | "AI_ML"
  | "WEB3"
  | "FULL_STACK"
  | "MOBILE"
  | "CLOUD_DEVOPS"
  | "CYBERSECURITY"
  | "DATA_SCIENCE"
  | "IOT"
  | "GAME_DEV"
  | "AR_VR";

export interface JudgeMentorRegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isMentor: boolean;
  hackathonAccessToken: string;
  domainExpertise: DomainExpertise[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  availabilityStart?: string;
  availabilityEnd?: string;
  availabilityTimezone?: string;
  conflictDeclaration: boolean;
}

export interface JudgeMentorRegistrationState {
  data: JudgeMentorRegistrationData;
  isSubmitting: boolean;
  isRegistered: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// Legacy Support (backwards compatibility)
// ============================================================================

export interface TeamRegistrationData {
  teamName: string;
  githubRepoLink: string;
  teamMembers: TeamMember[];
  consentAccepted: boolean;
}

export interface RegistrationState {
  data: TeamRegistrationData;
  isSubmitting: boolean;
  isValidatingRepo: boolean;
  isRegistered: boolean;
  errors: {
    teamName?: string;
    githubRepoLink?: string;
    teamMembers?: string;
    consent?: string;
  };
}

// ============================================================================
// UI Types
// ============================================================================

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration: number;
}

export interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  color: string;
  authType: "github" | "email";
}
