// ============================================================================
// Mock Data Service - Organizer Dashboard
// ============================================================================

import type {
  OrganizerDashboardState,
  HackathonOverview,
  LiveActivityMonitor,
  RuleComplianceLocation,
  MentorSupportAlerts,
  RuleConfiguration,
  TeamDetails,
  TeamScores,
  JudgeMentorScore,
} from "../types";

// Helper to generate random data
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ============================================================================
// Mock Judges and Mentors
// ============================================================================
const judges = [
  { id: "j-001", name: "Dr. Sarah Chen", role: "judge" as const },
  { id: "j-002", name: "Prof. Michael Ross", role: "judge" as const },
  { id: "j-003", name: "Dr. Emily Watson", role: "judge" as const },
];

const mentors = [
  { id: "m-001", name: "John Smith", role: "mentor" as const },
  { id: "m-002", name: "Lisa Johnson", role: "mentor" as const },
];

// Generate team scores
function generateTeamScores(): TeamScores {
  const allEvaluators = [...judges, ...mentors];
  const maxScorePerEvaluator = 100;
  
  const scores: JudgeMentorScore[] = allEvaluators.map(evaluator => ({
    id: evaluator.id,
    name: evaluator.name,
    role: evaluator.role,
    score: randomBetween(60, 100),
    maxScore: maxScorePerEvaluator,
    criteria: evaluator.role === "judge" ? "Technical Implementation" : "Team Collaboration",
    timestamp: `${randomBetween(10, 18)}:${randomBetween(10, 59).toString().padStart(2, '0')}`,
  }));
  
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxPossibleScore = scores.length * maxScorePerEvaluator;
  const averageScore = Math.round(totalScore / scores.length);
  
  return {
    scores,
    totalScore,
    maxPossibleScore,
    averageScore,
  };
}

// ============================================================================
// Mock Hackathon Overview
// ============================================================================
export const mockHackathonOverview: HackathonOverview = {
  totalRegisteredTeams: 48,
  activeTeamsCount: 42,
  inactiveTeamsCount: 6,
  averageCommitsPerTeam: 127,
  totalCommits: 6096,
  totalPullRequests: 892,
  averageFairnessScore: 87.4,
};

// ============================================================================
// Mock Live Activity Monitor
// ============================================================================
export const mockLiveActivity: LiveActivityMonitor = {
  realTimeActivityHeatmap: [
    { hour: "00:00", intensity: 15, commits: 23, teamCount: 8 },
    { hour: "02:00", intensity: 8, commits: 12, teamCount: 5 },
    { hour: "04:00", intensity: 5, commits: 7, teamCount: 3 },
    { hour: "06:00", intensity: 12, commits: 18, teamCount: 7 },
    { hour: "08:00", intensity: 45, commits: 67, teamCount: 28 },
    { hour: "10:00", intensity: 78, commits: 124, teamCount: 38 },
    { hour: "12:00", intensity: 65, commits: 98, teamCount: 35 },
    { hour: "14:00", intensity: 92, commits: 156, teamCount: 42 },
    { hour: "16:00", intensity: 88, commits: 142, teamCount: 40 },
    { hour: "18:00", intensity: 75, commits: 118, teamCount: 36 },
    { hour: "20:00", intensity: 82, commits: 134, teamCount: 38 },
    { hour: "22:00", intensity: 58, commits: 89, teamCount: 32 },
  ],
  teamsCurrentlyCoding: [
    "Team Alpha",
    "Code Crusaders",
    "Binary Builders",
    "Pixel Pirates",
    "Data Dynamos",
    "Cloud Chasers",
    "React Rangers",
    "Node Ninjas",
  ],
  teamsIdleForLongTime: [
    "Team Omega",
    "Lazy Loaders",
    "Timeout Tribe",
  ],
  recentCommits: [
    {
      id: "c1",
      team: "Team Alpha",
      message: "feat: Implement user authentication",
      timestamp: "2 min ago",
      author: "alice_dev",
    },
    {
      id: "c2",
      team: "Code Crusaders",
      message: "fix: Resolve API endpoint issues",
      timestamp: "5 min ago",
      author: "bob_coder",
    },
    {
      id: "c3",
      team: "Binary Builders",
      message: "style: Update dashboard UI",
      timestamp: "8 min ago",
      author: "carol_ui",
    },
    {
      id: "c4",
      team: "Pixel Pirates",
      message: "docs: Add API documentation",
      timestamp: "12 min ago",
      author: "dave_docs",
    },
    {
      id: "c5",
      team: "Data Dynamos",
      message: "refactor: Optimize database queries",
      timestamp: "15 min ago",
      author: "eve_db",
    },
  ],
  peakActivityTime: "14:00 - 16:00",
};

