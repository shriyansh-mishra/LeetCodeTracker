const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');
const pgSession = require('connect-pg-simple')(session);

const db = require('./db');
const usersController = require('./controllers/users');
const leetcodeAPI = require('./platforms/leetcode');
const gfgAPI = require('./platforms/geeksforgeeks');
const codeforcesAPI = require('./platforms/codeforces');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new pgSession({
    pool: db.pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'coding-profile-tracker-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // Find user by username
    const user = await usersController.getUserByUsername(username);
    
    if (!user) {
      return done(null, false, { message: 'Incorrect username or password' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect username or password' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersController.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Unauthorized' });
};

// API Routes
// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await usersController.getUserByUsernameOrEmail(username, email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    
    // Create user
    const user = await usersController.createUser({
      username,
      email,
      password,
      fullName: req.body.fullName
    });
    
    // Log in user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after registration' });
      }
      
      return res.status(201).json({ user });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      
      return res.json({ user });
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  
  res.status(401).json({ message: 'Unauthorized' });
});

// Platform verification routes
app.post('/api/verify/leetcode', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    const exists = await leetcodeAPI.checkUsername(username);
    res.json({ exists });
  } catch (error) {
    console.error('LeetCode verification error:', error);
    res.status(500).json({ message: 'Error verifying LeetCode username' });
  }
});

app.post('/api/verify/geeksforgeeks', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    const exists = await gfgAPI.checkUsername(username);
    res.json({ exists });
  } catch (error) {
    console.error('GeeksforGeeks verification error:', error);
    res.status(500).json({ message: 'Error verifying GeeksforGeeks username' });
  }
});

app.post('/api/verify/codeforces', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    const exists = await codeforcesAPI.checkUsername(username);
    res.json({ exists });
  } catch (error) {
    console.error('CodeForces verification error:', error);
    res.status(500).json({ message: 'Error verifying CodeForces username' });
  }
});

