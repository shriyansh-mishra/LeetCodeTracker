/**
 * Main application entry point
 */

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize the application
 */
function initApp() {
  // Initialize auth module
  window.auth.init();
  
  // Initialize router
  window.router.init();
  
  // Create a placeholder dashboard image for the homepage
  createPlaceholderDashboardImage();
}

/**
 * Create a placeholder dashboard image for the homepage
 * This is just for visual purposes until a real screenshot is available
 */
function createPlaceholderDashboardImage() {
  const dashboardPreviewImg = document.querySelector('img[alt="Dashboard Preview"]');
  
  if (dashboardPreviewImg && !dashboardPreviewImg.getAttribute('src').startsWith('http')) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    // Background color
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 20, canvas.width - 40, 80);
    
    // Sidebar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 120, 200, canvas.height - 140);
    
    // Main content area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(240, 120, canvas.width - 260, 150);
    
    // Chart areas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(240, 290, 340, 180);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(600, 290, 180, 180);
    
    // Add some colored elements for visual interest
    ctx.fillStyle = '#4361ee';
    ctx.fillRect(40, 50, 60, 20);
    
    // Platform list items in sidebar
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(30, 140 + (i * 50), 180, 40);
    }
    
    // Stats in main content
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(250 + (i * 130), 130, 120, 70);
    }
    
    // Chart placeholders
    ctx.fillStyle = '#e9ecef';
    
    // Bar chart (submissions)
    for (let i = 0; i < 10; i++) {
      const height = 20 + Math.random() * 100;
      ctx.fillRect(260 + (i * 30), 450 - height, 20, height);
    }
    
    // Pie chart (languages)
    ctx.beginPath();
    ctx.arc(690, 380, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#4361ee';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(690, 380, 60, 0, Math.PI * 0.7);
    ctx.fillStyle = '#7209b7';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(690, 380, 60, Math.PI * 0.7, Math.PI * 1.3);
    ctx.fillStyle = '#f72585';
    ctx.fill();
    
    // Set the canvas as the image source
    dashboardPreviewImg.src = canvas.toDataURL();
  }
}