// ============================================================================
// Mock Rule Compliance & Location
// ============================================================================
export const mockCompliance: RuleComplianceLocation = {
  teamsFullyCompliant: 38,
  teamsWithWarnings: 7,
  teamsWithMajorViolations: 3,
  onSiteTeamsCount: 32,
  mixedLocationTeams: 12,
  outsideGeoFenceTeams: 4,
  complianceHistory: [
    { time: "00:00", compliant: 45, warnings: 2, violations: 1 },
    { time: "04:00", compliant: 44, warnings: 3, violations: 1 },
    { time: "08:00", compliant: 42, warnings: 4, violations: 2 },
    { time: "12:00", compliant: 40, warnings: 5, violations: 3 },
    { time: "16:00", compliant: 38, warnings: 7, violations: 3 },
    { time: "20:00", compliant: 38, warnings: 7, violations: 3 },
  ],
  violationTypes: [
    { 
      type: "Suspicious commit timing", 
      count: 5, 
      severity: "medium",
      incidents: [
        { teamName: "Team Omega", teamId: "t-omega", participant: "john_dev", timestamp: "2h ago", details: "Multiple commits within 30 seconds" },
        { teamName: "Lazy Loaders", teamId: "t-lazy", participant: "mike_code", timestamp: "3h ago", details: "Commits at 3:00 AM during restricted hours" },
        { teamName: "Stack Stormers", teamId: "t-stack", participant: "sara_dev", timestamp: "4h ago", details: "Bulk commits right before deadline" },
        { teamName: "Neural Ninjas", teamId: "t-neural", participant: "alex_ml", timestamp: "5h ago", details: "Unusually fast code additions" },
        { teamName: "Logic Lords", teamId: "t-logic", participant: "emma_logic", timestamp: "6h ago", details: "Commits during team break period" },
      ]
    },
    { 
      type: "External contributor", 
      count: 3, 
      severity: "high",
      incidents: [
        { teamName: "Code Crusaders", teamId: "t-crusaders", participant: "unknown_user", timestamp: "1h ago", details: "Commit from unregistered GitHub account" },
        { teamName: "Binary Builders", teamId: "t-binary", participant: "external_dev123", timestamp: "2h ago", details: "Code pushed from non-team member" },
        { teamName: "Pixel Pirates", teamId: "t-pixel", participant: "helper_friend", timestamp: "4h ago", details: "PR merged from external collaborator" },
      ]
    },
    { 
      type: "Copy-paste detection", 
      count: 4, 
      severity: "medium",
      incidents: [
        { teamName: "Data Dynamos", teamId: "t-dynamos", participant: "eve_db", timestamp: "30m ago", details: "85% similarity with StackOverflow answer" },
        { teamName: "Algorithm Aces", teamId: "t-algo", participant: "frank_algo", timestamp: "1h ago", details: "Code block matches GitHub Copilot suggestion" },
        { teamName: "Cloud Chasers", teamId: "t-cloud", participant: "grace_cloud", timestamp: "2h ago", details: "Imported code from external repository" },
        { teamName: "Timeout Tribe", teamId: "t-timeout", participant: "tim_out", timestamp: "3h ago", details: "Large code paste detected (200+ lines)" },
      ]
    },
    { 
      type: "Location mismatch", 
      count: 4, 
      severity: "low",
      incidents: [
        { teamName: "Team Alpha", teamId: "t-alpha", participant: "alice_dev", timestamp: "45m ago", details: "IP address outside venue geofence" },
        { teamName: "Byte Bandits", teamId: "t-byte", participant: "bob_byte", timestamp: "1h ago", details: "VPN connection detected" },
        { teamName: "Debug Dragons", teamId: "t-debug", participant: "dan_debug", timestamp: "2h ago", details: "Location changed mid-session" },
        { teamName: "Error Eliminators", teamId: "t-error", participant: "erin_err", timestamp: "3h ago", details: "Mobile hotspot from different location" },
      ]
    },
    { 
      type: "Inactive period", 
      count: 6, 
      severity: "low",
      incidents: [
        { teamName: "Team Omega", teamId: "t-omega", participant: "All members", timestamp: "4h ago", details: "No activity for 4+ hours" },
        { teamName: "Lazy Loaders", teamId: "t-lazy", participant: "All members", timestamp: "3h ago", details: "Extended break period detected" },
        { teamName: "Timeout Tribe", teamId: "t-timeout", participant: "All members", timestamp: "2h ago", details: "Team went offline for 2 hours" },
        { teamName: "Rest Runners", teamId: "t-rest", participant: "All members", timestamp: "5h ago", details: "Sleep break - no commits overnight" },
        { teamName: "Pause Panthers", teamId: "t-pause", participant: "ryan_pause", timestamp: "1h ago", details: "Single member inactive" },
        { teamName: "Idle Innovators", teamId: "t-idle", participant: "ida_idle", timestamp: "30m ago", details: "Low activity warning" },
      ]
    },
  ],
};

