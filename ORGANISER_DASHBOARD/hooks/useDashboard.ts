"use client";

// ============================================================================
// Custom Hooks - Organizer Dashboard
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import type {
  OrganizerDashboardState,
  RuleConfiguration,
  Toast,
  HackathonStatus,
} from "../types";
import {
  dashboardService,
  mockDashboardState,
} from "../services/mockData";

// ============================================================================
// Dashboard Data Hook
// ============================================================================
export function useDashboardData() {
  const [state, setState] = useState<OrganizerDashboardState>(mockDashboardState);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.fetchDashboardData();
      setState(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    ...state,
    isLoading,
    refetch: fetchData,
  };
}

// ============================================================================
// Configuration Hook
// ============================================================================
export function useConfiguration(initialConfig: RuleConfiguration) {
  const [config, setConfig] = useState<RuleConfiguration>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = useCallback(
    <K extends keyof RuleConfiguration>(key: K, value: RuleConfiguration[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    []
  );

  const updateScoringWeight = useCallback(
    (key: keyof RuleConfiguration["scoringWeightAdjustment"], value: number) => {
      setConfig((prev) => ({
        ...prev,
        scoringWeightAdjustment: {
          ...prev.scoringWeightAdjustment,
          [key]: value,
        },
      }));
      setHasChanges(true);
    },
    []
  );

  const saveConfiguration = useCallback(async () => {
    setIsSaving(true);
    try {
      await dashboardService.updateConfiguration(config);
      setHasChanges(false);
      return true;
    } catch (error) {
      console.error("Failed to save configuration:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const updateHackathonStatus = useCallback(async (status: HackathonStatus) => {
    setIsSaving(true);
    try {
      await dashboardService.updateHackathonStatus(status);
      setConfig((prev) => ({ ...prev, hackathonStatus: status }));
      return true;
    } catch (error) {
      console.error("Failed to update hackathon status:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    config,
    isSaving,
    hasChanges,
    updateConfig,
    updateScoringWeight,
    saveConfiguration,
    updateHackathonStatus,
  };
}

// ============================================================================
// Alerts Hook
// ============================================================================
export function useAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await dashboardService.dismissAlert(alertId);
      setDismissedAlerts((prev) => {
        const updated = new Set(Array.from(prev));
        updated.add(alertId);
        return updated;
      });
      return true;
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
      return false;
    }
  }, []);

  const sendMentor = useCallback(async (teamId: string) => {
    try {
      await dashboardService.sendMentorToTeam(teamId);
      return true;
    } catch (error) {
      console.error("Failed to send mentor:", error);
      return false;
    }
  }, []);

  const isAlertDismissed = useCallback(
    (alertId: string) => dismissedAlerts.has(alertId),
    [dismissedAlerts]
  );

  return {
    dismissAlert,
    sendMentor,
    isAlertDismissed,
    dismissedCount: dismissedAlerts.size,
  };
}

// ============================================================================
// Reports Hook
// ============================================================================
export function useReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const generateReports = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await dashboardService.generateReports();
      setReportUrl(result.url);
      return result.url;
    } catch (error) {
      console.error("Failed to generate reports:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    reportUrl,
    generateReports,
  };
}

// ============================================================================
// Toast Notifications Hook
// ============================================================================
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: Toast["type"], title: string, message: string) => {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ============================================================================
// Animation Variants
// ============================================================================
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};
