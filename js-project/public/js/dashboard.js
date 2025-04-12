/**
 * Dashboard module for managing user's coding platform data
 */

// Current dashboard state
let dashboardData = null;
let currentPlatform = null;
let charts = {};

/**
 * Initialize dashboard
 */
async function initDashboard() {
  try {
    // Fetch dashboard data
    dashboardData = await window.api.getDashboardData();
    
    // Render user information
    renderUserInfo();
    
    // Render platform list
    renderPlatformList();
    
    // Render platform toggle bar
    renderPlatformToggleBar();
    
    // Set up refresh button
    const refreshButton = document.getElementById('refresh-all-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', refreshAllPlatforms);
    }
    
    // Setup add platform button and modal
    setupAddPlatformModal();
    
    // Setup delete platform modal
    setupDeletePlatformModal();
    
    // If user has platforms, select the first one
    if (dashboardData && dashboardData.platformData && dashboardData.platformData.length > 0) {
      selectPlatform(dashboardData.platformData[0].platformType);
    }
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showErrorMessage('Failed to load dashboard data. Please try again later.');
  }
}

/**
 * Setup add platform modal and handlers
 */
function setupAddPlatformModal() {
  const addPlatformButton = document.getElementById('add-platform-button');
  const platformTypeSelect = document.getElementById('platform-type');
  const platformUsernameInput = document.getElementById('platform-username');
  const platformVerifyButton = document.getElementById('platform-verify-button');
  const platformUsernameStatus = document.getElementById('platform-username-status');
  const addPlatformSubmitButton = document.getElementById('add-platform-submit');
  const addPlatformErrorElement = document.getElementById('add-platform-error');
  
  // Initialize modal instance
  const addPlatformModal = new bootstrap.Modal(document.getElementById('add-platform-modal'));
  
  // Check if user has all platforms already
  function updateAvailablePlatforms() {
    if (!dashboardData || !dashboardData.platformData) return;
    
    // Get all platform options
    const options = platformTypeSelect.querySelectorAll('option:not([disabled])');
    
    // Get connected platforms
    const connectedPlatforms = dashboardData.platformData.map(p => p.platformType);
    
    // Enable/disable options based on connected platforms
    options.forEach(option => {
      const platformType = option.value;
      if (connectedPlatforms.includes(platformType)) {
        option.disabled = true;
      } else {
        option.disabled = false;
      }
    });
    
    // Select first available option
    const firstAvailableOption = platformTypeSelect.querySelector('option:not([disabled]):not([selected])');
    if (firstAvailableOption) {
      firstAvailableOption.selected = true;
    }
    
    // Hide add platform button if all platforms are connected
    if (connectedPlatforms.length === options.length) {
      addPlatformButton.style.display = 'none';
    } else {
      addPlatformButton.style.display = 'inline-flex';
    }
  }
  
  // Open add platform modal
  if (addPlatformButton) {
    addPlatformButton.addEventListener('click', () => {
      // Reset form
      platformTypeSelect.value = '';
      platformUsernameInput.value = '';
      platformUsernameStatus.textContent = '';
      platformUsernameStatus.className = 'form-text text-muted';
      addPlatformSubmitButton.disabled = true;
      addPlatformErrorElement.style.display = 'none';
      
      // Update available platforms
      updateAvailablePlatforms();
      
      // Show modal
      addPlatformModal.show();
    });
  }
  
  // Verify platform username
  if (platformVerifyButton) {
    platformVerifyButton.addEventListener('click', async () => {
      const platformType = platformTypeSelect.value;
      const username = platformUsernameInput.value;
      
      if (!platformType || !username) {
        platformUsernameStatus.textContent = 'Please select a platform and enter a username';
        platformUsernameStatus.className = 'form-text text-danger';
        return;
      }
      
      // Update button state
      platformVerifyButton.disabled = true;
      platformVerifyButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
      
      try {
        const exists = await window.api.verifyPlatformUsername(platformType, username);
        
        if (exists) {
          platformUsernameStatus.textContent = 'Username verified successfully!';
          platformUsernameStatus.className = 'form-text text-success';
          addPlatformSubmitButton.disabled = false;
        } else {
          platformUsernameStatus.textContent = 'Username not found on platform.';
          platformUsernameStatus.className = 'form-text text-danger';
          addPlatformSubmitButton.disabled = true;
        }
      } catch (error) {
        platformUsernameStatus.textContent = 'Verification failed. Please try again.';
        platformUsernameStatus.className = 'form-text text-danger';
        addPlatformSubmitButton.disabled = true;
      } finally {
        // Reset button
        platformVerifyButton.disabled = false;
        platformVerifyButton.textContent = 'Verify';
      }
    });
  }
  
  // Add platform
  if (addPlatformSubmitButton) {
    addPlatformSubmitButton.addEventListener('click', async () => {
      const platformType = platformTypeSelect.value;
      const username = platformUsernameInput.value;
      
      // Update button state
      addPlatformSubmitButton.disabled = true;
      addPlatformSubmitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Connecting...';
      
      try {
        await window.api.addPlatform(platformType, username);
        
        // Refresh dashboard data
        dashboardData = await window.api.getDashboardData();
        
        // Update UI
        renderUserInfo();
        renderPlatformList();
        renderPlatformToggleBar();
        
        // Select the new platform
        selectPlatform(platformType);
        
        // Hide modal
        addPlatformModal.hide();
        
        // Show success message
        showSuccessMessage(`${getPlatformName(platformType)} connected successfully!`);
      } catch (error) {
        addPlatformErrorElement.textContent = error.message || `Failed to connect ${getPlatformName(platformType)}. Please try again.`;
        addPlatformErrorElement.style.display = 'block';
      } finally {
        // Reset button
        addPlatformSubmitButton.disabled = false;
        addPlatformSubmitButton.textContent = 'Connect Platform';
      }
    });
  }
}

