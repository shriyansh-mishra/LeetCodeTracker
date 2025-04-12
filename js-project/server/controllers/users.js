const bcrypt = require('bcrypt');
const db = require('../db');

// User operations
async function getUser(id) {
  const { rows } = await db.query(
    'SELECT id, username, email, full_name FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

async function getUserWithPassword(id) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

async function getUserByUsername(username) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return rows[0];
}

async function getUserByEmail(email) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0];
}

async function getUserByUsernameOrEmail(username, email) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );
  return rows[0];
}

async function createUser({ username, email, password, fullName = null }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { rows } = await db.query(
    'INSERT INTO users (username, email, password, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name',
    [username, email, hashedPassword, fullName]
  );
  
  return rows[0];
}

// Platform operations
async function getUserPlatforms(userId) {
  const { rows } = await db.query(
    'SELECT * FROM user_platforms WHERE user_id = $1',
    [userId]
  );
  
  return rows;
}

async function getUserPlatform(userId, platformType) {
  const { rows } = await db.query(
    'SELECT * FROM user_platforms WHERE user_id = $1 AND platform_type = $2',
    [userId, platformType]
  );
  
  return rows[0];
}

async function createUserPlatform({ userId, platformType, username, isActive = true }) {
  const { rows } = await db.query(
    'INSERT INTO user_platforms (user_id, platform_type, username, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, platformType, username, isActive]
  );
  
  return rows[0];
}

async function updateUserPlatform(id, { username, isActive }) {
  const updates = [];
  const values = [id];
  
  if (username !== undefined) {
    updates.push(`username = $${values.length + 1}`);
    values.push(username);
  }
  
  if (isActive !== undefined) {
    updates.push(`is_active = $${values.length + 1}`);
    values.push(isActive);
  }
  
  if (updates.length === 0) {
    return null;
  }
  
  const { rows } = await db.query(
    `UPDATE user_platforms SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  
  return rows[0];
}

// Platform data operations
async function getPlatformProfile(userId, platformType) {
  const { rows } = await db.query(
    'SELECT * FROM platform_profiles WHERE user_id = $1 AND platform_type = $2',
    [userId, platformType]
  );
  
  return rows[0];
}

async function updatePlatformProfile(userId, platformType, profile) {
  // Check if profile exists
  const existingProfile = await getPlatformProfile(userId, platformType);
  
  if (existingProfile) {
    const {
      totalSolved, easySolved, mediumSolved, hardSolved,
      totalSubmissions, acceptanceRate, ranking, contestAttended,
      additionalData
    } = profile;
    
    const { rows } = await db.query(
      `UPDATE platform_profiles SET 
        total_solved = $3, 
        easy_solved = $4, 
        medium_solved = $5, 
        hard_solved = $6, 
        total_submissions = $7, 
        acceptance_rate = $8, 
        ranking = $9, 
        contest_attended = $10, 
        additional_data = $11,
        last_updated = NOW()
       WHERE user_id = $1 AND platform_type = $2
       RETURNING *`,
      [
        userId, platformType, 
        totalSolved, easySolved, mediumSolved, hardSolved,
        totalSubmissions, acceptanceRate, ranking, contestAttended,
        additionalData ? JSON.stringify(additionalData) : null
      ]
    );
    
    return rows[0];
  } else {
    const {
      totalSolved, easySolved, mediumSolved, hardSolved,
      totalSubmissions, acceptanceRate, ranking, contestAttended,
      additionalData
    } = profile;
    
    const { rows } = await db.query(
      `INSERT INTO platform_profiles (
        user_id, platform_type, total_solved, easy_solved, medium_solved,
        hard_solved, total_submissions, acceptance_rate, ranking,
        contest_attended, additional_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId, platformType, 
        totalSolved, easySolved, mediumSolved, hardSolved,
        totalSubmissions, acceptanceRate, ranking, contestAttended,
        additionalData ? JSON.stringify(additionalData) : null
      ]
    );
    
    return rows[0];
  }
}

async function getSubmissionStats(userId, platformType) {
  const { rows } = await db.query(
    'SELECT * FROM submission_stats WHERE user_id = $1 AND platform_type = $2 ORDER BY date',
    [userId, platformType]
  );
  
  return rows;
}

async function updateSubmissionStats(userId, platformType, stats) {
  if (!stats || !stats.length) return [];

  // Use transaction to ensure consistent update
  return db.withTransaction(async (client) => {
    // Clear existing stats for platform
    await client.query(
      'DELETE FROM submission_stats WHERE user_id = $1 AND platform_type = $2',
      [userId, platformType]
    );
    
    // Insert new stats
    const promises = stats.map(stat => {
      return client.query(
        'INSERT INTO submission_stats (user_id, platform_type, date, count) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, platformType, new Date(stat.date), stat.count]
      );
    });
    
    const results = await Promise.all(promises);
    return results.map(result => result.rows[0]);
  });
}

