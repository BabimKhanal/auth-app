const { EXPO_PUBLIC_API_URL } = process.env;

export const API_URL = EXPO_PUBLIC_API_URL || "http://192.168.101.143:8000";

export const getImageUrl = (path: any) => {
  return `${API_URL}${path}`;
};