// ============================================================================
// Mock Mentor Support Alerts
// ============================================================================
export const mockAlerts: MentorSupportAlerts = {
  teamsInactiveForXHours: [
    {
      teamName: "Team Omega",
      teamId: "t-omega",
      issue: "No commits for 4+ hours",
      duration: "4h 23m",
      severity: "warning",
      timestamp: "Started 4h ago",
    },
    {
      teamName: "Lazy Loaders",
      teamId: "t-lazy",
      issue: "No commits for 6+ hours",
      duration: "6h 12m",
      severity: "critical",
      timestamp: "Started 6h ago",
    },
    {
      teamName: "Timeout Tribe",
      teamId: "t-timeout",
      issue: "No commits for 3+ hours",
      duration: "3h 45m",
      severity: "warning",
      timestamp: "Started 3h ago",
    },
  ],
  teamsWithRepeatedBuildFailures: [
    {
      teamName: "Bug Bashers",
      teamId: "t-bugs",
      issue: "12 consecutive build failures",
      duration: "Last 2 hours",
      severity: "critical",
      timestamp: "Latest failure 5m ago",
    },
    {
      teamName: "Error Explorers",
      teamId: "t-error",
      issue: "8 consecutive build failures",
      duration: "Last 1.5 hours",
      severity: "warning",
      timestamp: "Latest failure 12m ago",
    },
  ],
  teamsWithVeryLowActivity: [
    {
      teamName: "Slow Starters",
      teamId: "t-slow",
      issue: "Only 12 commits total",
      duration: "Since start",
      severity: "info",
      timestamp: "Avg 0.5 commits/hour",
    },
    {
      teamName: "Minimal Makers",
      teamId: "t-minimal",
      issue: "Only 18 commits total",
      duration: "Since start",
      severity: "info",
      timestamp: "Avg 0.8 commits/hour",
    },
  ],
  teamsNeedingUrgentHelp: [
    {
      teamName: "Help Seekers",
      teamId: "t-help",
      issue: "Requested mentor support",
      duration: "Waiting 15m",
      severity: "critical",
      timestamp: "Request at 14:32",
    },
  ],
  totalActiveAlerts: 9,
};

