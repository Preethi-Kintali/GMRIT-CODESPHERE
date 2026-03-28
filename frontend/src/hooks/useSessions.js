import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => {
      toast.success("Session created successfully!");
      // Refresh the active sessions list so the new session appears immediately
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create room"),
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

export const useSessionById = (id) => {
  const result = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000, // refetch every 5 seconds to detect session status changes
  });

  return result;
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: (_, variables) => {
      toast.success("Joined session successfully!");
      // Mark the joined session and active list as stale
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: (_, sessionId) => {
      toast.success("Session ended successfully!");
      // Remove from active list and update recent sessions
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["submitFeedback"],
    mutationFn: sessionApi.submitFeedback,
    onSuccess: (_, variables) => {
      toast.success("Feedback submitted!");
      queryClient.invalidateQueries({ queryKey: ["session", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to submit feedback"),
  });

  return result;
};
