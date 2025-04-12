import { apiRequest } from "./queryClient";
import { UserWithStats } from "@shared/types";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

interface UserResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    leetcodeUsername?: string;
  };
}

// Authentication API
export async function loginUser(credentials: LoginCredentials): Promise<UserResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return await response.json();
}

export async function registerUser(credentials: RegisterCredentials): Promise<UserResponse> {
  const response = await apiRequest("POST", "/api/auth/register", credentials);
  return await response.json();
}

export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiRequest("GET", "/api/auth/me");
  return await response.json();
}

// Dashboard API
export async function getDashboardData(): Promise<UserWithStats> {
  const response = await apiRequest("GET", "/api/dashboard");
  return await response.json();
}

// LeetCode API
export async function setLeetCodeUsername(leetcodeUsername: string): Promise<void> {
  const response = await apiRequest("POST", "/api/leetcode/username", { leetcodeUsername });
  const data = await response.json();
  if (!data.success) {
    throw new ApiError(data.error || 'Failed to update LeetCode username', response.status);
  }
}

export async function refreshLeetCodeData(): Promise<UserWithStats> {
  const response = await apiRequest("POST", "/api/leetcode/refresh");
  return await response.json();
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