/**
 * Setup delete platform modal and handlers
 */
function setupDeletePlatformModal() {
  const deleteConfirmButton = document.getElementById('delete-platform-confirm');
  let platformToDelete = null;
  
  // Initialize modal instance
  const deletePlatformModal = new bootstrap.Modal(document.getElementById('delete-platform-modal'));
  
  // Setup platform list delete button handlers
  function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.platform-delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const platformType = button.closest('.list-group-item').getAttribute('data-platform');
        const platformName = getPlatformName(platformType);
        
        // Set platform to delete
        platformToDelete = platformType;
        
        // Update modal content
        document.getElementById('delete-platform-name').textContent = platformName;
        
        // Show modal
        deletePlatformModal.show();
      });
    });
  }
  
  // Initially setup delete buttons
  setupDeleteButtons();
  
  // Setup delete confirm button
  if (deleteConfirmButton) {
    deleteConfirmButton.addEventListener('click', async () => {
      if (!platformToDelete) return;
      
      // Update button state
      deleteConfirmButton.disabled = true;
      deleteConfirmButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Disconnecting...';
      
      try {
        await window.api.deletePlatform(platformToDelete);
        
        // Get updated dashboard data
        dashboardData = await window.api.getDashboardData();
        
        // Hide modal
        deletePlatformModal.hide();
        
        // Update UI
        renderUserInfo();
        renderPlatformList();
        renderPlatformToggleBar();
        
        // If we have platforms, select the first one
        if (dashboardData.platformData && dashboardData.platformData.length > 0) {
          selectPlatform(dashboardData.platformData[0].platformType);
        } else {
          // Hide platform details and show overview
          document.getElementById('platform-details').style.display = 'none';
          document.getElementById('platform-overview').style.display = 'block';
          document.getElementById('platform-toggle-container-row').style.display = 'none';
          currentPlatform = null;
        }
        
        // Re-setup delete buttons
        setupDeleteButtons();
        
        // Show success message
        showSuccessMessage(`Platform disconnected successfully!`);
      } catch (error) {
        console.error('Error deleting platform:', error);
        showErrorMessage('Failed to disconnect platform. Please try again.');
      } finally {
        // Reset button
        deleteConfirmButton.disabled = false;
        deleteConfirmButton.textContent = 'Disconnect Platform';
        platformToDelete = null;
      }
    });
  }
  
  // Export setupDeleteButtons for use after platform list updates
  window.dashboard.setupDeleteButtons = setupDeleteButtons;
}