// ============================================================================
// Mock Rule Configuration
// ============================================================================
export const mockConfiguration: RuleConfiguration = {
  hackathonName: "Diversion 2026",
  hackathonTimeWindow: {
    start: "2026-02-27T09:00:00",
    end: "2026-02-28T21:00:00",
  },
  allowedLocations: "Building A, Building B, Remote (with VPN)",
  offlineWorkAllowed: false,
  scoringWeightAdjustment: {
    commits: 25,
    codeQuality: 30,
    collaboration: 15,
    consistency: 15,
    innovation: 15,
  },
  hackathonStatus: "live",
  maxTeamSize: 4,
  minCommitInterval: 5,
  autoDisqualifyInactiveHours: 8,
};

// ============================================================================
// Mock Teams
// ============================================================================
const baseTeams: TeamDetails[] = [
  {
    id: "t-alpha",
    name: "Team Alpha",
    members: ["alice_dev", "alex_code", "amy_ui", "aaron_db"],
    commits: 156,
    lastActivity: "2 min ago",
    complianceStatus: "compliant",
    location: "on-site",
    fairnessScore: 94,
    teamScores: generateTeamScores(),
  },
  {
    id: "t-crusaders",
    name: "Code Crusaders",
    members: ["bob_coder", "betty_dev", "brian_api"],
    commits: 142,
    lastActivity: "5 min ago",
    complianceStatus: "compliant",
    location: "on-site",
    fairnessScore: 92,
    teamScores: generateTeamScores(),
  },
  {
    id: "t-builders",
    name: "Binary Builders",
    members: ["carol_ui", "charlie_back", "cathy_full", "chris_dev"],
    commits: 138,
    lastActivity: "8 min ago",
    complianceStatus: "compliant",
    location: "mixed",
    fairnessScore: 88,
    teamScores: generateTeamScores(),
  },
  {
    id: "t-pirates",
    name: "Pixel Pirates",
    members: ["dave_docs", "diana_ux", "derek_fe"],
    commits: 124,
    lastActivity: "12 min ago",
    complianceStatus: "warning",
    location: "remote",
    fairnessScore: 78,
    teamScores: generateTeamScores(),
  },
  {
    id: "t-omega",
    name: "Team Omega",
    members: ["oscar_lazy", "olivia_slow"],
    commits: 45,
    lastActivity: "4h 23m ago",
    complianceStatus: "warning",
    location: "on-site",
    fairnessScore: 65,
    teamScores: generateTeamScores(),
  },
  {
    id: "t-bugs",
    name: "Bug Bashers",
    members: ["frank_fix", "fiona_debug", "felix_test"],
    commits: 89,
    lastActivity: "5 min ago",
    complianceStatus: "violation",
    location: "on-site",
    fairnessScore: 52,
    teamScores: generateTeamScores(),
  },
];

// Generate additional teams to reach 48 total
const teamNames = [
  "Data Dynamos", "Cloud Chasers", "React Rangers", "Node Ninjas", "API Avengers",
  "DevOps Dragons", "Frontend Foxes", "Backend Bears", "Full Stack Falcons", "UI Unicorns",
  "Database Dolphins", "Security Sharks", "ML Mavericks", "AI Aces", "Cyber Cats",
  "Tech Titans", "Code Commandos", "Hack Heroes", "Dev Ducks", "Byte Builders",
  "Logic Lions", "Syntax Samurai", "Git Guardians", "Deploy Demons", "Cache Cowboys",
  "Query Queens", "Route Rockets", "State Spartans", "Hook Hawks", "Effect Eagles",
  "Promise Pirates", "Async Astronauts", "Thread Tigers", "Module Monkeys", "Import Impalas",
  "Export Eagles", "Debug Dragons", "Test Turtles", "Lint Lions", "Build Bisons",
  "Deploy Dolphins", "Ship Sharks"
];

