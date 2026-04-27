// api/assignment/assignment.hooks.ts
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboard.api";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(),
  });
};
