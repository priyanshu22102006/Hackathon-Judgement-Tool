"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData, Toast, DetectedFlag } from "../types";
import { dashboardService } from "../services";

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage dashboard data
 */
export function useDashboard(teamId: string): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await dashboardService.getDashboardData(teamId);
    
    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.error || "Failed to fetch data");
    }
    
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface UseFlagsReturn {
  flags: DetectedFlag[];
  setFlags: React.Dispatch<React.SetStateAction<DetectedFlag[]>>;
  submitExplanation: (flagId: number, explanation: string) => Promise<boolean>;
  submitting: boolean;
}

/**
 * Hook to manage flag explanations
 */
export function useFlags(
  initialFlags: DetectedFlag[],
  teamId: string
): UseFlagsReturn {
  const [flags, setFlags] = useState<DetectedFlag[]>(initialFlags);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFlags(initialFlags);
  }, [initialFlags]);

  const submitExplanation = useCallback(
    async (flagId: number, explanation: string): Promise<boolean> => {
      setSubmitting(true);
      
      const response = await dashboardService.submitFlagExplanation(
        teamId,
        flagId,
        explanation
      );
      
      if (response.success) {
        setFlags((prev) =>
          prev.map((f) =>
            f.id === flagId ? { ...f, explained: true, explanation } : f
          )
        );
      }
      
      setSubmitting(false);
      return response.success;
    },
    [teamId]
  );

  return { flags, setFlags, submitExplanation, submitting };
}

interface UseToastsReturn {
  toasts: Toast[];
  addToast: (type: Toast["type"], title: string, message: string) => void;
  removeToast: (id: number) => void;
  clearToasts: () => void;
}

/**
 * Hook to manage toast notifications
 */
export function useToasts(): UseToastsReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: Toast["type"], title: string, message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, title, message }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, removeToast, clearToasts };
}

interface UseTimeRemainingReturn {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

/**
 * Hook to calculate countdown timer
 */
export function useTimeRemaining(endTime: string): UseTimeRemainingReturn {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatted = timeLeft.isExpired
    ? "Expired"
    : `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;

  return { ...timeLeft, formatted };
}

interface UseMentorHelpReturn {
  requestHelp: (message: string) => Promise<boolean>;
  requesting: boolean;
}

/**
 * Hook to manage mentor help requests
 */
export function useMentorHelp(teamId: string): UseMentorHelpReturn {
  const [requesting, setRequesting] = useState(false);

  const requestHelp = useCallback(
    async (message: string): Promise<boolean> => {
      setRequesting(true);
      
      const response = await dashboardService.requestMentorHelp({
        teamId,
        message,
        priority: "medium",
        timestamp: new Date().toISOString(),
      });
      
      setRequesting(false);
      return response.success;
    },
    [teamId]
  );

  return { requestHelp, requesting };
}

/**
 * Hook for real-time updates with polling
 */
export function useRealtimeUpdates(
  teamId: string,
  enabled: boolean = true,
  interval: number = 30000
) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      const response = await dashboardService.getRealtimeCommits(teamId);
      if (response.success) {
        setLastUpdate(new Date());
      }
    };

    const timer = setInterval(poll, interval);
    return () => clearInterval(timer);
  }, [teamId, enabled, interval]);

  return { lastUpdate };
}