// Dashboard route
app.get('/api/dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with platforms
    const user = await usersController.getUserWithPlatforms(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get platform data
    const platformData = [];
    
    for (const platform of user.platforms) {
      // Get platform profile data
      const profile = await usersController.getPlatformProfile(userId, platform.platform_type);
      
      // Get submission stats
      const submissionStats = await usersController.getSubmissionStats(userId, platform.platform_type);
      
      // Get language stats
      const languageStats = await usersController.getLanguageStats(userId, platform.platform_type);
      
      // Get badges
      const badges = await usersController.getBadges(userId, platform.platform_type);
      
      // Get contest history
      const contestHistory = await usersController.getContestHistory(userId, platform.platform_type);
      
      platformData.push({
        platformType: platform.platform_type,
        username: platform.username,
        profile: profile ? {
          totalSolved: profile.total_solved,
          easySolved: profile.easy_solved,
          mediumSolved: profile.medium_solved,
          hardSolved: profile.hard_solved,
          totalSubmissions: profile.total_submissions,
          acceptanceRate: profile.acceptance_rate,
          ranking: profile.ranking,
          contestAttended: profile.contest_attended,
          additionalData: profile.additional_data
        } : null,
        submissionStats: submissionStats.map(stat => ({
          date: new Date(stat.date).toISOString().split('T')[0],
          count: stat.count
        })),
        languageStats: languageStats.map(stat => ({
          language: stat.language,
          count: stat.count,
          percentage: stat.percentage
        })),
        badges: badges.map(badge => ({
          name: badge.name,
          description: badge.description,
          icon: badge.icon
        })),
        contestHistory: contestHistory.map(contest => ({
          contestName: contest.contest_name,
          ranking: contest.ranking,
          score: contest.score,
          date: new Date(contest.date).toISOString().split('T')[0]
        }))
      });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      platforms: user.platforms.map(p => ({
        platformType: p.platform_type,
        username: p.username,
        isActive: p.is_active
      })),
      platformData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Refresh platform data routes
app.post('/api/leetcode/refresh', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get LeetCode platform connection
    const leetcodePlatform = await usersController.getUserPlatform(userId, 'leetcode');
    
    if (!leetcodePlatform) {
      return res.status(404).json({ message: 'LeetCode platform not connected' });
    }
    
    // Update LeetCode data
    await updatePlatformData(userId, 'leetcode', leetcodePlatform.username);
    
    // Get updated platform data
    const profile = await usersController.getPlatformProfile(userId, 'leetcode');
    const submissionStats = await usersController.getSubmissionStats(userId, 'leetcode');
    const languageStats = await usersController.getLanguageStats(userId, 'leetcode');
    const badges = await usersController.getBadges(userId, 'leetcode');
    const contestHistory = await usersController.getContestHistory(userId, 'leetcode');
    
    const platformData = {
      platformType: 'leetcode',
      username: leetcodePlatform.username,
      profile: profile ? {
        totalSolved: profile.total_solved,
        easySolved: profile.easy_solved,
        mediumSolved: profile.medium_solved,
        hardSolved: profile.hard_solved,
        totalSubmissions: profile.total_submissions,
        acceptanceRate: profile.acceptance_rate,
        ranking: profile.ranking,
        contestAttended: profile.contest_attended,
        additionalData: profile.additional_data
      } : null,
      submissionStats: submissionStats.map(stat => ({
        date: new Date(stat.date).toISOString().split('T')[0],
        count: stat.count
      })),
      languageStats: languageStats.map(stat => ({
        language: stat.language,
        count: stat.count,
        percentage: stat.percentage
      })),
      badges: badges.map(badge => ({
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      })),
      contestHistory: contestHistory.map(contest => ({
        contestName: contest.contest_name,
        ranking: contest.ranking,
        score: contest.score,
        date: new Date(contest.date).toISOString().split('T')[0]
      }))
    };
    
    res.json({ platformData });
  } catch (error) {
    console.error('LeetCode refresh error:', error);
    res.status(500).json({ message: 'Error refreshing LeetCode data' });
  }
});

app.post('/api/geeksforgeeks/refresh', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get GeeksforGeeks platform connection
    const gfgPlatform = await usersController.getUserPlatform(userId, 'geeksforgeeks');
    
    if (!gfgPlatform) {
      return res.status(404).json({ message: 'GeeksforGeeks platform not connected' });
    }
    
    // Update GeeksforGeeks data
    await updatePlatformData(userId, 'geeksforgeeks', gfgPlatform.username);
    
    // Get updated platform data
    const profile = await usersController.getPlatformProfile(userId, 'geeksforgeeks');
    const submissionStats = await usersController.getSubmissionStats(userId, 'geeksforgeeks');
    const languageStats = await usersController.getLanguageStats(userId, 'geeksforgeeks');
    const badges = await usersController.getBadges(userId, 'geeksforgeeks');
    const contestHistory = await usersController.getContestHistory(userId, 'geeksforgeeks');
    
    const platformData = {
      platformType: 'geeksforgeeks',
      username: gfgPlatform.username,
      profile: profile ? {
        totalSolved: profile.total_solved,
        totalSubmissions: profile.total_submissions,
        ranking: profile.ranking,
        additionalData: profile.additional_data
      } : null,
      submissionStats: submissionStats.map(stat => ({
        date: new Date(stat.date).toISOString().split('T')[0],
        count: stat.count
      })),
      languageStats: languageStats.map(stat => ({
        language: stat.language,
        count: stat.count,
        percentage: stat.percentage
      })),
      badges: badges.map(badge => ({
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      })),
      contestHistory: contestHistory.map(contest => ({
        contestName: contest.contest_name,
        ranking: contest.ranking,
        score: contest.score,
        date: new Date(contest.date).toISOString().split('T')[0]
      }))
    };
    
    res.json({ platformData });
  } catch (error) {
    console.error('GeeksforGeeks refresh error:', error);
    res.status(500).json({ message: 'Error refreshing GeeksforGeeks data' });
  }
});

app.post('/api/codeforces/refresh', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get CodeForces platform connection
    const codeforcesPlatform = await usersController.getUserPlatform(userId, 'codeforces');
    
    if (!codeforcesPlatform) {
      return res.status(404).json({ message: 'CodeForces platform not connected' });
    }
    
    // Update CodeForces data
    await updatePlatformData(userId, 'codeforces', codeforcesPlatform.username);
    
    // Get updated platform data
    const profile = await usersController.getPlatformProfile(userId, 'codeforces');
    const submissionStats = await usersController.getSubmissionStats(userId, 'codeforces');
    const languageStats = await usersController.getLanguageStats(userId, 'codeforces');
    const badges = await usersController.getBadges(userId, 'codeforces');
    const contestHistory = await usersController.getContestHistory(userId, 'codeforces');
    
    const platformData = {
      platformType: 'codeforces',
      username: codeforcesPlatform.username,
      profile: profile ? {
        totalSolved: profile.total_solved,
        totalSubmissions: profile.total_submissions,
        ranking: profile.ranking,
        additionalData: profile.additional_data
      } : null,
      submissionStats: submissionStats.map(stat => ({
        date: new Date(stat.date).toISOString().split('T')[0],
        count: stat.count
      })),
      languageStats: languageStats.map(stat => ({
        language: stat.language,
        count: stat.count,
        percentage: stat.percentage
      })),
      badges: badges.map(badge => ({
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      })),
      contestHistory: contestHistory.map(contest => ({
        contestName: contest.contest_name,
        ranking: contest.ranking,
        score: contest.score,
        date: new Date(contest.date).toISOString().split('T')[0]
      }))
    };
    
    res.json({ platformData });
  } catch (error) {
    console.error('CodeForces refresh error:', error);
    res.status(500).json({ message: 'Error refreshing CodeForces data' });
  }
});