const memberNames = [
  "alex", "bob", "carol", "dave", "emma", "frank", "grace", "henry", "iris", "jack",
  "kate", "leo", "maya", "noah", "olivia", "paul", "quinn", "ruby", "sam", "tara",
  "uma", "vic", "wren", "xena", "yuki", "zara"
];

const suffixes = ["_dev", "_code", "_api", "_ui", "_full", "_back", "_data", "_ml"];

function generateTeams(): TeamDetails[] {
  const allTeams = [...baseTeams];
  const locations: Array<"on-site" | "remote" | "mixed"> = ["on-site", "remote", "mixed"];
  const statuses: Array<"compliant" | "warning" | "violation"> = ["compliant", "compliant", "compliant", "warning", "violation"];

  for (let i = 0; i < teamNames.length && allTeams.length < 48; i++) {
    const memberCount = randomBetween(2, 4);
    const members: string[] = [];
    const usedNames = new Set<string>();
    
    for (let j = 0; j < memberCount; j++) {
      let name = memberNames[randomBetween(0, memberNames.length - 1)];
      while (usedNames.has(name)) {
        name = memberNames[randomBetween(0, memberNames.length - 1)];
      }
      usedNames.add(name);
      members.push(name + suffixes[randomBetween(0, suffixes.length - 1)]);
    }

    const isInactive = i >= teamNames.length - 6;
    const lastActivityOptions = isInactive 
      ? [`${randomBetween(2, 8)}h ${randomBetween(10, 59)}m ago`]
      : [`${randomBetween(1, 30)} min ago`];

    allTeams.push({
      id: `t-${teamNames[i].toLowerCase().replace(/\s+/g, "-")}`,
      name: teamNames[i],
      members,
      commits: isInactive ? randomBetween(20, 60) : randomBetween(80, 160),
      lastActivity: lastActivityOptions[0],
      complianceStatus: isInactive ? statuses[randomBetween(3, 4)] : statuses[randomBetween(0, 2)],
      location: locations[randomBetween(0, 2)],
      fairnessScore: isInactive ? randomBetween(45, 70) : randomBetween(75, 98),      teamScores: generateTeamScores(),    });
  }

  return allTeams;
}

export const mockTeams: TeamDetails[] = generateTeams();

// ============================================================================
// Full Dashboard State
// ============================================================================
export const mockDashboardState: OrganizerDashboardState = {
  overview: mockHackathonOverview,
  liveActivity: mockLiveActivity,
  compliance: mockCompliance,
  alerts: mockAlerts,
  configuration: mockConfiguration,
  teams: mockTeams,
  isLoading: false,
  lastUpdated: "2026-02-27T00:00:00.000Z", // Static to avoid hydration mismatch
};

// ============================================================================
// Service Functions
// ============================================================================
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  async fetchDashboardData(): Promise<OrganizerDashboardState> {
    await delay(800);
    return {
      ...mockDashboardState,
      lastUpdated: new Date().toISOString(),
    };
  },

  async updateConfiguration(config: Partial<RuleConfiguration>): Promise<RuleConfiguration> {
    await delay(500);
    return { ...mockConfiguration, ...config };
  },

  async updateHackathonStatus(status: "not-started" | "live" | "ended"): Promise<void> {
    await delay(1000);
  },

  async generateReports(): Promise<{ url: string }> {
    await delay(2000);
    return { url: "/reports/hackathon-summary-2026.pdf" };
  },

  async dismissAlert(alertId: string): Promise<void> {
    await delay(300);
  },

  async sendMentorToTeam(teamId: string): Promise<void> {
    await delay(500);
  },

  getActivityColor(intensity: number): string {
    if (intensity < 20) return "#1e293b";
    if (intensity < 40) return "#7c3aed";
    if (intensity < 60) return "#8b5cf6";
    if (intensity < 80) return "#a78bfa";
    return "#c4b5fd";
  },
};
