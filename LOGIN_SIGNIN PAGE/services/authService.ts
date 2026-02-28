import type { User, UserRole, TeamRegistrationData, GitHubProfile } from "../types";

// ============================================================================
// Mock Auth Service
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock user data for different roles
const mockUsers: Record<UserRole, User> = {
  participant: {
    id: "user-001",
    githubUsername: "devhacker42",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    name: "Alex Developer",
    email: "alex@hackathon.dev",
    role: "participant",
  },
  organizer: {
    id: "user-002",
    githubUsername: "hackmaster",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    name: "Sarah Organizer",
    email: "sarah@hackathon.org",
    role: "organizer",
  },
  judge: {
    id: "user-003",
    githubUsername: "codereview_pro",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    name: "Judge Michael",
    email: "michael@judge.io",
    role: "judge",
  },
  mentor: {
    id: "user-004",
    githubUsername: "mentor_expert",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    name: "Mentor Diana",
    email: "diana@mentor.io",
    role: "mentor",
  },
};

/**
 * Auth Service - Mock implementation
 */
export const authService = {
  /**
   * Simulate GitHub OAuth login
   */
  async loginWithGitHub(role: UserRole): Promise<User> {
    await delay(1500); // Simulate OAuth flow
    return mockUsers[role];
  },

  /**
   * Simulate logout
   */
  async logout(): Promise<void> {
    await delay(500);
  },

  /**
   * Validate GitHub repository access
   */
  async validateRepository(repoUrl: string): Promise<boolean> {
    await delay(2000); // Simulate API call
    // Mock validation - accept any valid looking GitHub URL
    const githubRepoPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRepoPattern.test(repoUrl);
  },

  /**
   * Validate GitHub username exists
   */
  async validateGitHubUser(username: string): Promise<boolean> {
    await delay(800); // Simulate API call
    // Mock validation - accept usernames 3+ chars
    return username.length >= 3;
  },

  /**
   * Fetch GitHub profile details for a username
   */
  async fetchGitHubProfile(username: string): Promise<GitHubProfile | null> {
    await delay(600);
    // Mock GitHub profile data
    if (username.length < 3) return null;
    
    return {
      login: username,
      id: Math.floor(Math.random() * 100000000),
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000)}?v=4`,
      name: `${username.charAt(0).toUpperCase()}${username.slice(1)} Developer`,
      company: "Hackathon Team",
      blog: `https://${username}.dev`,
      location: "San Francisco, CA",
      email: `${username}@github.com`,
      bio: "Passionate developer building cool stuff 🚀",
      publicRepos: Math.floor(Math.random() * 100),
      publicGists: Math.floor(Math.random() * 20),
      followers: Math.floor(Math.random() * 500),
      following: Math.floor(Math.random() * 200),
      createdAt: "2020-01-15T00:00:00Z",
    };
  },

  /**
   * Submit team registration
   */
  async registerTeam(data: TeamRegistrationData): Promise<{ success: boolean; teamId?: string; repoUrl?: string }> {
    await delay(2500); // Simulate registration process
    
    // Mock validation
    if (!data.consentAccepted) {
      throw new Error("Consent policy must be accepted");
    }
    
    if (!data.githubRepoLink) {
      throw new Error("Repository link is required");
    }

    if (data.teamMembers.length === 0) {
      throw new Error("At least one team member is required");
    }

    return {
      success: true,
      teamId: `team-${Date.now()}`,
      repoUrl: data.githubRepoLink,
    };
  },

  /**
   * Open repository in new tab
   */
  openRepository(repoUrl: string): void {
    window.open(repoUrl, "_blank", "noopener,noreferrer");
  },
};

export default authService;