async function getLanguageStats(userId, platformType) {
  const { rows } = await db.query(
    'SELECT * FROM language_stats WHERE user_id = $1 AND platform_type = $2 ORDER BY count DESC',
    [userId, platformType]
  );
  
  return rows;
}

async function updateLanguageStats(userId, platformType, stats) {
  if (!stats || !stats.length) return [];

  // Use transaction to ensure consistent update
  return db.withTransaction(async (client) => {
    // Clear existing stats for platform
    await client.query(
      'DELETE FROM language_stats WHERE user_id = $1 AND platform_type = $2',
      [userId, platformType]
    );
    
    // Insert new stats
    const promises = stats.map(stat => {
      return client.query(
        'INSERT INTO language_stats (user_id, platform_type, language, count, percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, platformType, stat.language, stat.count, stat.percentage]
      );
    });
    
    const results = await Promise.all(promises);
    return results.map(result => result.rows[0]);
  });
}

async function getBadges(userId, platformType) {
  const { rows } = await db.query(
    'SELECT * FROM badges WHERE user_id = $1 AND platform_type = $2',
    [userId, platformType]
  );
  
  return rows;
}

async function updateBadges(userId, platformType, badges) {
  if (!badges || !badges.length) return [];

  // Use transaction to ensure consistent update
  return db.withTransaction(async (client) => {
    // Clear existing badges for platform
    await client.query(
      'DELETE FROM badges WHERE user_id = $1 AND platform_type = $2',
      [userId, platformType]
    );
    
    // Insert new badges
    const promises = badges.map(badge => {
      return client.query(
        'INSERT INTO badges (user_id, platform_type, name, description, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, platformType, badge.name, badge.description, badge.icon]
      );
    });
    
    const results = await Promise.all(promises);
    return results.map(result => result.rows[0]);
  });
}

async function getContestHistory(userId, platformType) {
  const { rows } = await db.query(
    'SELECT * FROM contest_history WHERE user_id = $1 AND platform_type = $2 ORDER BY date DESC',
    [userId, platformType]
  );
  
  return rows;
}

async function updateContestHistory(userId, platformType, contests) {
  if (!contests || !contests.length) return [];

  // Use transaction to ensure consistent update
  return db.withTransaction(async (client) => {
    // Clear existing contests for platform
    await client.query(
      'DELETE FROM contest_history WHERE user_id = $1 AND platform_type = $2',
      [userId, platformType]
    );
    
    // Insert new contests
    const promises = contests.map(contest => {
      return client.query(
        'INSERT INTO contest_history (user_id, platform_type, contest_name, ranking, score, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, platformType, contest.contestName, contest.ranking, contest.score, new Date(contest.date)]
      );
    });
    
    const results = await Promise.all(promises);
    return results.map(result => result.rows[0]);
  });
}

async function updatePlatformData(userId, platformType, data) {
  // Update profile data
  await updatePlatformProfile(userId, platformType, {
    totalSolved: data.totalSolved,
    easySolved: data.easySolved,
    mediumSolved: data.mediumSolved,
    hardSolved: data.hardSolved,
    totalSubmissions: data.totalSubmissions,
    acceptanceRate: data.acceptanceRate,
    ranking: data.ranking,
    contestAttended: data.contests?.length || 0,
    additionalData: data.additionalData
  });

  // Update submission stats
  if (data.submissionStats) {
    await updateSubmissionStats(userId, platformType, data.submissionStats);
  }

  // Update language stats
  if (data.languageStats) {
    await updateLanguageStats(userId, platformType, data.languageStats);
  }

  // Update badges
  if (data.badges) {
    await updateBadges(userId, platformType, data.badges);
  }

  // Update contest history
  if (data.contests) {
    await updateContestHistory(userId, platformType, data.contests);
  }
}

async function getUserWithPlatforms(userId) {
  // Get user
  const user = await getUser(userId);
  if (!user) return null;
  
  // Get platforms
  const platforms = await getUserPlatforms(userId);
  
  return {
    ...user,
    platforms
  };
}

module.exports = {
  getUser,
  getUserWithPassword,
  getUserByUsername,
  getUserByEmail,
  getUserByUsernameOrEmail,
  createUser,
  getUserPlatforms,
  getUserPlatform,
  createUserPlatform,
  updateUserPlatform,
  getPlatformProfile,
  updatePlatformProfile,
  getSubmissionStats,
  updateSubmissionStats,
  getLanguageStats,
  updateLanguageStats,
  getBadges,
  updateBadges,
  getContestHistory,
  updateContestHistory,
  updatePlatformData,
  getUserWithPlatforms
};