/**
 * Render user information
 */
function renderUserInfo() {
  if (!dashboardData) return;
  
  // Set username
  const usernameElement = document.getElementById('dashboard-username');
  if (usernameElement) {
    usernameElement.textContent = dashboardData.username;
  }
  
  // Render platform badges
  const platformBadgesContainer = document.getElementById('platform-badges');
  if (platformBadgesContainer) {
    platformBadgesContainer.innerHTML = '';
    
    if (dashboardData.platformData && dashboardData.platformData.length > 0) {
      dashboardData.platformData.forEach(platform => {
        const badge = document.createElement('span');
        badge.className = `platform-badge badge-${platform.platformType}`;
        
        let icon, name;
        switch (platform.platformType) {
          case 'leetcode':
            icon = 'fab fa-java';
            name = 'LeetCode';
            break;
          case 'geeksforgeeks':
            icon = 'fas fa-code';
            name = 'GeeksforGeeks';
            break;
          case 'codeforces':
            icon = 'fas fa-chart-line';
            name = 'CodeForces';
            break;
          default:
            icon = 'fas fa-code';
            name = platform.platformType;
        }
        
        badge.innerHTML = `<i class="${icon} me-1"></i> ${name}`;
        platformBadgesContainer.appendChild(badge);
      });
    }
  }
}

/**
 * Render platform list
 */
