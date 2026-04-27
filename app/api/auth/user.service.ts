// src/app/api/auth/user.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../api/client";

export type User = {
  id: number;
  email: string;
  username: string;
  role: "teacher" | "student" | "admin";
  profile_picture: string;
  phone: string;
  address: string;
  gender: string;
  date_of_birth: string;
};

export type LoginResponse = {
  message: string;
  user_id: number;
  role: string;
  user: string;
  profile_picture: string;
  email: string;
  refresh_token: string;
  access_token: string;
};

export type LoginData = {
  email: string;
  password: string;
};

// Login user
export const loginUser = async (
  loginData: LoginData,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      loginData,
    );
    const {
      access_token,
      refresh_token,
      user_id,
      role,
      user: username,
      profile_picture,
      email,
    } = response.data;

    // Store tokens
    await AsyncStorage.setItem("access_token", access_token);
    await AsyncStorage.setItem("refresh_token", refresh_token);

    // Store user data
    const user: User = {
      id: user_id,
      email: email,
      username: username,
      profile_picture: profile_picture,
      role: role as "teacher" | "student" | "admin",
      phone: "",
      address: "",
      gender: "",
      date_of_birth: "",
    };

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("role", role);

    console.log("Login successful:", user);

    return {
      success: true,
      user: user,
    };
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Login failed",
    };
  }
};

// Get current user from storage
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem("user");

    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

// Get user role
export const getUserRole = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("role");
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    return !!token;
  } catch (error) {
    return false;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refresh: refreshToken });
    }
  } catch (error) {
    console.log("Logout API error:", error);
  } finally {
    // Clear storage regardless
    await AsyncStorage.multiRemove([
      "access_token",
      "refresh_token",
      "user",
      "role",
    ]);
  }
};

// Register user
export const registerUser = async (userData: any): Promise<any> => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Registration failed",
    };
  }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await apiClient.post("/auth/token/refresh", {
      refresh: refreshToken,
    });

    const { access } = response.data;
    await AsyncStorage.setItem("access_token", access);
    return access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    await logoutUser();
    return null;
  }
};

export const getProfile = async (): Promise<any | null> => {
  try {
    const response = await apiClient.get("/users/me"); // Note the trailing slash
    if (!response.data) return null;
    return response.data.data;
  } catch (error: any) {
    console.error("Error getting profile:", error.response?.data);
    return null;
  }
};
// app/api/auth/user.service.ts
export const updateProfile = async (
  userId: number,
  formData: FormData,
  isFileUpload: boolean = true,
): Promise<any> => {
  try {
    const config: any = {};

    if (isFileUpload) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await apiClient.patch(
      `/users/${userId}`,
      formData,
      config,
    );

    if (response.data?.success) {
      // Update stored user data
      const updatedUser = response.data.data;
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("role", updatedUser.role);
      return {
        success: true,
        data: updatedUser,
      };
    }
    return {
      success: false,
      error: response.data?.message || "Update failed",
    };
  } catch (error: any) {
    console.error("Update profile error:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || "Update failed",
    };
  }
};
