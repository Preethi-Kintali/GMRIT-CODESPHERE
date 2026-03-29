import axiosInstance from "../lib/axios";

export const problemsApi = {
  getPublishedProblems: async () => {
    const response = await axiosInstance.get("/problems");
    return response.data;
  },
  getProblemBySlug: async (slug) => {
    const response = await axiosInstance.get(`/problems/${slug}`);
    return response.data;
  },
  getAdminProblems: async () => {
    const response = await axiosInstance.get("/admin/problems");
    return response.data;
  },
  createProblem: async (data) => {
    const response = await axiosInstance.post("/admin/problems", data);
    return response.data;
  },
  updateProblem: async (id, data) => {
    const response = await axiosInstance.put(`/admin/problems/${id}`, data);
    return response.data;
  }
};
