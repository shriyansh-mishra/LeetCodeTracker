/**
 * Simple client-side router for single-page application
 */

// Content container
const appContent = document.getElementById('app-content');

// Route templates
const templates = {
  home: document.getElementById('home-template'),
  login: document.getElementById('login-template'),
  signup: document.getElementById('signup-template'),
  dashboard: document.getElementById('dashboard-template')
};

// Route configuration
const routes = {
  '/': {
    template: 'home',
    title: 'Home - Coding Profile Tracker',
    init: null
  },
  '/login': {
    template: 'login',
    title: 'Login - Coding Profile Tracker',
    init: function() {
      // Set up login form handler
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', window.auth.handleLogin);
      }
    }
  },
  '/signup': {
    template: 'signup',
    title: 'Sign Up - Coding Profile Tracker',
    init: function() {
      // Set up signup form handler
      const signupForm = document.getElementById('signup-form');
      if (signupForm) {
        signupForm.addEventListener('submit', window.auth.handleSignup);
      }
      
      // Set up platform verification handlers
      window.auth.setupPlatformVerification();
    }
  },
  '/dashboard': {
    template: 'dashboard',
    title: 'Dashboard - Coding Profile Tracker',
    auth: true,
    init: function() {
      // Initialize dashboard
      window.dashboard.init();
    }
  },
  '/404': {
    template: 'home',
    title: 'Page Not Found - Coding Profile Tracker',
    init: function() {
      appContent.innerHTML = `
        <div class="container py-5 text-center">
          <div class="display-1 text-muted mb-4">404</div>
          <h1 class="h2 mb-3">Page not found</h1>
          <p class="h4 text-muted font-weight-normal mb-4">
            The page you are looking for might have been removed or is temporarily unavailable.
          </p>
          <a href="/" class="btn btn-primary">Back to home</a>
        </div>
      `;
    }
  }
};

/**
 * Initialize router
 */
function initRouter() {
  // Handle clicks on links
  document.addEventListener('click', e => {
    // Only handle clicks on internal links
    if (e.target.tagName === 'A' && e.target.href && e.target.href.startsWith(window.location.origin)) {
      const path = new URL(e.target.href).pathname;
      
      // Only handle paths in routes
      if (routes[path] || path === '/') {
        e.preventDefault();
        navigate(path);
      }
    }
  });
  
  // Handle initial route
  handleRoute(window.location.pathname);
  
  // Handle browser navigation
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });
}

/**
 * Navigate to a path
 * @param {string} path - Path to navigate to
 */
function navigate(path) {
  // If we're already on this page, do nothing
  if (window.location.pathname === path) return;
  
  // Update browser history
  window.history.pushState({}, '', path);
  
  // Handle the route
  handleRoute(path);
}

/**
 * Handle a route
 * @param {string} path - Path to handle
 */
async function handleRoute(path) {
  // Default to home for empty path
  if (path === '') path = '/';
  
  // Get route configuration
  const route = routes[path] || routes['/404'];
  
  // Check if route requires authentication
  if (route.auth) {
    const isAuthenticated = await window.auth.checkStatus();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }
  
  // Update page title
  document.title = route.title;
  
  // Render template
  if (route.template && templates[route.template]) {
    appContent.innerHTML = '';
    const content = document.importNode(templates[route.template].content, true);
    appContent.appendChild(content);
  }
  
  // Initialize route
  if (route.init) {
    route.init();
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Export router
window.router = {
  init: initRouter,
  navigate
};