function renderPlatformList() {
  if (!dashboardData) return;
  
  const platformList = document.getElementById('platform-list');
  if (!platformList) return;
  
  platformList.innerHTML = '';
  
  if (dashboardData.platformData && dashboardData.platformData.length > 0) {
    dashboardData.platformData.forEach(platform => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex align-items-center';
      listItem.setAttribute('data-platform', platform.platformType);
      
      let icon, name;
      switch (platform.platformType) {
        case 'leetcode':
          icon = 'fab fa-java leetcode-icon';
          name = 'LeetCode';
          break;
        case 'geeksforgeeks':
          icon = 'fas fa-code gfg-icon';
          name = 'GeeksforGeeks';
          break;
        case 'codeforces':
          icon = 'fas fa-chart-line codeforces-icon';
          name = 'CodeForces';
          break;
        default:
          icon = 'fas fa-code';
          name = platform.platformType;
      }
      
      listItem.innerHTML = `
        <i class="${icon} platform-icon me-2"></i>
        <div class="platform-info flex-grow-1">
          <div class="platform-name">${name}</div>
          <div class="platform-username small text-muted">@${platform.username}</div>
        </div>
        <div class="platform-actions d-flex">
          <button class="btn btn-sm btn-outline-secondary me-1 refresh-button" data-platform="${platform.platformType}" title="Refresh">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger platform-delete-button" title="Disconnect">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      // Add click handler
      listItem.addEventListener('click', () => selectPlatform(platform.platformType));
      
      // Add refresh button handler
      const refreshButton = listItem.querySelector('.refresh-button');
      refreshButton.addEventListener('click', (e) => {
        e.stopPropagation();
        refreshPlatform(platform.platformType);
      });
      
      platformList.appendChild(listItem);
    });
    
    // Setup delete buttons
    if (window.dashboard.setupDeleteButtons) {
      window.dashboard.setupDeleteButtons();
    }
  } else {
    platformList.innerHTML = `
      <li class="list-group-item text-center py-4">
        <div class="text-muted">
          <i class="fas fa-plug fa-2x mb-3"></i>
          <p>No platforms connected.</p>
          <button class="btn btn-sm btn-primary" id="connect-first-platform-button">Connect Platform</button>
        </div>
      </li>
    `;
    
    // Add click handler for the connect button
    const connectButton = document.getElementById('connect-first-platform-button');
    if (connectButton) {
      connectButton.addEventListener('click', () => {
        const addPlatformButton = document.getElementById('add-platform-button');
        if (addPlatformButton) {
          addPlatformButton.click();
        }
      });
    }
  }
}

/**
 * Render the platform toggle bar
 */
function renderPlatformToggleBar() {
  if (!dashboardData || !dashboardData.platformData || dashboardData.platformData.length === 0) {
    document.getElementById('platform-toggle-container-row').style.display = 'none';
    return;
  }
  
  const toggleContainer = document.getElementById('platform-toggle-container');
  if (!toggleContainer) return;
  
  // Show toggle container row
  document.getElementById('platform-toggle-container-row').style.display = 'block';
  
  // Clear previous toggles
  toggleContainer.innerHTML = '';
  
  // Create platform toggles
  dashboardData.platformData.forEach(platform => {
    const toggle = document.createElement('button');
    toggle.className = 'platform-toggle';
    toggle.setAttribute('data-platform', platform.platformType);
    
    // If this is the current platform, add active class
    if (currentPlatform === platform.platformType) {
      toggle.classList.add('active', `active-${platform.platformType}`);
    }
    
    let icon, name;
    switch (platform.platformType) {
      case 'leetcode':
        icon = 'fab fa-java';
        name = 'LeetCode';
        break;
      case 'geeksforgeeks':
        icon = 'fas fa-code';
        name = 'GeeksforGeeks';
        break;
      case 'codeforces':
        icon = 'fas fa-chart-line';
        name = 'CodeForces';
        break;
      default:
        icon = 'fas fa-code';
        name = platform.platformType;
    }
    
    // Add total solved badge if available
    let countBadge = '';
    if (platform.profile && platform.profile.totalSolved) {
      countBadge = `<span class="count-badge">${platform.profile.totalSolved}</span>`;
    }
    
    toggle.innerHTML = `
      <i class="${icon} toggle-icon me-2"></i>
      ${name}
      ${countBadge}
    `;
    
    // Add click handler
    toggle.addEventListener('click', () => selectPlatform(platform.platformType));
    
    toggleContainer.appendChild(toggle);
  });
}

/**
 * Select a platform to display with animation
 * @param {string} platformType - Platform type
 * @param {boolean} animate - Whether to animate the transition
 */
function selectPlatform(platformType, animate = true) {
  // If same platform is selected and we're animating, add a bounce effect
  if (currentPlatform === platformType && animate) {
    const platformToggle = document.querySelector(`.platform-toggle[data-platform="${platformType}"]`);
    if (platformToggle) {
      platformToggle.classList.remove('animate-scale-up');
      void platformToggle.offsetWidth; // Trigger reflow
      platformToggle.classList.add('animate-scale-up');
    }
    return; // Don't reload the same platform
  }
  
  // Store previous platform for animation direction
  const previousPlatform = currentPlatform;
  currentPlatform = platformType;
  
  // Update active item in platform list
  const platformItems = document.querySelectorAll('#platform-list .list-group-item');
  platformItems.forEach(item => {
    if (item.getAttribute('data-platform') === platformType) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update active toggle in platform toggle bar
  const platformToggles = document.querySelectorAll('.platform-toggle');
  platformToggles.forEach(toggle => {
    const togglePlatform = toggle.getAttribute('data-platform');
    toggle.classList.remove('active', 'active-leetcode', 'active-geeksforgeeks', 'active-codeforces');
    
    if (togglePlatform === platformType) {
      toggle.classList.add('active', `active-${togglePlatform}`);
    }
  });
  
  // Get platform data
  const platformData = dashboardData.platformData.find(p => p.platformType === platformType);
  
  if (!platformData) {
    console.error(`No data found for platform: ${platformType}`);
    return;
  }
  
  // Show platform detail view (always visible now)
  document.getElementById('platform-overview').style.display = 'none';
  
  const platformDetails = document.getElementById('platform-details');
  
  if (animate) {
    // Determine animation direction for slide
    const platformOrder = ['leetcode', 'geeksforgeeks', 'codeforces'];
    const prevIndex = platformOrder.indexOf(previousPlatform);
    const currIndex = platformOrder.indexOf(platformType);
    
    let animationClass = 'animate-fadein';
    
    if (prevIndex !== -1 && currIndex !== -1) {
      if (currIndex > prevIndex) {
        animationClass = 'animate-slide-right';
      } else {
        animationClass = 'animate-slide-left';
      }
    }
    
    // Animate content transition
    if (platformDetails.style.display === 'block') {
      // If already showing a platform, fade out then in
      platformDetails.classList.add('fade-out');
      
      setTimeout(() => {
        // Render new content
        renderPlatformContent(platformData);
        
        // Remove previous animation classes
        platformDetails.classList.remove('animate-slide-right', 'animate-slide-left', 'animate-fadein', 'fade-out');
        void platformDetails.offsetWidth; // Trigger reflow
        
        // Add new animation class
        platformDetails.classList.add(animationClass, 'fade-in');
      }, 300);
    } else {
      // First time showing
      platformDetails.style.display = 'block';
      renderPlatformContent(platformData);
      platformDetails.classList.add(animationClass);
    }
  } else {
    // No animation, just update content
    platformDetails.style.display = 'block';
    renderPlatformContent(platformData);
  }
}

/**
 * Render all platform content
 * @param {object} platformData - Platform data
 */
function renderPlatformContent(platformData) {
  // Render platform details
  renderPlatformStats(platformData);
  renderSubmissionChart(platformData);
  renderLanguageChart(platformData);
  renderContestHistory(platformData);
  renderDifficultyBreakdown(platformData);
  renderAchievements(platformData);
  
  // Set up refresh submissions button
  const refreshSubmissionsButton = document.getElementById('refresh-submissions-button');
  if (refreshSubmissionsButton) {
    // Remove existing event listeners
    refreshSubmissionsButton.replaceWith(refreshSubmissionsButton.cloneNode(true));
    // Add new event listener
    document.getElementById('refresh-submissions-button').addEventListener('click', 
      () => refreshPlatform(platformData.platformType));
  }
}

/**
 * Render platform statistics
 * @param {object} platformData - Platform data
 */
function renderPlatformStats(platformData) {
  // Set problems solved
  const problemsSolvedElement = document.getElementById('problems-solved');
  if (problemsSolvedElement) {
    problemsSolvedElement.textContent = platformData.profile.totalSolved || 0;
  }
  
  // Set total submissions
  const totalSubmissionsElement = document.getElementById('total-submissions');
  if (totalSubmissionsElement) {
    totalSubmissionsElement.textContent = platformData.profile.totalSubmissions || 0;
  }
  
  // Set user ranking
  const userRankingElement = document.getElementById('user-ranking');
  if (userRankingElement) {
    userRankingElement.textContent = platformData.profile.ranking || '-';
  }
  
  // Set contest count
  const contestCountElement = document.getElementById('contest-count');
  if (contestCountElement) {
    contestCountElement.textContent = platformData.contestHistory ? platformData.contestHistory.length : 0;
  }
}

/**
 * Render submission chart
 * @param {object} platformData - Platform data
 */
function renderSubmissionChart(platformData) {
  const chartElement = document.getElementById('submission-chart');
  if (!chartElement) return;
  
  // Destroy existing chart if any
  if (charts.submissionChart) {
    charts.submissionChart.destroy();
  }
  
  // Prepare data for chart
  const submissionStats = platformData.submissionStats || [];
  const dates = [];
  const counts = [];
  
  // Last 30 days
  for (let i = Math.max(0, submissionStats.length - 30); i < submissionStats.length; i++) {
    const stat = submissionStats[i];
    dates.push(new Date(stat.date).toLocaleDateString());
    counts.push(stat.count);
  }
  
  // Create chart
  const ctx = chartElement.getContext('2d');
  charts.submissionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Submissions',
        data: counts,
        backgroundColor: 'rgba(67, 97, 238, 0.5)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

/**
 * Render language chart
 * @param {object} platformData - Platform data
 */
function renderLanguageChart(platformData) {
  const chartElement = document.getElementById('language-chart');
  if (!chartElement) return;
  
  const languageStats = platformData.languageStats || [];
  
  // If no language stats, show message
  if (languageStats.length === 0) {
    chartElement.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="fas fa-code fa-2x mb-3"></i>
        <p>No language data available</p>
      </div>
    `;
    return;
  }
  
  // Prepare data for chart
  const labels = [];
  const data = [];
  const colors = [
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
    '#4895ef', '#560bad', '#f77f00', '#4cc9f0', '#f72585'
  ];
  
  // Get top 5 languages
  const topLanguages = languageStats.slice(0, 5);
  
  topLanguages.forEach((lang, index) => {
    labels.push(lang.language);
    data.push(lang.count);
  });
  
  // Create chart
  const options = {
    series: data,
    chart: {
      type: 'donut',
      height: 250
    },
    labels: labels,
    colors: colors,
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%'
        }
      }
    }
  };
  
  if (charts.languageChart) {
    charts.languageChart.destroy();
  }
  
  charts.languageChart = new ApexCharts(chartElement, options);
  charts.languageChart.render();
}

