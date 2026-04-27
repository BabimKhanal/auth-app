// api/assignment/assignment.api.ts
import apiClient from "../client";

export const assignmentApi = {
  getAll: async (filters?: {
    grade?: number | string;
    section?: string;
    subject?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.grade) params.append("grade", String(filters.grade));
    if (filters?.section) params.append("section", filters.section);
    if (filters?.subject) params.append("subject", filters.subject);

    const url = params.toString()
      ? `/assignments?${params.toString()}`
      : "/assignments";
    const response = await apiClient.get(url);
    console.log(response.data, "apires");
    return response.data?.data || response.data;
  },
  getById: (id: string) =>
    apiClient
      .get(`/assignments/${id}/`)
      .then((res) => res.data?.data || res.data),
  create: (data: FormData) =>
    apiClient
      .post("/assignments", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),
  getSubmissions: () =>
    apiClient.get("/submissions").then((res) => res.data?.data || res.data),
  submit: (assignmentId: number, data: FormData) => {
    return apiClient
      .post(`/assignments/${assignmentId}/submissions`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
  getTeacherSubjects: () =>
    apiClient.get("/teachersubjects").then((res) => res.data?.data || res.data),
  getAssignmentSubmissions: (id: number) => {
    return apiClient
      .get(`/assignments/${id}/submissions`)
      .then((res) => res.data?.data || res.data);
  },
  grade: (data: FormData) => {
    return apiClient
      .patch(`/assignments/grade/submit`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};
