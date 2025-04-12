/**
 * API utility functions for making requests to the server
 */

// Base API URL
const API_BASE_URL = '/api';

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Promise that resolves with the response data
 */
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API GET Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @returns {Promise} Promise that resolves with the response data
 */
async function apiPost(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Verify platform username exists
 * @param {string} platform - Platform type
 * @param {string} username - Username to verify
 * @returns {Promise<boolean>} Promise that resolves with verification result
 */
async function verifyPlatformUsername(platform, username) {
  if (!username) return false;
  
  try {
    const response = await apiPost(`/verify/${platform}`, { username });
    return response.exists;
  } catch (error) {
    console.error(`Username verification error (${platform}):`, error);
    return false;
  }
}

/**
 * Add a platform to the user's account
 * @param {string} platformType - Platform type
 * @param {string} username - Platform username
 * @returns {Promise} Promise that resolves when platform is added
 */
async function addPlatform(platformType, username) {
  try {
    return await apiPost('/platforms/add', { platformType, username });
  } catch (error) {
    console.error(`Failed to add platform:`, error);
    throw error;
  }
}

/**
 * Delete a platform from the user's account
 * @param {string} platformType - Platform type
 * @returns {Promise} Promise that resolves when platform is deleted
 */
async function deletePlatform(platformType) {
  try {
    return await apiPost('/platforms/delete', { platformType });
  } catch (error) {
    console.error(`Failed to delete platform:`, error);
    throw error;
  }
}

/**
 * Refresh platform data for current user
 * @param {string} platform - Platform type
 * @returns {Promise} Promise that resolves with the updated data
 */
async function refreshPlatformData(platform) {
  try {
    return await apiPost(`/${platform}/refresh`, {});
  } catch (error) {
    console.error(`Failed to refresh ${platform} data:`, error);
    throw error;
  }
}

/**
 * Get user dashboard data
 * @returns {Promise} Promise that resolves with dashboard data
 */
async function getDashboardData() {
  try {
    return await apiGet('/dashboard');
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    throw error;
  }
}

// Export API functions
window.api = {
  get: apiGet,
  post: apiPost,
  verifyPlatformUsername,
  addPlatform,
  deletePlatform,
  refreshPlatformData,
  getDashboardData
};