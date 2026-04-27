// api/assignment/assignment.hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignmentApi } from "./assignment.api";

export const assignmentKeys = {
  all: ["assignments"] as const,
  detail: (id: string) => ["assignment", id] as const,
  submissions: ["submissions"] as const,
};

// Queries
export const useAssignments = (filters?: {
  grade?: number | string;
  section?: string;
  subject?: string;
}) => {
  const queryKey = filters
    ? [...assignmentKeys.all, filters]
    : assignmentKeys.all;

  return useQuery({
    queryKey,
    queryFn: () => assignmentApi.getAll(filters),
  });
};
export const useAssignment = (id: string) =>
  useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApi.getById(id),
  });
export const useSubmissions = () =>
  useQuery({
    queryKey: assignmentKeys.submissions,
    queryFn: assignmentApi.getSubmissions,
  });

// Mutations
export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignmentApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
};
export const useSubmitAssignment = (assignmentId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => assignmentApi.submit(assignmentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.submissions });
    },
    onError: (err) => {
      console.error("Failed to submit assignment:", err);
    },
  });
};
export const useTeacherSubjects = () =>
  useQuery({
    queryKey: ["teacher-subjects"],
    queryFn: assignmentApi.getTeacherSubjects,
  });

export const useAssignmentSubmissions = (id: number) => {
  return useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: () => assignmentApi.getAssignmentSubmissions(id),
  });
};

export const useGradeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => assignmentApi.grade(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.submissions });
    },
    onError: (err) => {
      console.error("Failed to grade assignment:", err);
    },
  });
};
