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
  submitFeedback: async ({ id, data }) => {
    const response = await axiosInstance.post(`/sessions/${id}/feedback`, data);
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};
