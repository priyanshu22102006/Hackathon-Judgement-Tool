"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  Building2,
  Github,
  IdCard,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  ShieldAlert,
  Tags,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";

const roleTabs = [
  { key: "participant", label: "Participant" },
  { key: "organizer", label: "Organizer" },
  { key: "judgeMentor", label: "Judge/Mentor" },
] as const;

type RoleTabKey = (typeof roleTabs)[number]["key"];

type ChipInputValue = string[];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isValidGithubRepoUrl(value: string) {
  // Strict GitHub repo URL format: https://github.com/{owner}/{repo} (optionally ending with .git)
  // - owner: letters/numbers/hyphens
  // - repo: letters/numbers/._- (common GitHub rules simplified)
  // - no extra path segments
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return false;
    if (url.hostname !== "github.com") return false;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return false;

    const [owner, repoRaw] = parts;
    const repo = repoRaw.endsWith(".git") ? repoRaw.slice(0, -4) : repoRaw;

    const ownerOk = /^[A-Za-z0-9-]{1,39}$/.test(owner);
    const repoOk = /^[A-Za-z0-9._-]{1,100}$/.test(repo);

    if (!ownerOk || !repoOk) return false;
    if (url.search || url.hash) return false;

    return true;
  } catch {
    return false;
  }
}

function normalizeChip(value: string) {
  return value.trim().replace(/^@/, "");
}

function dedupePreserveOrder(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

const participantPostOAuthSchema = z.object({
  eventCode: z
    .string()
    .min(3, "Invite code / Event ID is required")
    .max(64, "Invite code looks too long"),
  teamName: z.string().min(2, "Team name is required").max(80),
  teammateGithubUsernames: z
    .array(z.string().min(1))
    .min(0)
    .max(10, "Max 10 teammates"),
  repositoryUrl: z
    .string()
    .min(1, "Repository link is required")
    .refine(isValidGithubRepoUrl, {
      message: "Use a valid GitHub repo URL like https://github.com/org/repo",
    }),
  primaryTechStack: z.array(z.string().min(1)).min(1, "Pick at least one tech"),
  preferredContactEmail: z.string().email("Enter a valid contact email"),
  consentCommitTracking: z
    .boolean()
    .refine((v: boolean) => v === true, "You must agree to commit tracking consent"),
  consentIpLocation: z
    .boolean()
    .refine((v: boolean) => v === true, "You must consent to IP-based location verification"),
});

type ParticipantPostOAuthValues = z.infer<typeof participantPostOAuthSchema>;

const organizerSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  workEmail: z.string().email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2, "Organization/University name is required").max(160),
  contactPhoneNumber: z
    .string()
    .min(7, "Phone number is required")
    .max(30, "Phone number looks too long"),
  designation: z.enum([
    "Lead Organizer",
    "Technical Coordinator",
    "Operations",
    "Sponsorship",
    "Community",
    "Other",
  ]),
  organizationLogoUrl: z
    .string()
    .url("Logo URL must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type OrganizerValues = z.infer<typeof organizerSchema>;

type JudgeMentorMode = "Judge" | "Mentor";

const judgeMentorSchemaBase = z.object({
  mode: z.enum(["Judge", "Mentor"]),
  fullName: z.string().min(2, "Full name is required").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  hackathonAccessToken: z.string().min(8, "Access token is required").max(128),
  domainExpertise: z.enum([
    "AI/ML",
    "Web3",
    "Full Stack",
    "Frontend",
    "Backend",
    "DevOps",
    "Data Science",
    "Security",
    "Mobile",
    "Design",
    "Other",
  ]),
  linkedInOrPortfolioUrl: z
    .string()
    .min(1, "LinkedIn/Portfolio URL is required")
    .url("Enter a valid URL"),
  availabilityShift: z.string().optional().or(z.literal("")),
  conflictOfInterestAccepted: z
    .boolean()
    .refine((v: boolean) => v === true, "Conflict of interest declaration is required"),
});

const judgeMentorSchema = judgeMentorSchemaBase.superRefine(
  (val: z.infer<typeof judgeMentorSchemaBase>, ctx: z.RefinementCtx) => {
  if (val.mode === "Mentor") {
    const shift = (val.availabilityShift ?? "").trim();
    if (!shift) {
      ctx.addIssue({
        code: "custom",
        path: ["availabilityShift"],
        message: "Availability/Shift is required for Mentors",
      });
    }
  }
  }
);

type JudgeMentorValues = z.infer<typeof judgeMentorSchema>;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 text-xs font-medium tracking-wide text-white/70">{children}</div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="mt-1 text-xs text-rose-300">{message}</div>;
}

