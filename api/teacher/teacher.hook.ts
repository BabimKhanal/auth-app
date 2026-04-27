import { useQuery } from "@tanstack/react-query";
import { TeacherApi } from "./teacher.api";

export const useGetTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => TeacherApi.getTeacher(),
  });
};
