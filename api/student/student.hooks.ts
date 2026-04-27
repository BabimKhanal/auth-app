import { useQuery } from "@tanstack/react-query";
import { StudentApi } from "./student.api";

export const useGetStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => StudentApi.getStudents(),
  });
};
