import ParticipantDashboard from "./ParticipantDashboard";

interface PageProps {
  searchParams: Promise<{ teamId?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const teamId = params.teamId || "codecrafters";

  return <ParticipantDashboard teamId={teamId} />;
}
