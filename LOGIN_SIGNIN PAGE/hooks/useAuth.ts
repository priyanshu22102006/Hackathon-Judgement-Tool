import { useState, useCallback } from "react";
import type {
  AuthState,
  UserRole,
  RegistrationState,
  TeamMember,
  Toast,
} from "../types";
import { authService } from "../services";

// ============================================================================
// useAuth - Authentication state management
// ============================================================================
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: false,
    user: null,
    selectedRole: null,
    authMode: "signup",
    error: null,
  });

  const selectRole = useCallback((role: UserRole) => {
    setState((prev) => ({ ...prev, selectedRole: role, error: null }));
  }, []);

  const loginWithGitHub = useCallback(async () => {
    if (!state.selectedRole) {
      setState((prev) => ({ ...prev, error: "Please select a role first" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await authService.loginWithGitHub(state.selectedRole);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoggedIn: true,
        user,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Authentication failed. Please try again.",
      }));
    }
  }, [state.selectedRole]);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await authService.logout();
    setState({
      isLoggedIn: false,
      isLoading: false,
      user: null,
      selectedRole: null,
      authMode: "signup",
      error: null,
    });
  }, []);

  // Mock toggle for testing UI transitions
  const toggleMockAuth = useCallback(() => {
    if (state.isLoggedIn) {
      logout();
    } else if (state.selectedRole) {
      loginWithGitHub();
    }
  }, [state.isLoggedIn, state.selectedRole, loginWithGitHub, logout]);

  return {
    ...state,
    selectRole,
    loginWithGitHub,
    logout,
    toggleMockAuth,
  };
}

// ============================================================================
// useRegistration - Team registration form state
// ============================================================================
export function useRegistration() {
  const [state, setState] = useState<RegistrationState>({
    data: {
      teamName: "",
      githubRepoLink: "",
      teamMembers: [],
      consentAccepted: false,
    },
    isSubmitting: false,
    isValidatingRepo: false,
    isRegistered: false,
    errors: {},
  });

  const updateField = useCallback(
    <K extends keyof RegistrationState["data"]>(
      field: K,
      value: RegistrationState["data"][K]
    ) => {
      setState((prev) => ({
        ...prev,
        data: { ...prev.data, [field]: value },
        errors: { ...prev.errors, [field]: undefined },
      }));
    },
    []
  );

  const addTeamMember = useCallback(() => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      githubUsername: "",
      isValid: false,
      isValidating: false,
    };
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        teamMembers: [...prev.data.teamMembers, newMember],
      },
      errors: { ...prev.errors, teamMembers: undefined },
    }));
  }, []);

  const updateTeamMember = useCallback(
    async (memberId: string, username: string) => {
      // Update username immediately
      setState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          teamMembers: prev.data.teamMembers.map((m) =>
            m.id === memberId
              ? { ...m, githubUsername: username, isValidating: true, profile: undefined }
              : m
          ),
        },
      }));

      // Validate username and fetch profile
      if (username.length >= 3) {
        const [isValid, profile] = await Promise.all([
          authService.validateGitHubUser(username),
          authService.fetchGitHubProfile(username),
        ]);
        setState((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            teamMembers: prev.data.teamMembers.map((m) =>
              m.id === memberId ? { ...m, isValid, isValidating: false, profile: profile || undefined } : m
            ),
          },
        }));
      } else {
        setState((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            teamMembers: prev.data.teamMembers.map((m) =>
              m.id === memberId
                ? { ...m, isValid: false, isValidating: false }
                : m
            ),
          },
        }));
      }
    },
    []
  );

  const removeTeamMember = useCallback((memberId: string) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        teamMembers: prev.data.teamMembers.filter((m) => m.id !== memberId),
      },
    }));
  }, []);

  const validateRepo = useCallback(async () => {
    if (!state.data.githubRepoLink) return false;

    setState((prev) => ({ ...prev, isValidatingRepo: true }));
    const isValid = await authService.validateRepository(
      state.data.githubRepoLink
    );
    setState((prev) => ({
      ...prev,
      isValidatingRepo: false,
      errors: isValid
        ? prev.errors
        : { ...prev.errors, githubRepoLink: "Invalid repository URL" },
    }));
    return isValid;
  }, [state.data.githubRepoLink]);

  const validate = useCallback((): boolean => {
    const errors: RegistrationState["errors"] = {};

    if (!state.data.teamName.trim()) {
      errors.teamName = "Team name is required";
    }

    if (!state.data.githubRepoLink.trim()) {
      errors.githubRepoLink = "Repository link is required";
    } else if (
      !/^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/.test(
        state.data.githubRepoLink
      )
    ) {
      errors.githubRepoLink = "Please enter a valid GitHub repository URL";
    }

    if (state.data.teamMembers.length === 0) {
      errors.teamMembers = "Add at least one team member";
    } else if (state.data.teamMembers.some((m) => !m.isValid)) {
      errors.teamMembers = "All team members must have valid GitHub usernames";
    }

    if (!state.data.consentAccepted) {
      errors.consent = "You must accept the transparency & consent policy";
    }

    setState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.data]);

  const submitRegistration = useCallback(async (): Promise<{ success: boolean; repoUrl?: string }> => {
    if (!validate()) return { success: false };

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const result = await authService.registerTeam(state.data);
      setState((prev) => ({ ...prev, isSubmitting: false, isRegistered: true }));
      return { success: true, repoUrl: result.repoUrl };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        errors: {
          ...prev.errors,
          teamName: error instanceof Error ? error.message : "Registration failed",
        },
      }));
      return { success: false };
    }
  }, [state.data, validate]);

  const reset = useCallback(() => {
    setState({
      data: {
        teamName: "",
        githubRepoLink: "",
        teamMembers: [],
        consentAccepted: false,
      },
      isSubmitting: false,
      isValidatingRepo: false,
      isRegistered: false,
      errors: {},
    });
  }, []);

  return {
    ...state,
    updateField,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    validateRepo,
    validate,
    submitRegistration,
    reset,
  };
}

// ============================================================================
// useToasts - Toast notification state
// ============================================================================
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: Toast["type"], message: string, duration: number = 4000) => {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
