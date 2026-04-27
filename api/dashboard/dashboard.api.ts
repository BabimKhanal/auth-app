import apiClient from "../client";

export const dashboardApi = {
  get: async () => {
    const response = await apiClient.get("/dashboard");
    return response.data?.data;
  },
};
