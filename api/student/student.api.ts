import apiClient from "../client";

export const StudentApi = {
  async getStudents() {
    const response = await apiClient.get("/students");
    return response.data;
  },
};
