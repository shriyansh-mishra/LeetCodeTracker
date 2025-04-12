const axios = require('axios');

// CodeForces API endpoints
const CF_API_BASE_URL = 'https://codeforces.com/api';

// Function to check if a CodeForces handle exists
async function checkUsername(handle) {
  try {
    const response = await axios.get(`${CF_API_BASE_URL}/user.info`, {
      params: { handles: handle }
    });
    
    return response.data.status === 'OK' && response.data.result.length > 0;
  } catch (error) {
    console.error('Error checking CodeForces handle:', error);
    return false;
  }
}

// Function to fetch user profile data
async function fetchUserProfile(handle) {
  try {
    const response = await axios.get(`${CF_API_BASE_URL}/user.info`, {
      params: { handles: handle }
    });
    
    if (response.data.status !== 'OK' || !response.data.result.length) {
      return null;
    }
    
    const user = response.data.result[0];
    
    return {
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank,
      contribution: user.contribution,
      registrationTimeSeconds: user.registrationTimeSeconds,
      avatar: user.titlePhoto
    };
  } catch (error) {
    console.error('Error fetching CodeForces user profile:', error);
    return null;
  }
}

// Function to fetch user submissions
async function fetchSubmissions(handle) {
  try {
    const response = await axios.get(`${CF_API_BASE_URL}/user.status`, {
      params: { handle, count: 100 } // Limit to last 100 submissions
    });
    
    if (response.data.status !== 'OK') {
      return null;
    }
    
    return response.data.result;
  } catch (error) {
    console.error('Error fetching CodeForces submissions:', error);
    return null;
  }
}

// Function to fetch contest ratings
async function fetchContestRatings(handle) {
  try {
    const response = await axios.get(`${CF_API_BASE_URL}/user.rating`, {
      params: { handle }
    });
    
    if (response.data.status !== 'OK') {
      return null;
    }
    
    return response.data.result;
  } catch (error) {
    console.error('Error fetching CodeForces contest ratings:', error);
    return null;
  }
}

// Function to generate submission stats
async function generateSubmissionStats(handle) {
  try {
    const submissions = await fetchSubmissions(handle);
    if (!submissions) return null;
    
    const totalSubmissions = submissions.length;
    
    // Create a map of dates and counts
    const submissionCountByDate = new Map();
    
    // Process submissions to generate submission dates
    submissions.forEach(sub => {
      const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
      submissionCountByDate.set(date, (submissionCountByDate.get(date) || 0) + 1);
    });
    
    // Generate last 30 days submission data
    const lastSubmissions = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      lastSubmissions.push({
        date: dateString,
        count: submissionCountByDate.get(dateString) || 0
      });
    }
    
    return {
      totalSubmissions,
      submissionStats: lastSubmissions
    };
  } catch (error) {
    console.error('Error generating CodeForces submission stats:', error);
    return null;
  }
}

// Function to generate language stats
async function generateLanguageStats(handle) {
  try {
    const submissions = await fetchSubmissions(handle);
    if (!submissions) return null;
    
    // Count languages
    const languageCounts = {};
    
    submissions.forEach(sub => {
      if (sub.programmingLanguage) {
        languageCounts[sub.programmingLanguage] = (languageCounts[sub.programmingLanguage] || 0) + 1;
      }
    });
    
    // Calculate total
    const totalCount = Object.values(languageCounts).reduce((acc, count) => acc + count, 0);
    
    // Convert to array format
    const languageStats = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: ((count / totalCount) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.count - a.count);
    
    return languageStats;
  } catch (error) {
    console.error('Error generating CodeForces language stats:', error);
    return null;
  }
}

