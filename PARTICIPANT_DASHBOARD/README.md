# Participant Dashboard

A dynamic, responsive single-page dashboard for hackathon participant/team tracking.

## Features

- **Real-time Data Fetching**: Dynamic data loading with loading states and error handling
- **Glassmorphism Dark Theme**: Modern glass-like UI with backdrop blur effects
- **Animated Gradient Background**: Floating animated orbs creating a dynamic background
- **Framer Motion Animations**: Staggered animations throughout the UI
- **3D Hover Tilt Cards**: Interactive cards with tilt effect on hover
- **Glowing Badges**: Status badges with glow effects
- **Circular Progress Ring**: Animated progress indicator for fairness score
- **Custom Styled Recharts**: Line and bar charts with custom tooltips
- **Toast Notifications**: Animated notifications for alerts and confirmations
- **Modals**: Explanation submission and mentor help request modals

## Project Structure

```
PARTICIPANT_DASHBOARD/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page (accepts teamId query param)
│   └── ParticipantDashboard.tsx  # Main dashboard component
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Cards.tsx     # TiltCard, GlowingBadge, CircularProgress, etc.
│   │   └── Modals.tsx    # Toast, ExplanationModal, MentorHelpModal
│   ├── charts/           # Chart components
│   │   └── Charts.tsx    # CommitTimelineChart, ContributionBarChart
│   └── sections/         # Page sections
│       ├── HeaderSection.tsx
│       ├── FairnessSection.tsx
│       └── LearningSummarySection.tsx
├── hooks/                # Custom React hooks
│   └── useDashboard.ts   # useDashboard, useFlags, useToasts, etc.
├── services/             # API/Data services
│   └── dashboardService.ts  # Data fetching service (mock data)
├── types/                # TypeScript type definitions
│   └── dashboard.ts      # All interfaces and types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Getting Started

### Installation

```bash
cd PARTICIPANT_DASHBOARD
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### With Team ID

You can pass a team ID via query parameter:
```
http://localhost:3000?teamId=your-team-id
```

## Making it Dynamic

The dashboard is designed to be easily connected to a real backend:

### 1. Update the Service Layer

Edit `services/dashboardService.ts` to replace mock data with real API calls:

```typescript
async getDashboardData(teamId: string): Promise<ApiResponse<DashboardData>> {
  const response = await fetch(`/api/teams/${teamId}/dashboard`);
  const data = await response.json();
  return { success: true, data };
}
```

### 2. Add API Routes (Optional)

Create API routes in `app/api/` for server-side data handling:

```
app/api/
├── teams/
│   └── [teamId]/
│       ├── dashboard/route.ts
│       ├── flags/[flagId]/explain/route.ts
│       └── mentor-help/route.ts
```

### 3. Connect to Database

Use Prisma or any ORM to connect to your database and fetch real team data.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Recharts** - Chart components
- **Lucide React** - Icons

## License

MIT
