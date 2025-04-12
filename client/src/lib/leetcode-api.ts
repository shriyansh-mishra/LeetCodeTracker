import { apiRequest } from "./queryClient";
import { UserWithStats } from "@shared/types";

// Base URL for the LeetCode external API
const LEETCODE_API_URL = 'https://alfa-leetcode-api.onrender.com';

// Check if a LeetCode username exists
export async function checkLeetCodeUsername(username: string): Promise<boolean> {
  try {
    // Use the alternative API endpoint
    const response = await fetch(`${LEETCODE_API_URL}/user/${username}`);
    
    // Handle rate limiting (429)
    if (response.status === 429) {
      console.warn('Rate limited by LeetCode API. Assuming username is valid for development purposes.');
      return true; // Assume valid for development
    }
    
    // If we get a 200 response, the user exists
    return response.status === 200;
  } catch (error) {
    console.error('Error checking LeetCode username:', error);
    return false;
  }
}