// Function to generate badges based on user data
async function generateBadges(handle) {
  try {
    const profile = await fetchUserProfile(handle);
    if (!profile) return null;
    
    const badges = [];
    
    // Rating-based badges
    if (profile.rating) {
      if (profile.rating >= 2400) {
        badges.push({
          name: "Grandmaster",
          description: "Achieved Grandmaster rating on CodeForces",
          icon: "award"
        });
      } else if (profile.rating >= 2100) {
        badges.push({
          name: "Master",
          description: "Achieved Master rating on CodeForces",
          icon: "star"
        });
      } else if (profile.rating >= 1900) {
        badges.push({
          name: "Candidate Master",
          description: "Achieved Candidate Master rating on CodeForces",
          icon: "star-half"
        });
      } else if (profile.rating >= 1600) {
        badges.push({
          name: "Expert",
          description: "Achieved Expert rating on CodeForces",
          icon: "thumbs-up"
        });
      }
    }
    
    // Contribution-based badge
    if (profile.contribution && profile.contribution > 0) {
      badges.push({
        name: "Contributor",
        description: "Made positive contributions to CodeForces community",
        icon: "users"
      });
    }
    
    // Experience badge
    if (profile.registrationTimeSeconds) {
      const registrationDate = new Date(profile.registrationTimeSeconds * 1000);
      const now = new Date();
      const yearsActive = Math.floor((now - registrationDate) / (365 * 24 * 60 * 60 * 1000));
      
      if (yearsActive >= 3) {
        badges.push({
          name: "Veteran",
          description: `Active on CodeForces for ${yearsActive}+ years`,
          icon: "clock"
        });
      }
    }
    
    // Always provide at least one badge
    if (badges.length === 0) {
      badges.push({
        name: "CodeForces Participant",
        description: "Active participant on CodeForces",
        icon: "code"
      });
    }
    
    return badges;
  } catch (error) {
    console.error('Error generating CodeForces badges:', error);
    return null;
  }
}

// Function to generate contest history
async function generateContestHistory(handle) {
  try {
    const contests = await fetchContestRatings(handle);
    if (!contests) return [];
    
    // Map to our format
    return contests.map(contest => ({
      contestName: contest.contestName,
      ranking: contest.rank.toString(),
      score: contest.newRating - contest.oldRating,
      date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0]
    })).reverse().slice(0, 10); // Last 10 contests
  } catch (error) {
    console.error('Error generating CodeForces contest history:', error);
    return [];
  }
}

// Function to count problems solved (approximation based on submissions)
async function countProblemsSolved(handle) {
  try {
    const submissions = await fetchSubmissions(handle);
    if (!submissions) return 0;
    
    // Count unique problem IDs with verdict OK
    const uniqueSolvedProblems = new Set();
    
    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        uniqueSolvedProblems.add(`${sub.problem.contestId}_${sub.problem.index}`);
      }
    });
    
    return uniqueSolvedProblems.size;
  } catch (error) {
    console.error('Error counting CodeForces problems solved:', error);
    return 0;
  }
}

// Fetch all user data from CodeForces
async function getUserData(handle) {
  try {
    const userProfile = await fetchUserProfile(handle);
    if (!userProfile) return null;
    
    const totalSolved = await countProblemsSolved(handle);
    const submissionData = await generateSubmissionStats(handle);
    const languageStats = await generateLanguageStats(handle);
    const badges = await generateBadges(handle);
    const contests = await generateContestHistory(handle);
    
    return {
      totalSolved,
      totalSubmissions: submissionData?.totalSubmissions || 0,
      ranking: userProfile.rank,
      submissionStats: submissionData?.submissionStats || [],
      languageStats: languageStats || [],
      badges: badges || [],
      contests: contests || [],
      additionalData: {
        rating: userProfile.rating,
        maxRating: userProfile.maxRating,
        rank: userProfile.rank,
        maxRank: userProfile.maxRank,
        contribution: userProfile.contribution,
        avatar: userProfile.avatar
      }
    };
  } catch (error) {
    console.error('Error fetching CodeForces user data:', error);
    return null;
  }
}

module.exports = {
  checkUsername,
  fetchUserProfile,
  fetchSubmissions,
  fetchContestRatings,
  generateSubmissionStats,
  generateLanguageStats,
  generateBadges,
  generateContestHistory,
  countProblemsSolved,
  getUserData
};