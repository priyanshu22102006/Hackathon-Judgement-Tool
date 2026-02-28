"use client";

import React from "react";
import {
  Github,
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  ExternalLink,
  Award,
  Calendar,
  Target,
  Layers,
} from "lucide-react";
import type { BasicInfo, LocationCompliance } from "../../types";
import { GlowingBadge } from "../ui/Cards";

interface HeaderSectionProps {
  basicInfo: BasicInfo;
  locationCompliance: LocationCompliance;
  timeRemaining: string;
}

// Helper to format date/time
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HeaderSection({
  basicInfo,
  locationCompliance,
  timeRemaining,
}: HeaderSectionProps) {
  return (
    <header className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {basicInfo.teamName}
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            {basicInfo.hackathonName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <GlowingBadge variant="default">
            <Clock className="w-4 h-4 mr-2" />
            {timeRemaining}
          </GlowingBadge>

          <a
            href={basicInfo.repoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white hover:border-purple-500 hover:scale-105 transition-all"
          >
            <Github className="w-4 h-4" />
            Repository
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Hackathon Timing & Track Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start Time */}
        <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Start Time</p>
            <p className="text-sm text-white font-medium">{formatDateTime(basicInfo.startTime)}</p>
          </div>
        </div>

        {/* End Time */}
        <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">End Time</p>
            <p className="text-sm text-white font-medium">{formatDateTime(basicInfo.endTime)}</p>
          </div>
        </div>

        {/* Chosen Track */}
        <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-purple-500/30">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Your Track</p>
            <p className="text-sm text-purple-400 font-semibold">{basicInfo.chosenTrack}</p>
          </div>
        </div>

        {/* Available Tracks */}
        <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tracks</p>
            <p className="text-sm text-white font-medium">{basicInfo.tracks.length} tracks available</p>
          </div>
        </div>
      </div>

      {/* All Available Tracks */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500 uppercase tracking-wide">All Tracks:</span>
        {basicInfo.tracks.map((track) => (
          <span
            key={track}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              track === basicInfo.chosenTrack
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                : "bg-gray-800/50 border-gray-600 text-gray-400"
            }`}
          >
            {track}
            {track === basicInfo.chosenTrack && " ✓"}
          </span>
        ))}
      </div>

      {/* Team Members */}
      <div className="mt-6 flex items-center gap-4">
        <Users className="w-5 h-5 text-gray-400" />
        <div className="flex flex-wrap gap-2">
          {basicInfo.teamMembers.map((member) => (
            <span
              key={member}
              className="px-3 py-1 bg-gray-800/50 border border-gray-600 rounded-full text-sm text-gray-300 hover:border-cyan-500 hover:text-cyan-400 hover:scale-105 transition-all cursor-pointer"
            >
              @{member}
            </span>
          ))}
        </div>
      </div>

      {/* Location Compliance */}
      <div className="mt-4 flex items-center gap-4">
        <MapPin
          className={`w-5 h-5 ${
            locationCompliance.isCompliant ? "text-green-400" : "text-yellow-400"
          }`}
        />
        <GlowingBadge
          variant={locationCompliance.isCompliant ? "success" : "warning"}
        >
          {!locationCompliance.isCompliant && (
            <AlertTriangle className="w-4 h-4 mr-1" />
          )}
          {locationCompliance.locationStatus}
        </GlowingBadge>
        <span className="text-gray-500 text-sm">
          {locationCompliance.geoFenceRuleSummary}
        </span>
      </div>
    </header>
  );
}
