"use client";

import React from "react";
import {
  Clock,
  MapPin,
  GitBranch,
  Users,
  FileText,
  AlertTriangle,
  Info,
  Terminal,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface RuleItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function RuleItem({ icon, title, description }: RuleItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface GitCommandProps {
  command: string;
  explanation: string;
}

function GitCommand({ command, explanation }: GitCommandProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Extract just the command part (before any placeholder like <url>)
    const cmdToCopy = command.replace(/<[^>]+>/g, '').trim();
    navigator.clipboard.writeText(cmdToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight placeholders like <url>, <file>, <name>, etc.
  const formatCommand = (cmd: string) => {
    const parts = cmd.split(/(<[^>]+>)/g);
    return parts.map((part, i) => {
      if (part.match(/^<[^>]+>$/)) {
        return (
          <span key={i} className="text-yellow-400 italic">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="group mb-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 font-mono text-sm bg-black/60 rounded-lg px-4 py-2.5 border border-green-500/20 text-green-400 flex items-center justify-between group-hover:border-green-500/50 group-hover:bg-black/80 transition-all duration-200">
          <span className="flex items-center">
            <span className="text-gray-600 mr-2 select-none">$</span>
            <span className="group-hover:text-green-300 transition-colors">
              {formatCommand(command)}
            </span>
          </span>
          <button
            onClick={handleCopy}
            className="ml-3 p-1.5 rounded-md hover:bg-green-500/20 transition-colors flex-shrink-0"
            title="Copy command"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
            )}
          </button>
        </div>
      </div>
      <p className="text-gray-500 text-xs ml-4 mt-1 group-hover:text-gray-400 transition-colors">{explanation}</p>
    </div>
  );
}

export function BeginnerSurvivalGuide() {
  const rules = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Time Matters",
      description:
        "Ensure your code is written inside the official hackathon window. Commits outside the allowed timeframe may be flagged.",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location Check",
      description:
        "Work must be done on-site or within the allowed geo-fence. The system monitors your location to ensure compliance.",
    },
    {
      icon: <GitBranch className="w-5 h-5" />,
      title: "Start Fresh",
      description:
        "Avoid using pre-built code. The system actively checks the repository creation date, your first commit size, and your overall commit frequency.",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Share the Work",
      description:
        "Contribute fairly! The system monitors lines changed and active hours per team member to calculate a fairness score.",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Explain the Gaps",
      description:
        "If you are brainstorming or designing away from the keyboard, use the explanation option to log your offline work.",
    },
  ];

  const gitCommands = [
    {
      command: 'git config --global user.name "Name"',
      explanation: "Sets the name that will be attached to your commits.",
    },
    {
      command: 'git config --global user.email "email"',
      explanation: "Sets the email address for your commits.",
    },
    {
      command: "git init",
      explanation: "Initializes a new local Git repository in your current folder.",
    },
    {
      command: "git clone <url>",
      explanation: "Copies an existing repository from GitHub to your local drive.",
    },
    {
      command: "git status",
      explanation: "Shows which files are modified, staged, or untracked.",
    },
    {
      command: "git add <file>",
      explanation: "Adds a specific file to the staging area.",
    },
    {
      command: 'git commit -m "message"',
      explanation: "Saves your staged changes as a permanent snapshot in history.",
    },
    {
      command: "git branch",
      explanation: "Lists all local branches; the current one is marked with an asterisk (*).",
    },
    {
      command: "git checkout -b <name>",
      explanation: "Creates a new branch and switches to it immediately.",
    },
    {
      command: "git switch <name>",
      explanation: "A newer, preferred command for switching between existing branches.",
    },
    {
      command: "git merge <branch>",
      explanation: "Integrates changes from the specified branch into your current one.",
    },
    {
      command: "git branch -d <name>",
      explanation: "Deletes a branch that has already been merged.",
    },
    {
      command: "git remote add origin <url>",
      explanation: "Connects your local repository to a specific GitHub URL.",
    },
    {
      command: "git push origin <branch>",
      explanation: "Uploads your local commits to the GitHub repository.",
    },
    {
      command: "git fetch",
      explanation: "Downloads updates from GitHub but does not merge them into your code.",
    },
    {
      command: "git pull",
      explanation: "Downloads and automatically merges updates from GitHub into your current branch.",
    },
    {
      command: "git log",
      explanation: "Displays a chronological list of all commits in the current branch.",
    },
    {
      command: "git diff",
      explanation: "Shows the line-by-line differences between your current files and the last commit.",
    },
    {
      command: "git stash",
      explanation: "Temporarily 'hides' your uncommitted changes so you can switch branches with a clean workspace.",
    },
    {
      command: "git stash pop",
      explanation: "Brings your stashed changes back into your workspace.",
    },
    {
      command: "git reset --hard <commit>",
      explanation: "Forcefully reverts your entire project to a specific commit, deleting all changes made after it.",
    },
    {
      command: "git stash list",
      explanation: "Shows a list of stashed changes.",
    },
    {
      command: "git stash apply",
      explanation: "Applies the most recent stash.",
    },
    {
      command: "git stash drop",
      explanation: "Deletes the most recent stash.",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Hackathon Rules */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hackathon Rules</h3>
                <p className="text-blue-400 text-sm">How to Avoid Getting Flagged</p>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="p-4 space-y-3">
            {rules.map((rule) => (
              <RuleItem
                key={rule.title}
                icon={rule.icon}
                title={rule.title}
                description={rule.description}
              />
            ))}

            {/* Info Note */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mt-4">
              <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-cyan-300 text-xs">
                These rules help maintain fairness and integrity during the hackathon.
                Following them ensures a smooth experience for everyone!
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Git Commands */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header - Terminal Style */}
          <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex items-center gap-2 ml-4">
                <Terminal className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 font-mono text-sm">
                  Essential Git Commands
                </span>
                <span className="ml-auto text-xs text-gray-500 font-mono">
                  {gitCommands.length} commands
                </span>
              </div>
            </div>
          </div>

          {/* Git Commands - Scrollable */}
          <div 
            className="p-6 bg-gray-950/60 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#22c55e30 transparent',
            }}
          >
            <p className="text-gray-400 text-sm mb-5">
              Master these commands to maintain a healthy commit timeline:
            </p>

            <div className="space-y-1">
              {gitCommands.map((cmd) => (
                <GitCommand
                  key={cmd.command}
                  command={cmd.command}
                  explanation={cmd.explanation}
                />
              ))}
            </div>

            {/* Pro Tip */}
            <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 text-sm font-semibold">💡 Pro Tip:</span>
                <p className="text-purple-300 text-xs">
                  Commit frequently with descriptive messages. Small, regular commits
                  show continuous progress and help avoid inactivity flags!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