function InputShell({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-sky-300">
        {icon}
      </div>
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10 transition group-focus-within:ring-sky-400/35" />
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "h-11 w-full rounded-xl bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-white/30",
        "outline-none",
        props.className
      )}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "h-11 w-full appearance-none rounded-xl bg-white/5 pl-10 pr-10 text-sm text-white",
        "outline-none",
        props.className
      )}
    />
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
  hint,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-950 text-emerald-400 focus:ring-emerald-400/30"
        />
        <div>
          <div className="text-sm text-white/85">{label}</div>
          {hint ? <div className="mt-0.5 text-xs text-white/50">{hint}</div> : null}
        </div>
      </label>
      <FieldError message={error} />
    </div>
  );
}

function PillTabs({
  value,
  onChange,
}: {
  value: RoleTabKey;
  onChange: (v: RoleTabKey) => void;
}) {
  return (
    <div className="relative rounded-full border border-white/10 bg-white/5 p-1">
      <div className="relative grid grid-cols-3">
        {roleTabs.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cx(
                "relative z-10 rounded-full px-3 py-2 text-xs font-semibold tracking-wide transition",
                active ? "text-white" : "text-white/55 hover:text-white/80"
              )}
            >
              {t.label}
            </button>
          );
        })}
        <motion.div
          layout
          className="absolute inset-y-0 z-0 rounded-full bg-gradient-to-r from-sky-500/20 via-white/10 to-emerald-500/20 ring-1 ring-white/10"
          style={{
            width: "33.3333%",
            left:
              value === "participant" ? "0%" : value === "organizer" ? "33.3333%" : "66.6666%",
          }}
          transition={{ type: "spring", stiffness: 450, damping: 38 }}
        />
      </div>
    </div>
  );
}

function MiniModeSwitch({
  value,
  onChange,
}: {
  value: JudgeMentorMode;
  onChange: (v: JudgeMentorMode) => void;
}) {
  return (
    <div className="relative rounded-full border border-white/10 bg-white/5 p-1">
      <div className="relative grid grid-cols-2">
        {(["Judge", "Mentor"] as const).map((m) => {
          const active = value === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={cx(
                "relative z-10 rounded-full px-3 py-2 text-xs font-semibold tracking-wide transition",
                active ? "text-white" : "text-white/55 hover:text-white/80"
              )}
            >
              {m}
            </button>
          );
        })}
        <motion.div
          layout
          className="absolute inset-y-0 z-0 rounded-full bg-gradient-to-r from-emerald-500/20 via-white/10 to-sky-500/20 ring-1 ring-white/10"
          style={{ width: "50%", left: value === "Judge" ? "0%" : "50%" }}
          transition={{ type: "spring", stiffness: 450, damping: 38 }}
        />
      </div>
    </div>
  );
}

function ChipInput({
  label,
  placeholder,
  icon,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: ChipInputValue;
  onChange: (v: ChipInputValue) => void;
  hint?: string;
  error?: string;
}) {
  const [draft, setDraft] = React.useState("");

  const commitDraft = React.useCallback(() => {
    const raw = normalizeChip(draft);
    if (!raw) return;

    const next = dedupePreserveOrder([
      ...value,
      raw
        .replace(/\s+/g, "")
        .replace(/,+$/g, "")
        .trim(),
    ]).filter(Boolean);

    onChange(next);
    setDraft("");
  }, [draft, onChange, value]);

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <InputShell icon={icon}>
        <div className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-xl bg-white/5 py-2 pl-10 pr-2">
          {value.length ? (
            value.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/85"
              >
                <span className="max-w-[10rem] truncate">{chip}</span>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v !== chip))}
                  className="rounded-full px-1 text-white/55 hover:text-white"
                  aria-label={`Remove ${chip}`}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-white/30">{hint ?? ""}</span>
          )}

          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commitDraft();
              }
              if (e.key === "Backspace" && !draft && value.length) {
                onChange(value.slice(0, -1));
              }
            }}
            placeholder={value.length ? placeholder : ""}
            className="h-8 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />

          <button
            type="button"
            onClick={commitDraft}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/70 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />
      </InputShell>
      <FieldError message={error} />
    </div>
  );
}

