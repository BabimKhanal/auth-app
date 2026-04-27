import { API_URL } from "@/config/api";

const getFullImageUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};

export default getFullImageUrl;
