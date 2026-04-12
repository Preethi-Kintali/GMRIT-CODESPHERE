import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async ({ id, token }) => {
    const response = await axiosInstance.post(`/sessions/${id}/join?token=${token}`);
    return response.data;
  },
  endSession: async ({ id, finalCode, finalLanguage }) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`, { finalCode, finalLanguage });
    return response.data;
  },
  submitFeedback: async ({ id, rating, notes, recommendation }) => {
    const response = await axiosInstance.post(`/sessions/${id}/feedback`, { rating, notes, recommendation });
    return response.data;
  },
  sendOtp: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/otp/send`);
    return response.data;
  },
  verifyOtp: async ({ id, otp }) => {
    const response = await axiosInstance.post(`/sessions/${id}/otp/verify`, { otp });
    return response.data;
  },
  checkIn: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/check-in`);
    return response.data;
  },
  acceptGuidelines: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/guidelines/accept`);
    return response.data;
  },
  submitCandidateFeedback: async ({ id, rating, notes }) => {
    const response = await axiosInstance.post(`/sessions/${id}/candidate-feedback`, { rating, notes });
    return response.data;
  },
  recordViolation: async ({ id, type, message }) => {
    const response = await axiosInstance.post(`/sessions/${id}/violation`, { type, message });
    return response.data;
  },
  terminateByViolation: async ({ id, reason }) => {
    const response = await axiosInstance.post(`/sessions/${id}/terminate`, { reason });
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};
