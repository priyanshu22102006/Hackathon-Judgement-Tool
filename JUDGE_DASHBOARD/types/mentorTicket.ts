// ============================================================================
// MENTOR TICKET TYPES & INTERFACES
// ============================================================================

export type TicketStatus = "Routing" | "Assigned" | "Resolved";

export interface MentorTicket {
  ticketId: string;
  teamName: string;
  problemDescription: string;
  aiDetectedTechStack: string[];
  aiAssignedMentor: string;
  status: TicketStatus;
  timestamp: string; // ISO string
}

export interface MentorTicketRequest {
  teamId: string;
  teamName: string;
  problemDescription: string;
}

export interface MentorTicketResponse {
  success: boolean;
  ticket?: MentorTicket;
  error?: string;
}

// Mock mentor data for AI assignment
export interface Mentor {
  name: string;
  expertise: string[];
}

export const AVAILABLE_MENTORS: Mentor[] = [
  { name: "Dr. Sarah Chen", expertise: ["React", "TypeScript", "Next.js", "Redux"] },
  { name: "Marcus Rodriguez", expertise: ["Node.js", "Express", "MongoDB", "PostgreSQL"] },
  { name: "Priya Sharma", expertise: ["Python", "Django", "FastAPI", "Machine Learning"] },
  { name: "James Wilson", expertise: ["AWS", "Docker", "Kubernetes", "DevOps"] },
  { name: "Emily Zhang", expertise: ["Vue.js", "Firebase", "GraphQL", "Tailwind CSS"] },
  { name: "Ahmed Hassan", expertise: ["Java", "Spring Boot", "Microservices", "Kafka"] },
  { name: "Lisa Tanaka", expertise: ["Flutter", "React Native", "Mobile Development", "iOS"] },
  { name: "David Kim", expertise: ["TensorFlow", "PyTorch", "Computer Vision", "NLP"] },
];

// Mock ticket data simulating shared database state
export const MOCK_MENTOR_TICKETS: MentorTicket[] = [
  {
    ticketId: "TKT-001",
    teamName: "CodeCrafters",
    problemDescription: "We're having trouble implementing real-time WebSocket connections in our Next.js app. The connection keeps dropping after 30 seconds and we're unsure how to handle reconnection logic properly.",
    aiDetectedTechStack: ["Next.js", "WebSocket", "TypeScript"],
    aiAssignedMentor: "Dr. Sarah Chen",
    status: "Assigned",
    timestamp: "2026-02-28T10:30:00Z",
  },
  {
    ticketId: "TKT-002",
    teamName: "ByteBlasters",
    problemDescription: "Our PostgreSQL queries are extremely slow when joining multiple tables. We have around 100k records and the query takes over 10 seconds. Need help with query optimization and indexing strategies.",
    aiDetectedTechStack: ["PostgreSQL", "Node.js", "Express"],
    aiAssignedMentor: "Marcus Rodriguez",
    status: "Resolved",
    timestamp: "2026-02-28T09:15:00Z",
  },
  {
    ticketId: "TKT-003",
    teamName: "NeuralNinjas",
    problemDescription: "We're training a CNN for image classification but the model keeps overfitting. Already tried dropout and data augmentation but validation accuracy plateaus at 65%.",
    aiDetectedTechStack: ["Python", "TensorFlow", "Computer Vision"],
    aiAssignedMentor: "David Kim",
    status: "Assigned",
    timestamp: "2026-02-28T11:45:00Z",
  },
  {
    ticketId: "TKT-004",
    teamName: "CloudChasers",
    problemDescription: "Our Docker containers work locally but fail to deploy on AWS ECS. Getting permission denied errors when trying to access S3 buckets from within the container.",
    aiDetectedTechStack: ["Docker", "AWS", "ECS", "S3"],
    aiAssignedMentor: "James Wilson",
    status: "Routing",
    timestamp: "2026-02-28T12:00:00Z",
  },
  {
    ticketId: "TKT-005",
    teamName: "PixelPioneers",
    problemDescription: "Having issues with state management in our Vue.js application. When multiple components update the same store module, we're seeing race conditions and inconsistent UI.",
    aiDetectedTechStack: ["Vue.js", "Vuex", "JavaScript"],
    aiAssignedMentor: "Emily Zhang",
    status: "Assigned",
    timestamp: "2026-02-28T10:00:00Z",
  },
  {
    ticketId: "TKT-006",
    teamName: "DataDragons",
    problemDescription: "Need help setting up a real-time data pipeline using Kafka. We want to stream sensor data from IoT devices to our dashboard but struggling with consumer configuration.",
    aiDetectedTechStack: ["Kafka", "Java", "Spring Boot"],
    aiAssignedMentor: "Ahmed Hassan",
    status: "Routing",
    timestamp: "2026-02-28T12:15:00Z",
  },
  {
    ticketId: "TKT-007",
    teamName: "AppAlchemists",
    problemDescription: "Our Flutter app crashes on iOS devices when switching between tabs rapidly. Works fine on Android. Suspect it's related to disposing controllers improperly.",
    aiDetectedTechStack: ["Flutter", "Dart", "iOS"],
    aiAssignedMentor: "Lisa Tanaka",
    status: "Assigned",
    timestamp: "2026-02-28T11:00:00Z",
  },
  {
    ticketId: "TKT-008",
    teamName: "CodeCrafters",
    problemDescription: "How do we implement server-side rendering with dynamic routes in Next.js 14? The documentation is confusing about when to use generateStaticParams vs dynamic rendering.",
    aiDetectedTechStack: ["Next.js", "React", "TypeScript"],
    aiAssignedMentor: "Dr. Sarah Chen",
    status: "Resolved",
    timestamp: "2026-02-28T08:30:00Z",
  },
];

// Helper function to get tickets for a specific team
export function getTeamTickets(teamName: string): MentorTicket[] {
  return MOCK_MENTOR_TICKETS.filter(
    (ticket) => ticket.teamName.toLowerCase() === teamName.toLowerCase()
  );
}

// Helper function to get all active tickets (for organizer view)
export function getActiveTickets(): MentorTicket[] {
  return MOCK_MENTOR_TICKETS.filter((ticket) => ticket.status !== "Resolved");
}

// Helper function to calculate ticket stats for a team (for judge view)
export function getTeamTicketStats(teamName: string) {
  const tickets = getTeamTickets(teamName);
  return {
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter((t) => t.status === "Resolved").length,
    activeTickets: tickets.filter((t) => t.status !== "Resolved").length,
    techStacksMentioned: Array.from(new Set(tickets.flatMap((t) => t.aiDetectedTechStack))),
    externalHelpProbability: calculateExternalHelpScore(tickets.length),
  };
}

// Calculate external help probability based on ticket count
function calculateExternalHelpScore(ticketCount: number): {
  score: number;
  level: "Low" | "Medium" | "High";
  color: string;
} {
  if (ticketCount <= 1) {
    return { score: 15, level: "Low", color: "green" };
  } else if (ticketCount <= 3) {
    return { score: 35, level: "Medium", color: "yellow" };
  } else {
    return { score: 60 + ticketCount * 5, level: "High", color: "red" };
  }
}
