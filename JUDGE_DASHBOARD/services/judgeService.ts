import type { Team, SortOption, TeamScores, JudgeMentorScore, TeamRemarks, Remark, GuidanceRequest, MentorInfo, TeamLocation } from "../types";

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

// Helper to generate random scores
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Sample remarks for generating feedback
const sampleRemarks = {
  improvement: [
    "Consider adding input validation for user forms",
    "Database queries could be optimized with indexing",
    "Add error handling for API failures",
    "Implement caching for frequently accessed data",
    "Consider adding unit tests for core functions",
    "UI could be more responsive on mobile devices",
    "Add loading states for async operations",
    "Consider implementing rate limiting",
  ],
  praise: [
    "Excellent code organization and structure",
    "Great use of modern frameworks",
    "Impressive feature implementation in short time",
    "Clean and readable codebase",
    "Good team collaboration evident in commits",
  ],
  concern: [
    "Security vulnerability found in authentication",
    "Memory leak detected in main component",
    "API keys exposed in frontend code",
    "Missing CORS configuration",
  ],
  suggestion: [
    "Try using TypeScript for better type safety",
    "Consider adding CI/CD pipeline",
    "Documentation could be more comprehensive",
    "Add environment variables for configuration",
  ],
};

// Generate team remarks
function generateTeamRemarks(teamIndex: number): TeamRemarks {
  const allEvaluators = [...judges, ...mentors];
  const remarkCount = randomBetween(2, 5);
  const remarks: Remark[] = [];
  
  for (let i = 0; i < remarkCount; i++) {
    const evaluator = allEvaluators[randomBetween(0, allEvaluators.length - 1)];
    const categories: Array<"improvement" | "praise" | "concern" | "suggestion"> = 
      ["improvement", "praise", "concern", "suggestion"];
    const category = categories[randomBetween(0, categories.length - 1)];
    const categoryRemarks = sampleRemarks[category];
    const isAddressed = category === "improvement" ? randomBetween(0, 1) === 1 : false;
    
    remarks.push({
      id: `remark-${teamIndex}-${i}`,
      authorId: evaluator.id,
      authorName: evaluator.name,
      authorRole: evaluator.role,
      content: categoryRemarks[randomBetween(0, categoryRemarks.length - 1)],
      category,
      timestamp: `${randomBetween(9, 17)}:${randomBetween(10, 59).toString().padStart(2, '0')}`,
      isAddressed,
      pointsAwarded: isAddressed ? randomBetween(5, 15) : undefined,
      addressedTimestamp: isAddressed ? `${randomBetween(10, 18)}:${randomBetween(10, 59).toString().padStart(2, '0')}` : undefined,
    });
  }
  
  const addressedRemarks = remarks.filter(r => r.isAddressed);
  const pendingRemarks = remarks.filter(r => r.category === "improvement" && !r.isAddressed);
  
  return {
    remarks,
    totalPointsAwarded: addressedRemarks.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0),
    pendingImprovements: pendingRemarks.length,
    addressedImprovements: addressedRemarks.length,
  };
}

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
// MOCK DATA - 3+ Team Objects
// ============================================================================
const mockTeams: Team[] = [
  {
    summary: {
      id: "team-001",
      teamName: "CodeCrafters",
      repoLink: "https://github.com/codecrafters/hackathon-ai",
      techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "TensorFlow"],
      finalScore: 87,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 3, phase: "setup" },
        { time: "10:00", commits: 5, phase: "setup" },
        { time: "11:00", commits: 8, phase: "feature" },
        { time: "12:00", commits: 4, phase: "feature" },
        { time: "13:00", commits: 12, phase: "feature" },
        { time: "14:00", commits: 15, phase: "feature" },
        { time: "15:00", commits: 9, phase: "feature" },
        { time: "16:00", commits: 7, phase: "fix" },
        { time: "17:00", commits: 11, phase: "fix" },
        { time: "18:00", commits: 6, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Project Setup", timestamp: "09:30" },
        { name: "Core Features Complete", timestamp: "14:45" },
        { name: "Final Polish", timestamp: "17:30" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 94,
      commitTimingStatus: "Normal",
      locationStatusBadge: "On-site",
      geoFenceWarnings: [],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Alice", commits: 32, linesAdded: 1540, percentage: 35 },
        { name: "Bob", commits: 28, linesAdded: 1200, percentage: 30 },
        { name: "Charlie", commits: 18, linesAdded: 890, percentage: 20 },
        { name: "Diana", commits: 14, linesAdded: 670, percentage: 15 },
      ],
      fairnessScore: 82,
      dominanceIndicator: null,
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 12,
      externalHelpProbability: 8,
      indicatorExplanations: [
        "Consistent coding style throughout",
        "Gradual complexity increase observed",
        "No suspicious large commits",
      ],
      commitQualityScore: 88,
      behavior: "Refactoring",
      testCasesAdded: true,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Excellent team collaboration",
        "Clean code architecture",
        "Innovative AI integration",
        "Comprehensive documentation",
      ],
      keyConcerns: [
        "Minor test coverage gaps",
        "Could improve error handling",
      ],
      judgeNotes: "",
    },
    shortlisted: false,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(0),
  },
  {
    summary: {
      id: "team-002",
      teamName: "ByteBlasters",
      repoLink: "https://github.com/byteblasters/eco-tracker",
      techStack: ["Vue.js", "Python", "FastAPI", "MongoDB", "Docker"],
      finalScore: 79,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 2, phase: "setup" },
        { time: "10:00", commits: 3, phase: "setup" },
        { time: "11:00", commits: 15, phase: "feature" },
        { time: "12:00", commits: 2, phase: "feature" },
        { time: "13:00", commits: 18, phase: "feature" },
        { time: "14:00", commits: 8, phase: "feature" },
        { time: "15:00", commits: 5, phase: "fix" },
        { time: "16:00", commits: 20, phase: "fix" },
        { time: "17:00", commits: 4, phase: "fix" },
        { time: "18:00", commits: 3, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Environment Ready", timestamp: "09:45" },
        { name: "MVP Complete", timestamp: "15:00" },
        { name: "Bug Fixes Done", timestamp: "17:45" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 78,
      commitTimingStatus: "Late",
      locationStatusBadge: "Mixed",
      geoFenceWarnings: [
        "2 commits from outside venue at 16:30",
        "Location change detected at 14:00",
      ],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Eve", commits: 45, linesAdded: 2100, percentage: 55 },
        { name: "Frank", commits: 20, linesAdded: 800, percentage: 25 },
        { name: "Grace", commits: 15, linesAdded: 600, percentage: 20 },
      ],
      fairnessScore: 58,
      dominanceIndicator: "Eve (55%) - High dominance warning",
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 35,
      externalHelpProbability: 22,
      indicatorExplanations: [
        "Large initial commit detected",
        "Some boilerplate code patterns",
        "Commit messages inconsistent",
      ],
      commitQualityScore: 65,
      behavior: "Dumping",
      testCasesAdded: false,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Innovative concept",
        "Good UI/UX design",
        "Environmental impact focus",
      ],
      keyConcerns: [
        "Uneven contribution distribution",
        "Possible pre-built components",
        "Late commit pattern",
        "Missing tests",
      ],
      judgeNotes: "",
    },
    shortlisted: false,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(1),
  },
  {
    summary: {
      id: "team-003",
      teamName: "NeuralNinjas",
      repoLink: "https://github.com/neuralninjas/health-ai",
      techStack: ["Next.js", "Go", "Redis", "Kubernetes", "PyTorch"],
      finalScore: 92,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 4, phase: "setup" },
        { time: "10:00", commits: 6, phase: "setup" },
        { time: "11:00", commits: 7, phase: "feature" },
        { time: "12:00", commits: 9, phase: "feature" },
        { time: "13:00", commits: 10, phase: "feature" },
        { time: "14:00", commits: 11, phase: "feature" },
        { time: "15:00", commits: 8, phase: "feature" },
        { time: "16:00", commits: 6, phase: "fix" },
        { time: "17:00", commits: 5, phase: "fix" },
        { time: "18:00", commits: 4, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Architecture Design", timestamp: "09:15" },
        { name: "AI Model Integrated", timestamp: "13:30" },
        { name: "Production Ready", timestamp: "18:00" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 98,
      commitTimingStatus: "Early",
      locationStatusBadge: "On-site",
      geoFenceWarnings: [],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Henry", commits: 22, linesAdded: 980, percentage: 26 },
        { name: "Ivy", commits: 21, linesAdded: 950, percentage: 25 },
        { name: "Jack", commits: 20, linesAdded: 920, percentage: 24 },
        { name: "Kim", commits: 19, linesAdded: 880, percentage: 25 },
      ],
      fairnessScore: 96,
      dominanceIndicator: null,
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 5,
      externalHelpProbability: 3,
      indicatorExplanations: [
        "Organic code growth pattern",
        "Consistent commit sizes",
        "Well-documented changes",
        "Pair programming evidence",
      ],
      commitQualityScore: 94,
      behavior: "Refactoring",
      testCasesAdded: true,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Exceptional team balance",
        "High code quality",
        "Advanced tech stack mastery",
        "Complete test coverage",
        "Excellent documentation",
      ],
      keyConcerns: [],
      judgeNotes: "",
    },
    shortlisted: true,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(2),
  },
  {
    summary: {
      id: "team-004",
      teamName: "PixelPioneers",
      repoLink: "https://github.com/pixelpioneers/ar-shopping",
      techStack: ["React Native", "Firebase", "ARKit", "Node.js"],
      finalScore: 74,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 1, phase: "setup" },
        { time: "10:00", commits: 2, phase: "setup" },
        { time: "11:00", commits: 3, phase: "setup" },
        { time: "12:00", commits: 5, phase: "feature" },
        { time: "13:00", commits: 8, phase: "feature" },
        { time: "14:00", commits: 12, phase: "feature" },
        { time: "15:00", commits: 18, phase: "feature" },
        { time: "16:00", commits: 22, phase: "fix" },
        { time: "17:00", commits: 15, phase: "fix" },
        { time: "18:00", commits: 8, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Setup Complete", timestamp: "11:00" },
        { name: "AR Features Done", timestamp: "15:30" },
        { name: "App Deployed", timestamp: "18:00" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 85,
      commitTimingStatus: "Late",
      locationStatusBadge: "On-site",
      geoFenceWarnings: ["Slow start detected"],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Leo", commits: 38, linesAdded: 1800, percentage: 45 },
        { name: "Mia", commits: 25, linesAdded: 1100, percentage: 30 },
        { name: "Noah", commits: 18, linesAdded: 750, percentage: 25 },
      ],
      fairnessScore: 68,
      dominanceIndicator: "Leo (45%) - Moderate dominance",
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 25,
      externalHelpProbability: 18,
      indicatorExplanations: [
        "Some template usage detected",
        "AR framework heavily utilized",
        "Good custom implementation",
      ],
      commitQualityScore: 72,
      behavior: "Refactoring",
      testCasesAdded: false,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Creative AR implementation",
        "Good mobile performance",
        "Engaging user experience",
      ],
      keyConcerns: [
        "Late start to development",
        "Some contribution imbalance",
        "No automated tests",
      ],
      judgeNotes: "",
    },
    shortlisted: false,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(3),
  },
  // ============================================================================
  // Additional Teams
  // ============================================================================
  {
    summary: {
      id: "team-005",
      teamName: "CloudChasers",
      repoLink: "https://github.com/cloudchasers/devops-suite",
      techStack: ["Go", "Terraform", "AWS", "Docker", "Prometheus"],
      finalScore: 85,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 4, phase: "setup" },
        { time: "10:00", commits: 6, phase: "setup" },
        { time: "11:00", commits: 10, phase: "feature" },
        { time: "12:00", commits: 8, phase: "feature" },
        { time: "13:00", commits: 14, phase: "feature" },
        { time: "14:00", commits: 12, phase: "feature" },
        { time: "15:00", commits: 9, phase: "fix" },
        { time: "16:00", commits: 7, phase: "fix" },
        { time: "17:00", commits: 5, phase: "fix" },
        { time: "18:00", commits: 4, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Infrastructure Setup", timestamp: "10:00" },
        { name: "CI/CD Pipeline", timestamp: "14:30" },
        { name: "Monitoring Ready", timestamp: "17:00" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 92,
      commitTimingStatus: "Normal",
      locationStatusBadge: "On-site",
      geoFenceWarnings: [],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Oscar", commits: 28, linesAdded: 1200, percentage: 30 },
        { name: "Paula", commits: 26, linesAdded: 1100, percentage: 28 },
        { name: "Quinn", commits: 24, linesAdded: 1050, percentage: 27 },
        { name: "Ryan", commits: 15, linesAdded: 600, percentage: 15 },
      ],
      fairnessScore: 78,
      dominanceIndicator: null,
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 15,
      externalHelpProbability: 10,
      indicatorExplanations: [
        "Good infrastructure patterns",
        "Well-documented code",
        "Standard DevOps practices",
      ],
      commitQualityScore: 84,
      behavior: "Refactoring",
      testCasesAdded: true,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Solid infrastructure design",
        "Automated deployment pipeline",
        "Good monitoring setup",
      ],
      keyConcerns: [
        "Could use more documentation",
      ],
      judgeNotes: "",
    },
    shortlisted: false,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(4),
  },
  {
    summary: {
      id: "team-006",
      teamName: "DataDragons",
      repoLink: "https://github.com/datadragons/analytics-hub",
      techStack: ["Python", "Spark", "Kafka", "PostgreSQL", "Airflow"],
      finalScore: 81,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 2, phase: "setup" },
        { time: "10:00", commits: 4, phase: "setup" },
        { time: "11:00", commits: 7, phase: "feature" },
        { time: "12:00", commits: 9, phase: "feature" },
        { time: "13:00", commits: 11, phase: "feature" },
        { time: "14:00", commits: 13, phase: "feature" },
        { time: "15:00", commits: 10, phase: "feature" },
        { time: "16:00", commits: 8, phase: "fix" },
        { time: "17:00", commits: 6, phase: "fix" },
        { time: "18:00", commits: 5, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Data Pipeline Ready", timestamp: "11:30" },
        { name: "Analytics Dashboard", timestamp: "15:00" },
        { name: "Reports Generated", timestamp: "17:45" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 88,
      commitTimingStatus: "Normal",
      locationStatusBadge: "Mixed",
      geoFenceWarnings: ["1 remote commit detected"],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Sarah", commits: 30, linesAdded: 1400, percentage: 38 },
        { name: "Tom", commits: 25, linesAdded: 1100, percentage: 32 },
        { name: "Uma", commits: 20, linesAdded: 800, percentage: 30 },
      ],
      fairnessScore: 72,
      dominanceIndicator: "Sarah (38%) - Slight dominance",
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 20,
      externalHelpProbability: 12,
      indicatorExplanations: [
        "Good data architecture",
        "Efficient query optimization",
        "Some boilerplate usage",
      ],
      commitQualityScore: 79,
      behavior: "Refactoring",
      testCasesAdded: true,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Excellent data processing",
        "Scalable architecture",
        "Real-time analytics",
      ],
      keyConcerns: [
        "Some uneven contribution",
        "Remote work detected",
      ],
      judgeNotes: "",
    },
    shortlisted: true,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(5),
  },
  {
    summary: {
      id: "team-007",
      teamName: "BlockBuilders",
      repoLink: "https://github.com/blockbuilders/defi-platform",
      techStack: ["Solidity", "React", "Hardhat", "Web3.js", "IPFS"],
      finalScore: 89,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 5, phase: "setup" },
        { time: "10:00", commits: 7, phase: "setup" },
        { time: "11:00", commits: 12, phase: "feature" },
        { time: "12:00", commits: 10, phase: "feature" },
        { time: "13:00", commits: 15, phase: "feature" },
        { time: "14:00", commits: 18, phase: "feature" },
        { time: "15:00", commits: 14, phase: "feature" },
        { time: "16:00", commits: 10, phase: "fix" },
        { time: "17:00", commits: 8, phase: "fix" },
        { time: "18:00", commits: 6, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Smart Contracts Deployed", timestamp: "11:00" },
        { name: "Frontend Connected", timestamp: "14:30" },
        { name: "DeFi Features Live", timestamp: "17:30" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 96,
      commitTimingStatus: "Early",
      locationStatusBadge: "On-site",
      geoFenceWarnings: [],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Victor", commits: 28, linesAdded: 1300, percentage: 28 },
        { name: "Wendy", commits: 27, linesAdded: 1250, percentage: 27 },
        { name: "Xavier", commits: 25, linesAdded: 1200, percentage: 25 },
        { name: "Yara", commits: 20, linesAdded: 950, percentage: 20 },
      ],
      fairnessScore: 91,
      dominanceIndicator: null,
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 8,
      externalHelpProbability: 5,
      indicatorExplanations: [
        "Original smart contract logic",
        "Secure implementation patterns",
        "Well-tested contracts",
      ],
      commitQualityScore: 92,
      behavior: "Refactoring",
      testCasesAdded: true,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Innovative DeFi concept",
        "Secure smart contracts",
        "Excellent team balance",
        "Early completion",
      ],
      keyConcerns: [],
      judgeNotes: "",
    },
    shortlisted: true,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(6),
  },
  {
    summary: {
      id: "team-008",
      teamName: "GameGurus",
      repoLink: "https://github.com/gamegurus/multiplayer-arena",
      techStack: ["Unity", "C#", "Photon", "Firebase", "Blender"],
      finalScore: 76,
    },
    codeEvolution: {
      timelineData: [
        { time: "09:00", commits: 1, phase: "setup" },
        { time: "10:00", commits: 2, phase: "setup" },
        { time: "11:00", commits: 4, phase: "setup" },
        { time: "12:00", commits: 6, phase: "feature" },
        { time: "13:00", commits: 10, phase: "feature" },
        { time: "14:00", commits: 15, phase: "feature" },
        { time: "15:00", commits: 20, phase: "feature" },
        { time: "16:00", commits: 18, phase: "fix" },
        { time: "17:00", commits: 12, phase: "fix" },
        { time: "18:00", commits: 8, phase: "fix" },
      ],
      phases: ["setup", "feature", "fix"],
      milestones: [
        { name: "Game Engine Setup", timestamp: "11:30" },
        { name: "Multiplayer Working", timestamp: "15:00" },
        { name: "Game Playable", timestamp: "18:00" },
      ],
    },
    compliance: {
      workDuringHackathonPct: 82,
      commitTimingStatus: "Late",
      locationStatusBadge: "On-site",
      geoFenceWarnings: ["Slow start detected"],
    },
    contributionFairness: {
      memberContributions: [
        { name: "Zack", commits: 45, linesAdded: 2000, percentage: 50 },
        { name: "Amy", commits: 25, linesAdded: 1000, percentage: 28 },
        { name: "Ben", commits: 18, linesAdded: 700, percentage: 22 },
      ],
      fairnessScore: 55,
      dominanceIndicator: "Zack (50%) - High dominance warning",
    },
    integrityCodeQuality: {
      preBuiltLikelihoodScore: 30,
      externalHelpProbability: 25,
      indicatorExplanations: [
        "Heavy asset usage",
        "Some template code detected",
        "Framework-heavy approach",
      ],
      commitQualityScore: 68,
      behavior: "Dumping",
      testCasesAdded: false,
    },
    autoGeneratedSummary: {
      keyStrengths: [
        "Fun game concept",
        "Working multiplayer",
        "Good visual design",
      ],
      keyConcerns: [
        "Uneven contribution",
        "Late development start",
        "Heavy template usage",
        "No tests",
      ],
      judgeNotes: "",
    },
    shortlisted: false,
    teamScores: generateTeamScores(),
    teamRemarks: generateTeamRemarks(7),
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// Mentor Location & Guidance Request Mock Data
// ============================================================================

const mentorDetails: MentorInfo[] = [
  {
    id: "m-001",
    name: "John Smith",
    expertise: ["React", "Node.js", "TypeScript", "GraphQL"],
    currentLocation: { x: 50, y: 30, zone: "Zone A", tableNumber: "M-1" },
    isAvailable: true,
  },
  {
    id: "m-002",
    name: "Lisa Johnson",
    expertise: ["Python", "ML", "TensorFlow", "Data Science"],
    currentLocation: { x: 70, y: 60, zone: "Zone B", tableNumber: "M-2" },
    isAvailable: true,
  },
  {
    id: "m-003",
    name: "David Park",
    expertise: ["DevOps", "AWS", "Docker", "Kubernetes"],
    currentLocation: { x: 30, y: 80, zone: "Zone C", tableNumber: "M-3" },
    isAvailable: false,
  },
  {
    id: "m-004",
    name: "Sarah Lee",
    expertise: ["UI/UX", "Figma", "CSS", "Design Systems"],
    currentLocation: { x: 80, y: 40, zone: "Zone A", tableNumber: "M-4" },
    isAvailable: true,
  },
];

// Calculate distance between two locations
const calculateDistance = (loc1: TeamLocation, loc2: TeamLocation): number => {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// ============================================================================
// AI-Based Mentor/Judge Matching System
// ============================================================================

// Request type to expertise mapping for AI matching
const requestTypeExpertiseMap: Record<GuidanceRequest["requestType"], string[]> = {
  technical: ["React", "Node.js", "TypeScript", "Python", "JavaScript", "Express", "REST API", "GraphQL"],
  design: ["UI/UX", "Figma", "CSS", "Design Systems", "Tailwind"],
  debugging: ["React", "Node.js", "JavaScript", "Python", "TypeScript", "Express"],
  strategy: ["DevOps", "AWS", "Docker", "Kubernetes", "Architecture"],
  general: [], // Matches any expertise
};

/**
 * Calculate expertise match percentage between mentor and team's tech stack
 */
const calculateExpertiseMatch = (
  mentorExpertise: string[],
  teamTechStack: string[],
  requestType: GuidanceRequest["requestType"]
): { matchPct: number; matchedSkills: string[] } => {
  const normalizedMentorExpertise = mentorExpertise.map((e) => e.toLowerCase());
  const normalizedTeamStack = teamTechStack.map((t) => t.toLowerCase());
  const relevantSkills = requestTypeExpertiseMap[requestType].map((s) => s.toLowerCase());

  const matchedSkills: string[] = [];
  let matchScore = 0;
  let totalWeight = 0;

  // Direct tech stack matches (weight: 2)
  for (const tech of normalizedTeamStack) {
    totalWeight += 2;
    if (normalizedMentorExpertise.some((e) => e.includes(tech) || tech.includes(e))) {
      matchScore += 2;
      const originalTech = teamTechStack.find((t) => t.toLowerCase() === tech);
      if (originalTech) matchedSkills.push(originalTech);
    }
  }

  // Request type expertise matches (weight: 1.5)
  for (const skill of relevantSkills) {
    totalWeight += 1.5;
    if (normalizedMentorExpertise.some((e) => e.includes(skill) || skill.includes(e))) {
      matchScore += 1.5;
    }
  }

  const matchPct = totalWeight > 0 ? Math.min(100, Math.round((matchScore / totalWeight) * 100)) : 0;
  return { matchPct, matchedSkills };
};

/**
 * Count mentor's current workload (pending + in-progress requests)
 */
const getMentorWorkload = (mentorId: string): number => {
  return mockGuidanceRequests.filter(
    (r) => r.mentorId === mentorId && (r.status === "pending" || r.status === "in-progress")
  ).length;
};

/**
 * Calculate comprehensive AI match score for a mentor-request pair
 * Factors: expertise match, availability, workload, distance, priority urgency
 */
const calculateAIMatchScore = (
  request: GuidanceRequest,
  mentor: MentorInfo
): {
  score: number;
  reasons: string[];
  expertiseMatchPct: number;
} => {
  const reasons: string[] = [];
  let score = 0;

  // 1. Expertise Match (0-40 points)
  const { matchPct, matchedSkills } = calculateExpertiseMatch(
    mentor.expertise,
    request.techStack,
    request.requestType
  );
  const expertiseScore = Math.round((matchPct / 100) * 40);
  score += expertiseScore;
  if (matchPct >= 70) {
    reasons.push(`Strong expertise match (${matchPct}%): ${matchedSkills.slice(0, 3).join(", ")}`);
  } else if (matchPct >= 40) {
    reasons.push(`Partial expertise match (${matchPct}%)`);
  }

  // 2. Mentor Availability (0-20 points)
  if (mentor.isAvailable) {
    score += 20;
    reasons.push("Mentor is currently available");
  } else {
    score += 5; // Slight penalty but not zero as they may become available
    reasons.push("Mentor currently busy");
  }

  // 3. Workload Balance (0-20 points)
  const workload = getMentorWorkload(mentor.id);
  if (workload === 0) {
    score += 20;
    reasons.push("No current queue");
  } else if (workload <= 2) {
    score += 15;
    reasons.push(`Light workload (${workload} in queue)`);
  } else if (workload <= 4) {
    score += 8;
    reasons.push(`Moderate workload (${workload} in queue)`);
  } else {
    score += 2;
    reasons.push(`Heavy workload (${workload} in queue)`);
  }

  // 4. Proximity Score (0-15 points)
  const distance = calculateDistance(request.teamLocation, mentor.currentLocation);
  if (distance < 15) {
    score += 15;
    reasons.push("Nearest mentor");
  } else if (distance < 30) {
    score += 12;
    reasons.push("Close proximity");
  } else if (distance < 50) {
    score += 8;
  } else {
    score += 3;
  }

  // 5. Priority Urgency Boost (0-5 points)
  if (request.priority === "urgent") {
    score += 5;
    reasons.push("Urgent priority - expedited matching");
  } else if (request.priority === "high") {
    score += 3;
  }

  return {
    score: Math.min(100, score),
    reasons,
    expertiseMatchPct: matchPct,
  };
};

/**
 * Find the best mentor match for a guidance request using AI scoring
 */
const findBestMentorMatch = (
  request: GuidanceRequest
): {
  bestMentor: MentorInfo | null;
  aiScore: number;
  reasons: string[];
  expertiseMatchPct: number;
} => {
  let bestScore = -1;
  let bestMentor: MentorInfo | null = null;
  let bestReasons: string[] = [];
  let bestExpertisePct = 0;

  for (const mentor of mentorDetails) {
    const { score, reasons, expertiseMatchPct } = calculateAIMatchScore(request, mentor);
    if (score > bestScore) {
      bestScore = score;
      bestMentor = mentor;
      bestReasons = reasons;
      bestExpertisePct = expertiseMatchPct;
    }
  }

  return {
    bestMentor,
    aiScore: bestScore,
    reasons: bestReasons,
    expertiseMatchPct: bestExpertisePct,
  };
};

// Mock guidance requests
const mockGuidanceRequests: GuidanceRequest[] = [
  {
    id: "gr-001",
    teamId: "team-001",
    teamName: "CodeCrafters",
    teamLocation: { x: 20, y: 25, zone: "Zone A", tableNumber: "A-5" },
    mentorId: "m-001",
    mentorName: "John Smith",
    requestType: "technical",
    description: "Need help with WebSocket implementation for real-time updates",
    techStack: ["Next.js", "Socket.io", "TypeScript"],
    priority: "high",
    status: "pending",
    requestedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    queuePosition: 1,
  },
  {
    id: "gr-002",
    teamId: "team-003",
    teamName: "InnoMinds",
    teamLocation: { x: 45, y: 55, zone: "Zone B", tableNumber: "B-12" },
    mentorId: "m-001",
    mentorName: "John Smith",
    requestType: "debugging",
    description: "Memory leak in React component causing performance issues",
    techStack: ["React", "Redux", "JavaScript"],
    priority: "urgent",
    status: "in-progress",
    requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    queuePosition: 0,
  },
  {
    id: "gr-003",
    teamId: "team-002",
    teamName: "ByteForce",
    teamLocation: { x: 60, y: 70, zone: "Zone B", tableNumber: "B-8" },
    mentorId: "m-002",
    mentorName: "Lisa Johnson",
    requestType: "technical",
    description: "Need guidance on ML model training and optimization",
    techStack: ["Python", "TensorFlow", "Pandas"],
    priority: "medium",
    status: "pending",
    requestedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    queuePosition: 1,
  },
  {
    id: "gr-004",
    teamId: "team-005",
    teamName: "CloudChasers",
    teamLocation: { x: 15, y: 85, zone: "Zone C", tableNumber: "C-3" },
    mentorId: "m-003",
    mentorName: "David Park",
    requestType: "strategy",
    description: "Architecture review for microservices deployment",
    techStack: ["Docker", "Kubernetes", "AWS"],
    priority: "low",
    status: "pending",
    requestedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    queuePosition: 1,
  },
  {
    id: "gr-005",
    teamId: "team-004",
    teamName: "TechTitans",
    teamLocation: { x: 85, y: 35, zone: "Zone A", tableNumber: "A-15" },
    mentorId: "m-004",
    mentorName: "Sarah Lee",
    requestType: "design",
    description: "UI/UX feedback on dashboard layout and color scheme",
    techStack: ["Figma", "CSS", "Tailwind"],
    priority: "medium",
    status: "pending",
    requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    queuePosition: 1,
  },
  {
    id: "gr-006",
    teamId: "team-006",
    teamName: "DataDragons",
    teamLocation: { x: 55, y: 45, zone: "Zone B", tableNumber: "B-6" },
    mentorId: "m-002",
    mentorName: "Lisa Johnson",
    requestType: "technical",
    description: "Data preprocessing pipeline optimization",
    techStack: ["Python", "NumPy", "Scikit-learn"],
    priority: "high",
    status: "pending",
    requestedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    queuePosition: 2,
  },
  {
    id: "gr-007",
    teamId: "team-007",
    teamName: "BlockBuilders",
    teamLocation: { x: 40, y: 20, zone: "Zone A", tableNumber: "A-9" },
    mentorId: "m-001",
    mentorName: "John Smith",
    requestType: "debugging",
    description: "API integration failing with CORS errors",
    techStack: ["Express", "Node.js", "REST API"],
    priority: "high",
    status: "pending",
    requestedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    queuePosition: 2,
  },
];

/**
 * Judge Dashboard Service
 */
export const judgeService = {
  /**
   * Fetch all teams for evaluation
   */
  async getTeams(): Promise<Team[]> {
    await delay(500);
    return [...mockTeams];
  },

  /**
   * Get a single team by ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    await delay(200);
    return mockTeams.find((t) => t.summary.id === teamId) || null;
  },

  /**
   * Update judge notes for a team
   */
  async updateJudgeNotes(teamId: string, notes: string): Promise<boolean> {
    await delay(300);
    // In production, this would save to database
    return true;
  },

  /**
   * Toggle team shortlist status
   */
  async toggleShortlist(teamId: string): Promise<boolean> {
    await delay(200);
    return true;
  },

  /**
   * Submit final evaluation
   */
  async submitEvaluation(
    teamId: string,
    data: { notes: string; score: number }
  ): Promise<boolean> {
    await delay(400);
    return true;
  },

  /**
   * Sort teams by criteria
   */
  sortTeams(teams: Team[], sortBy: SortOption): Team[] {
    const sorted = [...teams];
    
    switch (sortBy) {
      case "fairness":
        return sorted.sort(
          (a, b) => b.contributionFairness.fairnessScore - a.contributionFairness.fairnessScore
        );
      case "innovation":
        return sorted.sort((a, b) => b.summary.finalScore - a.summary.finalScore);
      case "violations":
        return sorted.sort(
          (a, b) =>
            a.compliance.geoFenceWarnings.length - b.compliance.geoFenceWarnings.length
        );
      default:
        return sorted;
    }
  },

  /**
   * Add a remark/feedback for a team
   */
  async addRemark(
    teamId: string,
    remark: {
      authorId: string;
      authorName: string;
      authorRole: "judge" | "mentor";
      content: string;
      category: "improvement" | "praise" | "concern" | "suggestion";
    }
  ): Promise<Remark> {
    await delay(300);
    const newRemark: Remark = {
      id: `remark-${Date.now()}`,
      ...remark,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isAddressed: false,
    };
    // In production, this would save to database
    return newRemark;
  },

  /**
   * Mark an improvement as addressed and award points
   */
  async markRemarkAddressed(
    teamId: string,
    remarkId: string,
    pointsAwarded: number
  ): Promise<boolean> {
    await delay(300);
    // In production, this would update the database
    return true;
  },

  /**
   * Get all remarks for a team
   */
  async getTeamRemarks(teamId: string): Promise<TeamRemarks | null> {
    await delay(200);
    const team = mockTeams.find((t) => t.summary.id === teamId);
    return team?.teamRemarks || null;
  },

  // ============================================================================
  // Guidance Request Methods
  // ============================================================================

  /**
   * Get all guidance requests with AI-enhanced scoring
   */
  async getGuidanceRequests(): Promise<GuidanceRequest[]> {
    await delay(300);
    // Calculate distance and AI match score for each request
    return mockGuidanceRequests.map((request) => {
      const mentor = mentorDetails.find((m) => m.id === request.mentorId);
      const distance = mentor
        ? calculateDistance(request.teamLocation, mentor.currentLocation)
        : 0;
      
      // Calculate AI match score for current mentor assignment
      const currentMentorScore = mentor 
        ? calculateAIMatchScore(request, mentor)
        : { score: 0, reasons: [], expertiseMatchPct: 0 };
      
      // Find best mentor suggestion using AI
      const { bestMentor, aiScore, reasons, expertiseMatchPct } = findBestMentorMatch(request);
      
      return {
        ...request,
        distanceFromMentor: Math.round(distance),
        estimatedWaitTime: request.queuePosition * 10 + Math.round(distance / 5),
        // AI-enhanced fields
        aiMatchScore: mentor?.id === bestMentor?.id ? aiScore : currentMentorScore.score,
        aiMatchReasons: mentor?.id === bestMentor?.id ? reasons : currentMentorScore.reasons,
        expertiseMatchPct: mentor?.id === bestMentor?.id ? expertiseMatchPct : currentMentorScore.expertiseMatchPct,
        suggestedMentorId: bestMentor?.id,
        suggestedMentorName: bestMentor?.name,
      };
    });
  },

  /**
   * Get guidance requests for a specific mentor with AI scoring
   */
  async getMentorRequests(mentorId: string): Promise<GuidanceRequest[]> {
    await delay(200);
    const mentor = mentorDetails.find((m) => m.id === mentorId);
    return mockGuidanceRequests
      .filter((r) => r.mentorId === mentorId)
      .map((request) => {
        const distance = mentor
          ? calculateDistance(request.teamLocation, mentor.currentLocation)
          : 0;
        
        // Calculate AI match score
        const aiResult = mentor 
          ? calculateAIMatchScore(request, mentor)
          : { score: 0, reasons: [], expertiseMatchPct: 0 };
        
        // Find best mentor suggestion
        const { bestMentor, aiScore, reasons, expertiseMatchPct } = findBestMentorMatch(request);
        
        return {
          ...request,
          distanceFromMentor: Math.round(distance),
          estimatedWaitTime: request.queuePosition * 10 + Math.round(distance / 5),
          aiMatchScore: aiResult.score,
          aiMatchReasons: aiResult.reasons,
          expertiseMatchPct: aiResult.expertiseMatchPct,
          suggestedMentorId: bestMentor?.id,
          suggestedMentorName: bestMentor?.name,
        };
      });
  },

  /**
   * Get all mentors with their details
   */
  async getMentors(): Promise<MentorInfo[]> {
    await delay(200);
    return [...mentorDetails];
  },

  /**
   * Update guidance request status
   */
  async updateRequestStatus(
    requestId: string,
    status: "pending" | "in-progress" | "resolved" | "cancelled"
  ): Promise<boolean> {
    await delay(200);
    // In production, this would update the database
    return true;
  },

  /**
   * Sort guidance requests (includes AI-suggested sorting)
   */
  sortGuidanceRequests(
    requests: GuidanceRequest[],
    sortBy: "queue" | "distance" | "priority"
  ): GuidanceRequest[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    
    return [...requests].sort((a, b) => {
      switch (sortBy) {
        case "queue":
          // Sort by request time (oldest first)
          return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
        case "distance":
          // Sort by distance (nearest first)
          return (a.distanceFromMentor || 0) - (b.distanceFromMentor || 0);
        case "priority":
          // Sort by priority (urgent first)
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });
  },
};

export default judgeService;