// Platform management routes
app.post('/api/platforms/add', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { platformType, username } = req.body;
    
    // Validate input
    if (!platformType || !username) {
      return res.status(400).json({ message: 'Platform type and username are required' });
    }
    
    // Check if platform type is valid
    const validPlatforms = ['leetcode', 'geeksforgeeks', 'codeforces'];
    if (!validPlatforms.includes(platformType)) {
      return res.status(400).json({ message: 'Invalid platform type' });
    }
    
    // Check if user already has this platform
    const existingPlatform = await usersController.getUserPlatform(userId, platformType);
    if (existingPlatform) {
      return res.status(400).json({ message: `You have already connected your ${platformType} account` });
    }
    
    // Verify that platform username exists
    let isValid = false;
    switch (platformType) {
      case 'leetcode':
        isValid = await leetcodeAPI.checkUsername(username);
        break;
      case 'geeksforgeeks':
        isValid = await gfgAPI.checkUsername(username);
        break;
      case 'codeforces':
        isValid = await codeforcesAPI.checkUsername(username);
        break;
    }
    
    if (!isValid) {
      return res.status(400).json({ message: `Username "${username}" not found on ${platformType}` });
    }
    
    // Create platform connection
    const platform = await usersController.createUserPlatform({
      userId,
      platformType,
      username,
      isActive: true
    });
    
    // Fetch initial platform data
    await updatePlatformData(userId, platformType, username);
    
    res.status(201).json({ 
      message: 'Platform connected successfully',
      platform 
    });
  } catch (error) {
    console.error('Add platform error:', error);
    res.status(500).json({ message: 'Error connecting platform' });
  }
});

app.post('/api/platforms/delete', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { platformType } = req.body;
    
    // Validate input
    if (!platformType) {
      return res.status(400).json({ message: 'Platform type is required' });
    }
    
    // Check if user has this platform
    const platform = await usersController.getUserPlatform(userId, platformType);
    if (!platform) {
      return res.status(404).json({ message: `Platform ${platformType} not found` });
    }
    
    // Delete platform connections and related data
    await db.withTransaction(async (client) => {
      // Delete platform profile
      await client.query(
        'DELETE FROM platform_profiles WHERE user_id = $1 AND platform_type = $2',
        [userId, platformType]
      );
      
      // Delete submission stats
      await client.query(
        'DELETE FROM submission_stats WHERE user_id = $1 AND platform_type = $2',
        [userId, platformType]
      );
      
      // Delete language stats
      await client.query(
        'DELETE FROM language_stats WHERE user_id = $1 AND platform_type = $2',
        [userId, platformType]
      );
      
      // Delete badges
      await client.query(
        'DELETE FROM badges WHERE user_id = $1 AND platform_type = $2',
        [userId, platformType]
      );
      
      // Delete contest history
      await client.query(
        'DELETE FROM contest_history WHERE user_id = $1 AND platform_type = $2',
        [userId, platformType]
      );
      
      // Delete platform connection
      await client.query(
        'DELETE FROM user_platforms WHERE user_id = $1 AND platform_type = $2',
        [userId, platformType]
      );
    });
    
    res.json({ message: 'Platform disconnected successfully' });
  } catch (error) {
    console.error('Delete platform error:', error);
    res.status(500).json({ message: 'Error disconnecting platform' });
  }
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Helper function to update platform data
async function updatePlatformData(userId, platformType, username) {
  try {
    let platformData;
    
    // Fetch platform data
    switch (platformType) {
      case 'leetcode':
        platformData = await leetcodeAPI.getUserData(username);
        break;
      case 'geeksforgeeks':
        platformData = await gfgAPI.getUserData(username);
        break;
      case 'codeforces':
        platformData = await codeforcesAPI.getUserData(username);
        break;
      default:
        throw new Error(`Unsupported platform type: ${platformType}`);
    }
    
    if (!platformData) {
      throw new Error(`Failed to fetch ${platformType} data for ${username}`);
    }
    
    // Update database with platform data
    await usersController.updatePlatformData(userId, platformType, platformData);
    
    return platformData;
  } catch (error) {
    console.error(`Error updating ${platformType} data:`, error);
    throw error;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing
module.exports = app;