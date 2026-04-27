import apiClient from "../client";

export const TeacherApi = {
  async getTeacher() {
    const response = await apiClient.get("/teachers");
    return response.data;
  },
};