/**
 * Render contest history
 * @param {object} platformData - Platform data
 */
function renderContestHistory(platformData) {
  const container = document.getElementById('contest-history');
  if (!container) return;
  
  const contests = platformData.contestHistory || [];
  
  if (contests.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="fas fa-trophy fa-2x mb-3"></i>
        <p>No contest history available</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for contests
  let html = '';
  
  contests.forEach(contest => {
    const date = new Date(contest.date).toLocaleDateString();
    html += `
      <div class="contest-item">
        <div class="contest-name">${contest.contestName}</div>
        <div class="contest-date">${date}</div>
        <div class="contest-stats">
          <div class="contest-rank">Rank: ${contest.ranking}</div>
          <div class="contest-score">Score: ${contest.score}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Render difficulty breakdown
 * @param {object} platformData - Platform data
 */
function renderDifficultyBreakdown(platformData) {
  const container = document.getElementById('difficulty-breakdown');
  if (!container) return;
  
  const profile = platformData.profile || {};
  
  // Only applicable to LeetCode
  if (platformData.platformType !== 'leetcode' || 
      !profile.easySolved || !profile.additionalData) {
    
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="fas fa-chart-pie fa-2x mb-3"></i>
        <p>Difficulty breakdown not available for this platform</p>
      </div>
    `;
    return;
  }
  
  // Get difficulty data
  const easySolved = profile.easySolved || 0;
  const easyTotal = profile.additionalData.easyTotal || 0;
  const easyPercent = easyTotal > 0 ? (easySolved / easyTotal * 100).toFixed(1) : 0;
  
  const mediumSolved = profile.mediumSolved || 0;
  const mediumTotal = profile.additionalData.mediumTotal || 0;
  const mediumPercent = mediumTotal > 0 ? (mediumSolved / mediumTotal * 100).toFixed(1) : 0;
  
  const hardSolved = profile.hardSolved || 0;
  const hardTotal = profile.additionalData.hardTotal || 0;
  const hardPercent = hardTotal > 0 ? (hardSolved / hardTotal * 100).toFixed(1) : 0;
  
  // Create HTML
  container.innerHTML = `
    <div class="row g-3">
      <div class="col-12">
        <div class="difficulty-label">
          <span class="badge bg-success me-2">Easy</span>
          ${easySolved} / ${easyTotal} (${easyPercent}%)
        </div>
        <div class="progress">
          <div class="progress-bar progress-easy" role="progressbar" 
               style="width: ${easyPercent}%" aria-valuenow="${easyPercent}" 
               aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
      
      <div class="col-12">
        <div class="difficulty-label">
          <span class="badge bg-warning me-2">Medium</span>
          ${mediumSolved} / ${mediumTotal} (${mediumPercent}%)
        </div>
        <div class="progress">
          <div class="progress-bar progress-medium" role="progressbar" 
               style="width: ${mediumPercent}%" aria-valuenow="${mediumPercent}" 
               aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
      
      <div class="col-12">
        <div class="difficulty-label">
          <span class="badge bg-danger me-2">Hard</span>
          ${hardSolved} / ${hardTotal} (${hardPercent}%)
        </div>
        <div class="progress">
          <div class="progress-bar progress-hard" role="progressbar" 
               style="width: ${hardPercent}%" aria-valuenow="${hardPercent}" 
               aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render achievements/badges
 * @param {object} platformData - Platform data
 */
function renderAchievements(platformData) {
  const container = document.getElementById('achievements-section');
  if (!container) return;
  
  const badges = platformData.badges || [];
  
  if (badges.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="fas fa-medal fa-2x mb-3"></i>
        <p>No achievements yet</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for badges
  let html = '';
  
  badges.forEach(badge => {
    html += `
      <div class="achievement-badge">
        <div class="badge-icon">
          <i class="fas fa-${badge.icon}"></i>
        </div>
        <div class="badge-content">
          <h5>${badge.name}</h5>
          <p>${badge.description}</p>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Refresh data for a specific platform
 * @param {string} platformType - Platform type
 */
async function refreshPlatform(platformType) {
  try {
    // Show loading indicator for the platform
    const platformItem = document.querySelector(`#platform-list .list-group-item[data-platform="${platformType}"]`);
    const refreshButton = platformItem.querySelector('.refresh-button');
    
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    
    // Refresh platform data
    const result = await window.api.refreshPlatformData(platformType);
    
    // Update dashboard data
    if (result && result.platformData) {
      // Find the platform index
      const platformIndex = dashboardData.platformData.findIndex(p => p.platformType === platformType);
      
      if (platformIndex !== -1) {
        // Update the platform data
        dashboardData.platformData[platformIndex] = result.platformData;
        
        // If this is the currently selected platform, update the view
        if (currentPlatform === platformType) {
          selectPlatform(platformType);
        }
      }
    }
    
    // Reset refresh button
    refreshButton.disabled = false;
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
    
    // Show success message
    showSuccessMessage(`Successfully refreshed ${getPlatformName(platformType)} data!`);
  } catch (error) {
    console.error(`Error refreshing ${platformType} data:`, error);
    showErrorMessage(`Failed to refresh ${getPlatformName(platformType)} data. Please try again.`);
    
    // Reset all refresh buttons
    const refreshButtons = document.querySelectorAll('.refresh-button');
    refreshButtons.forEach(button => {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-sync-alt"></i>';
    });
  }
}

/**
 * Refresh data for all platforms
 */
async function refreshAllPlatforms() {
  // Disable refresh all button
  const refreshAllButton = document.getElementById('refresh-all-button');
  if (refreshAllButton) {
    refreshAllButton.disabled = true;
    refreshAllButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Refreshing...';
  }
  
  try {
    // Refresh each platform
    if (dashboardData && dashboardData.platformData) {
      const promises = dashboardData.platformData.map(platform => 
        refreshPlatform(platform.platformType)
      );
      
      await Promise.all(promises);
    }
    
    // Get fresh dashboard data
    dashboardData = await window.api.getDashboardData();
    
    // Re-render platform list
    renderPlatformList();
    
    // Re-render user info
    renderUserInfo();
    
    // Re-select current platform
    if (currentPlatform) {
      selectPlatform(currentPlatform);
    }
    
    // Show success message
    showSuccessMessage('Successfully refreshed all platform data!');
  } catch (error) {
    console.error('Error refreshing all platforms:', error);
    showErrorMessage('Failed to refresh all platform data. Please try again.');
  } finally {
    // Reset refresh all button
    if (refreshAllButton) {
      refreshAllButton.disabled = false;
      refreshAllButton.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh All Data';
    }
  }
}

/**
 * Get platform name from type
 * @param {string} platformType - Platform type
 * @returns {string} Platform name
 */
function getPlatformName(platformType) {
  switch (platformType) {
    case 'leetcode':
      return 'LeetCode';
    case 'geeksforgeeks':
      return 'GeeksforGeeks';
    case 'codeforces':
      return 'CodeForces';
    default:
      return platformType;
  }
}

/**
 * Show success message
 * @param {string} message - Message text
 */
function showSuccessMessage(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  
  // Show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
  toast.show();
  
  // Remove toast after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

/**
 * Show error message
 * @param {string} message - Message text
 */
function showErrorMessage(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  
  // Show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
  toast.show();
  
  // Remove toast after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Export dashboard functions
window.dashboard = {
  init: initDashboard,
  refresh: refreshAllPlatforms,
  setupDeleteButtons: null // Will be set in setupDeletePlatformModal
};