function CommitViz() {
  const nodes = React.useMemo(
    () =>
      [
        { x: 14, y: 22, r: 3 },
        { x: 35, y: 18, r: 2.8 },
        { x: 58, y: 24, r: 3 },
        { x: 78, y: 14, r: 2.6 },
        { x: 86, y: 36, r: 3.2 },
        { x: 64, y: 44, r: 2.6 },
        { x: 40, y: 38, r: 3 },
        { x: 20, y: 46, r: 2.4 },
      ],
    []
  );

  const links = React.useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [1, 6],
    ],
    []
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute left-16 bottom-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <motion.div
        className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
        animate={{ x: [0, 35, 0], y: [0, -25, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 25, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 p-10">
        <div className="relative h-full w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />

          <div className="relative h-full w-full">
            <svg viewBox="0 0 100 60" className="h-full w-full">
              {links.map(([a, b], idx) => {
                const A = nodes[a];
                const B = nodes[b];
                const d = `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
                return (
                  <motion.path
                    key={idx}
                    d={d}
                    strokeWidth={0.55}
                    strokeLinecap="round"
                    fill="none"
                    className={idx % 2 === 0 ? "stroke-sky-400/55" : "stroke-emerald-400/45"}
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{ pathLength: 1, opacity: [0.25, 0.75, 0.35] }}
                    transition={{
                      duration: 2.6,
                      delay: idx * 0.08,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {nodes.map((n, idx) => (
                <motion.g
                  key={idx}
                  initial={{ opacity: 0.65 }}
                  animate={{ opacity: [0.55, 1, 0.7], scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.2, delay: idx * 0.1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx={n.x} cy={n.y} r={n.r + 2.2} className="fill-sky-500/10" />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    className={idx % 2 === 0 ? "fill-sky-200/80" : "fill-emerald-200/75"}
                  />
                </motion.g>
              ))}
            </svg>

            <div className="absolute left-8 top-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/40 px-4 py-2 text-xs text-white/70">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80" />
                Live Commit Telemetry
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Nodes", value: "8" },
                  { label: "Edges", value: "8" },
                  { label: "Sync", value: "Real-time" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 backdrop-blur"
                  >
                    <div className="text-xs text-white/50">{s.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardGlow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-sky-500/15 via-white/5 to-emerald-500/15 blur-2xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

function ParticipantPanel() {
  const { data: session, status } = useSession();
  const isAuthed = !!session?.user;

  const [submitState, setSubmitState] = React.useState<"idle" | "saving" | "saved">("idle");

  const form = useForm<ParticipantPostOAuthValues>({
    resolver: zodResolver(participantPostOAuthSchema),
    defaultValues: {
      eventCode: "",
      teamName: "",
      teammateGithubUsernames: [],
      repositoryUrl: "",
      primaryTechStack: ["Full Stack"],
      preferredContactEmail: "",
      consentCommitTracking: false,
      consentIpLocation: false,
    },
    mode: "onChange",
  });

  const teammateGithubUsernames = form.watch("teammateGithubUsernames");
  const primaryTechStack = form.watch("primaryTechStack");

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitState("saving");

    // This is intentionally a client-only stub.
    // Wire this to your onboarding API route (e.g., POST /api/onboarding/participant).
    await new Promise((r) => setTimeout(r, 650));
    // eslint-disable-next-line no-console
    console.log("Participant onboarding payload", values);

    setSubmitState("saved");
    setTimeout(() => setSubmitState("idle"), 1600);
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/35 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2">
            <Github className="h-5 w-5 text-white/80" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/90">Strict GitHub OAuth</div>
            <div className="mt-1 text-xs leading-relaxed text-white/55">
              Identity verification is enforced via GitHub sign-in. After OAuth, you’ll complete your team,
              repo, and consent details.
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/auth" })}
            disabled={status === "loading" || isAuthed}
            className={cx(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white",
              "hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
            {isAuthed ? "GitHub verified" : "Sign in with GitHub"}
            <ArrowRight className="h-4 w-4 text-white/60" />
          </button>
          {isAuthed ? (
            <div className="mt-2 text-xs text-emerald-300/80">
              Connected as {(session?.user?.name ?? session?.user?.email ?? "GitHub user").toString()}.
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {isAuthed ? (
          <motion.form
            key="participant-onboarding"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="grid gap-4">
              <div>
                <FieldLabel>Hackathon Invite Code / Event ID</FieldLabel>
                <InputShell icon={<IdCard className="h-4 w-4" />}>
                  <TextInput
                    placeholder="e.g. COMMITLENS-2026-FEB"
                    {...form.register("eventCode")}
                    autoComplete="off"
                  />
                </InputShell>
                <FieldError message={form.formState.errors.eventCode?.message} />
              </div>

              <div>
                <FieldLabel>Team Name</FieldLabel>
                <InputShell icon={<Users className="h-4 w-4" />}>
                  <TextInput placeholder="e.g. Neon Refactor" {...form.register("teamName")} />
                </InputShell>
                <FieldError message={form.formState.errors.teamName?.message} />
              </div>

              <ChipInput
                label="Team Members (GitHub usernames)"
                placeholder="type username + Enter"
                hint="Add teammate GitHub usernames (optional)"
                icon={<AtSign className="h-4 w-4" />}
                value={teammateGithubUsernames}
                onChange={(v) => form.setValue("teammateGithubUsernames", v, { shouldValidate: true })}
                error={form.formState.errors.teammateGithubUsernames?.message as string | undefined}
              />

              <div>
                <FieldLabel>Registered GitHub Repository Link</FieldLabel>
                <InputShell icon={<LinkIcon className="h-4 w-4" />}>
                  <TextInput
                    placeholder="https://github.com/org/repo"
                    {...form.register("repositoryUrl")}
                    inputMode="url"
                    autoComplete="off"
                  />
                </InputShell>
                <FieldError message={form.formState.errors.repositoryUrl?.message} />
                <div className="mt-1 text-xs text-white/45">
                  Must be exactly one repository (no extra path segments).
                </div>
              </div>

              <ChipInput
                label="Primary Tech Stack"
                placeholder="e.g. Next.js"
                hint="Add planned technologies (required)"
                icon={<Tags className="h-4 w-4" />}
                value={primaryTechStack}
                onChange={(v) => form.setValue("primaryTechStack", v, { shouldValidate: true })}
                error={form.formState.errors.primaryTechStack?.message as string | undefined}
              />

              <div>
                <FieldLabel>Preferred Contact Email</FieldLabel>
                <InputShell icon={<Mail className="h-4 w-4" />}>
                  <TextInput
                    placeholder="you@domain.com"
                    {...form.register("preferredContactEmail")}
                    inputMode="email"
                    autoComplete="email"
                  />
                </InputShell>
                <FieldError message={form.formState.errors.preferredContactEmail?.message} />
              </div>

              <CheckboxRow
                checked={form.watch("consentCommitTracking")}
                onChange={(v) => form.setValue("consentCommitTracking", v, { shouldValidate: true })}
                label="I agree to transparency & consent policy for live commit tracking"
                hint="Your repository commits will be monitored for evolution and fairness scoring."
                error={form.formState.errors.consentCommitTracking?.message}
              />

              <CheckboxRow
                checked={form.watch("consentIpLocation")}
                onChange={(v) => form.setValue("consentIpLocation", v, { shouldValidate: true })}
                label="I consent to Location Access via IP tracking for geo-fence verification"
                hint="Used only to validate event eligibility constraints (when applicable)."
                error={form.formState.errors.consentIpLocation?.message}
              />
            </div>

            <button
              type="submit"
              disabled={!form.formState.isValid || submitState === "saving"}
              className={cx(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-sky-500/20 via-white/10 to-emerald-500/20",
                "px-4 py-3 text-sm font-semibold text-white hover:from-sky-500/25 hover:to-emerald-500/25",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {submitState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
              {submitState === "saved" ? "Saved" : "Complete Registration"}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="participant-locked"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55"
          >
            Sign in with GitHub to unlock the participant registration form.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrganizerPanel() {
  const [submitState, setSubmitState] = React.useState<"idle" | "saving" | "saved">("idle");
  const [signinState, setSigninState] = React.useState<"idle" | "signingIn">("idle");
  const [logoFileName, setLogoFileName] = React.useState<string>("");

  const form = useForm<OrganizerValues>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      password: "",
      organizationName: "",
      contactPhoneNumber: "",
      designation: "Lead Organizer",
      organizationLogoUrl: "",
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitState("saving");

    // Client-only stub.
    // Wire to your signup API route (e.g., POST /api/auth/organizer/signup).
    await new Promise((r) => setTimeout(r, 650));
    // eslint-disable-next-line no-console
    console.log("Organizer signup payload", { ...values, logoFileName: logoFileName || undefined });

    setSubmitState("saved");
    setTimeout(() => setSubmitState("idle"), 1600);
  });

  const onSignIn = async () => {
    const { workEmail, password } = form.getValues();
    if (!workEmail || !password) {
      await form.trigger(["workEmail", "password"]);
      return;
    }

    setSigninState("signingIn");
    try {
      await signIn("credentials", {
        email: workEmail,
        password,
        callbackUrl: "/",
      });
    } finally {
      setSigninState("idle");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <FieldLabel>Full Name</FieldLabel>
          <InputShell icon={<IdCard className="h-4 w-4" />}>
            <TextInput placeholder="e.g. Alex Chen" {...form.register("fullName")} autoComplete="name" />
          </InputShell>
          <FieldError message={form.formState.errors.fullName?.message} />
        </div>

        <div>
          <FieldLabel>Work Email</FieldLabel>
          <InputShell icon={<Mail className="h-4 w-4" />}>
            <TextInput
              placeholder="you@org.com"
              {...form.register("workEmail")}
              inputMode="email"
              autoComplete="email"
            />
          </InputShell>
          <FieldError message={form.formState.errors.workEmail?.message} />
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <InputShell icon={<Lock className="h-4 w-4" />}>
            <TextInput
              type="password"
              placeholder="Create a strong password"
              {...form.register("password")}
              autoComplete="new-password"
            />
          </InputShell>
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        <div>
          <FieldLabel>Organization / University</FieldLabel>
          <InputShell icon={<Building2 className="h-4 w-4" />}>
            <TextInput
              placeholder="e.g. CommitLens University"
              {...form.register("organizationName")}
              autoComplete="organization"
            />
          </InputShell>
          <FieldError message={form.formState.errors.organizationName?.message} />
        </div>

        <div>
          <FieldLabel>Contact Phone Number</FieldLabel>
          <InputShell icon={<Phone className="h-4 w-4" />}>
            <TextInput
              placeholder="For system health alerts"
              {...form.register("contactPhoneNumber")}
              inputMode="tel"
              autoComplete="tel"
            />
          </InputShell>
          <FieldError message={form.formState.errors.contactPhoneNumber?.message} />
        </div>

        <div>
          <FieldLabel>Role / Designation</FieldLabel>
          <InputShell icon={<BadgeCheck className="h-4 w-4" />}>
            <SelectInput {...form.register("designation")}>
              <option className="bg-zinc-950" value="Lead Organizer">
                Lead Organizer
              </option>
              <option className="bg-zinc-950" value="Technical Coordinator">
                Technical Coordinator
              </option>
              <option className="bg-zinc-950" value="Operations">
                Operations
              </option>
              <option className="bg-zinc-950" value="Sponsorship">
                Sponsorship
              </option>
              <option className="bg-zinc-950" value="Community">
                Community
              </option>
              <option className="bg-zinc-950" value="Other">
                Other
              </option>
            </SelectInput>
          </InputShell>
          <FieldError message={form.formState.errors.designation?.message} />
        </div>

        <div>
          <FieldLabel>Organization Logo (Optional)</FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputShell icon={<LinkIcon className="h-4 w-4" />}>
              <TextInput
                placeholder="https://..."
                {...form.register("organizationLogoUrl")}
                inputMode="url"
                autoComplete="off"
              />
            </InputShell>

            <div className="relative rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <KeyRound className="h-4 w-4 text-white/40" />
                <span className="font-semibold">Upload</span>
                <span className="text-white/40">(optional)</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFileName(e.target.files?.[0]?.name ?? "")}
                className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/15"
              />
              {logoFileName ? <div className="mt-2 text-xs text-white/55">{logoFileName}</div> : null}
            </div>
          </div>
          <FieldError message={form.formState.errors.organizationLogoUrl?.message} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={!form.formState.isValid || submitState === "saving"}
          className={cx(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-sky-500/20 via-white/10 to-emerald-500/20",
            "px-4 py-3 text-sm font-semibold text-white hover:from-sky-500/25 hover:to-emerald-500/25",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {submitState === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {submitState === "saved" ? "Created" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={onSignIn}
          disabled={signinState === "signingIn"}
          className={cx(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85",
            "hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {signinState === "signingIn" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          Sign in
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950/35 p-4 text-xs text-white/55">
        Sign in uses your Work Email + Password (NextAuth Credentials).
      </div>
    </form>
  );
}

function JudgeMentorPanel() {
  const [mode, setMode] = React.useState<JudgeMentorMode>("Judge");
  const [submitState, setSubmitState] = React.useState<"idle" | "saving" | "saved">("idle");
  const [signinState, setSigninState] = React.useState<"idle" | "signingIn">("idle");

  const form = useForm<JudgeMentorValues>({
    resolver: zodResolver(judgeMentorSchema),
    defaultValues: {
      mode: "Judge",
      fullName: "",
      email: "",
      password: "",
      hackathonAccessToken: "",
      domainExpertise: "Full Stack",
      linkedInOrPortfolioUrl: "",
      availabilityShift: "",
      conflictOfInterestAccepted: false,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    form.setValue("mode", mode, { shouldValidate: true });
    if (mode === "Judge") {
      form.setValue("availabilityShift", "", { shouldValidate: true });
    }
  }, [form, mode]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitState("saving");

    // Client-only stub.
    // Wire to your signup API route (e.g., POST /api/auth/judge-mentor/signup).
    await new Promise((r) => setTimeout(r, 650));
    // eslint-disable-next-line no-console
    console.log("Judge/Mentor signup payload", values);

    setSubmitState("saved");
    setTimeout(() => setSubmitState("idle"), 1600);
  });

  const onSignIn = async () => {
    const { email, password } = form.getValues();
    if (!email || !password) {
      await form.trigger(["email", "password"]);
      return;
    }

    setSigninState("signingIn");
    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
    } finally {
      setSigninState("idle");
    }
  };

  const modeValue = form.watch("mode");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        <FieldLabel>Role Mode</FieldLabel>
        <MiniModeSwitch
          value={mode}
          onChange={(v) => {
            setMode(v);
          }}
        />
        <div className="text-xs text-white/55">
          {mode === "Judge"
            ? "Judges get post-event evaluation access."
            : "Mentors get real-time access to help tickets and inactivity alerts."}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <FieldLabel>Full Name</FieldLabel>
          <InputShell icon={<IdCard className="h-4 w-4" />}>
            <TextInput placeholder="e.g. Priya Singh" {...form.register("fullName")} autoComplete="name" />
          </InputShell>
          <FieldError message={form.formState.errors.fullName?.message} />
        </div>

        <div>
          <FieldLabel>Email</FieldLabel>
          <InputShell icon={<Mail className="h-4 w-4" />}>
            <TextInput placeholder="you@domain.com" {...form.register("email")} inputMode="email" autoComplete="email" />
          </InputShell>
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <InputShell icon={<Lock className="h-4 w-4" />}>
            <TextInput
              type="password"
              placeholder="Create a strong password"
              {...form.register("password")}
              autoComplete="new-password"
            />
          </InputShell>
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        <div>
          <FieldLabel>Hackathon Access Token</FieldLabel>
          <InputShell icon={<KeyRound className="h-4 w-4" />}>
            <TextInput
              placeholder="Token provided by organizers"
              {...form.register("hackathonAccessToken")}
              autoComplete="off"
            />
          </InputShell>
          <FieldError message={form.formState.errors.hackathonAccessToken?.message} />
        </div>

        <div>
          <FieldLabel>Domain Expertise</FieldLabel>
          <InputShell icon={<ShieldAlert className="h-4 w-4" />}>
            <SelectInput {...form.register("domainExpertise")}>
              {[
                "AI/ML",
                "Web3",
                "Full Stack",
                "Frontend",
                "Backend",
                "DevOps",
                "Data Science",
                "Security",
                "Mobile",
                "Design",
                "Other",
              ].map((opt) => (
                <option key={opt} className="bg-zinc-950" value={opt}>
                  {opt}
                </option>
              ))}
            </SelectInput>
          </InputShell>
          <FieldError message={form.formState.errors.domainExpertise?.message} />
        </div>

        <div>
          <FieldLabel>LinkedIn / Portfolio URL</FieldLabel>
          <InputShell icon={<LinkIcon className="h-4 w-4" />}>
            <TextInput
              placeholder="https://linkedin.com/in/..."
              {...form.register("linkedInOrPortfolioUrl")}
              inputMode="url"
              autoComplete="off"
            />
          </InputShell>
          <FieldError message={form.formState.errors.linkedInOrPortfolioUrl?.message} />
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {modeValue === "Mentor" ? (
            <motion.div
              key="availability"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              <FieldLabel>Availability / Shift</FieldLabel>
              <InputShell icon={<AtSign className="h-4 w-4" />}>
                <TextInput
                  placeholder="e.g. 18:00–22:00 IST"
                  {...form.register("availabilityShift")}
                  autoComplete="off"
                />
              </InputShell>
              <FieldError message={form.formState.errors.availabilityShift?.message} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <CheckboxRow
          checked={form.watch("conflictOfInterestAccepted")}
          onChange={(v) => form.setValue("conflictOfInterestAccepted", v, { shouldValidate: true })}
          label="I declare I am not affiliated with participating teams"
          hint="Required for evaluation integrity."
          error={form.formState.errors.conflictOfInterestAccepted?.message}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={!form.formState.isValid || submitState === "saving"}
          className={cx(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500/20 via-white/10 to-sky-500/20",
            "px-4 py-3 text-sm font-semibold text-white hover:from-emerald-500/25 hover:to-sky-500/25",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {submitState === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {submitState === "saved" ? "Created" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={onSignIn}
          disabled={signinState === "signingIn"}
          className={cx(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85",
            "hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {signinState === "signingIn" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          Sign in
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950/35 p-4 text-xs text-white/55">
        Token ties your account to a specific hackathon.
      </div>
    </form>
  );
}

export default function AuthPage() {
  const [tab, setTab] = React.useState<RoleTabKey>("participant");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -right-28 top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
          {/* Left: animated commit/network visualization */}
          <section className="relative hidden w-full flex-1 lg:block">
            <CommitViz />
          </section>

          {/* Right: auth card */}
          <section className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:px-10">
            <div className="w-full max-w-md">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="h-2 w-2 rounded-full bg-sky-400/80" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-tight">CommitLens</div>
                    <div className="mt-0.5 text-xs text-white/55">
                      Cyberpunk developer analytics • glassmorphic auth
                    </div>
                  </div>
                </div>
              </div>

              <CardGlow>
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-white/90">Sign up / Login</div>
                    <PillTabs value={tab} onChange={setTab} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2">
                        <ShieldAlert className="h-5 w-5 text-white/80" />
                      </div>
                      <div className="text-xs leading-relaxed text-white/55">
                        CommitLens uses commit telemetry and rule-linked onboarding to evaluate fairness,
                        compliance, and authentic project evolution.
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {tab === "participant" ? (
                      <motion.div
                        key="participant"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ParticipantPanel />
                      </motion.div>
                    ) : null}

                    {tab === "organizer" ? (
                      <motion.div
                        key="organizer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                      >
                        <OrganizerPanel />
                      </motion.div>
                    ) : null}

                    {tab === "judgeMentor" ? (
                      <motion.div
                        key="judgeMentor"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                      >
                        <JudgeMentorPanel />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl border border-white/10 bg-zinc-950/30 p-2">
                        <Mail className="h-5 w-5 text-white/75" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white/75">Need help?</div>
                        <div className="mt-1 text-xs text-white/55">
                          Organizers can issue tokens/codes. Participants must use GitHub OAuth.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-white/35">
                    <span className="inline-flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Encrypted transport • consent-driven tracking
                    </span>
                  </div>
                </div>
              </CardGlow>

              <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/30 p-4 text-xs text-white/50 lg:hidden">
                <div className="flex items-center gap-2 font-semibold text-white/70">
                  <LinkIcon className="h-4 w-4" />
                  Live data viz
                </div>
                <div className="mt-1 leading-relaxed">
                  Switch to a larger screen to see the full commit network visualization.
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </main>
  );
}
