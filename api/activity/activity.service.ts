import apiClient from "../client";

export const getActivity = async () => {
  try {
    const response = await apiClient.get("/activities");

    return response.data;
  } catch (error) {
    console.error("Error getting activities:", error);
    return [];
  }
};
