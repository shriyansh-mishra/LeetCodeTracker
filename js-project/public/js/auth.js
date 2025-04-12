/**
 * Authentication module for handling login, registration, and session management
 */

// DOM elements
const authButtons = document.getElementById('auth-buttons');
const userDropdown = document.getElementById('user-dropdown');
const usernameDisplay = document.getElementById('username-display');
const dashboardNavItem = document.getElementById('dashboard-nav-item');
const logoutButton = document.getElementById('logout-button');

// Current user state
let currentUser = null;

/**
 * Initialize auth module
 */
function initAuth() {
  // Check current authentication status
  checkAuthStatus();
  
  // Set up logout handler
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
}

/**
 * Check if user is authenticated
 */
async function checkAuthStatus() {
  try {
    const response = await window.api.get('/auth/me');
    
    if (response && response.id) {
      setAuthenticatedState(response);
    } else {
      setUnauthenticatedState();
    }
    
    return !!currentUser;
  } catch (error) {
    console.error('Auth check failed:', error);
    setUnauthenticatedState();
    return false;
  }
}

/**
 * Set UI for authenticated user
 * @param {object} user - User data
 */
function setAuthenticatedState(user) {
  currentUser = user;
  
  if (authButtons) authButtons.style.display = 'none';
  if (userDropdown) {
    userDropdown.style.display = 'block';
    usernameDisplay.textContent = user.username;
  }
  
  if (dashboardNavItem) dashboardNavItem.style.display = 'block';
  
  // Store auth state
  localStorage.setItem('isAuthenticated', 'true');
}

/**
 * Set UI for unauthenticated state
 */
function setUnauthenticatedState() {
  currentUser = null;
  
  if (authButtons) authButtons.style.display = 'flex';
  if (userDropdown) userDropdown.style.display = 'none';
  if (dashboardNavItem) dashboardNavItem.style.display = 'none';
  
  // Clear auth state
  localStorage.removeItem('isAuthenticated');
}

/**
 * Handle login form submission
 * @param {Event} event - Form submission event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('login-error');
  
  // Clear previous errors
  errorElement.style.display = 'none';
  
  try {
    // Disable submit button during login
    const submitButton = document.getElementById('login-submit');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    
    // Send login request
    const response = await window.api.post('/auth/login', { username, password });
    
    // Update UI and redirect
    setAuthenticatedState(response.user);
    window.router.navigate('/dashboard');
  } catch (error) {
    // Show error message
    errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
    errorElement.style.display = 'block';
  } finally {
    // Re-enable submit button
    const submitButton = document.getElementById('login-submit');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Log In';
    }
  }
}

/**
 * Handle registration form submission
 * @param {Event} event - Form submission event
 */
async function handleSignup(event) {
  event.preventDefault();
  
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const errorElement = document.getElementById('signup-error');
  
  // Clear previous errors
  errorElement.style.display = 'none';
  
  try {
    // Disable submit button during signup
    const submitButton = document.getElementById('signup-submit');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';
    
    // Send signup request with just the basic info
    const response = await window.api.post('/auth/register', { 
      username, 
      email, 
      password
    });
    
    // Update UI and redirect
    setAuthenticatedState(response.user);
    window.router.navigate('/dashboard');
  } catch (error) {
    // Show error message
    errorElement.textContent = error.message || 'Registration failed. Please try again.';
    errorElement.style.display = 'block';
  } finally {
    // Re-enable submit button
    const submitButton = document.getElementById('signup-submit');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Create Account';
    }
  }
}

/**
 * Handle user logout
 * @param {Event} event - Click event
 */
async function handleLogout(event) {
  event.preventDefault();
  
  try {
    await window.api.post('/auth/logout', {});
    setUnauthenticatedState();
    window.router.navigate('/');
  } catch (error) {
    console.error('Logout failed:', error);
    // Force logout on client side regardless of server error
    setUnauthenticatedState();
    window.router.navigate('/');
  }
}

/**
 * Set up verification button handlers on signup form
 */
function setupPlatformVerification() {
  const verifyButtons = document.querySelectorAll('.verify-button');
  
  verifyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const platform = button.getAttribute('data-platform');
      const input = document.getElementById(`${platform}-username`);
      const statusElement = document.querySelector(`.${platform}-status`);
      
      if (!input.value) {
        statusElement.textContent = 'Please enter a username.';
        statusElement.className = 'form-text text-danger';
        return;
      }
      
      // Update button state
      button.disabled = true;
      button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
      
      try {
        const exists = await window.api.verifyPlatformUsername(platform, input.value);
        
        if (exists) {
          statusElement.textContent = 'Username verified successfully!';
          statusElement.className = 'form-text text-success';
        } else {
          statusElement.textContent = 'Username not found on platform.';
          statusElement.className = 'form-text text-danger';
        }
      } catch (error) {
        statusElement.textContent = 'Verification failed. Please try again.';
        statusElement.className = 'form-text text-danger';
      } finally {
        // Reset button
        button.disabled = false;
        button.textContent = 'Verify';
      }
    });
  });
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  return !!currentUser;
}

/**
 * Get current user data
 * @returns {object|null} Current user data or null
 */
function getCurrentUser() {
  return currentUser;
}

// Export auth functions
window.auth = {
  init: initAuth,
  checkStatus: checkAuthStatus,
  handleLogin,
  handleSignup,
  handleLogout,
  setupPlatformVerification,
  isAuthenticated,
  getCurrentUser
};