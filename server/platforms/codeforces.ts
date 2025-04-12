import axios from 'axios';
import {
  CodeForcesUserProfile,
  SubmissionStats,
  LanguageStat,
  Badge,
  ContestInfo,
  PlatformData
} from '@shared/types';
import { PLATFORM_TYPES } from '@shared/schema';

// Base URL for CodeForces API
const CF_API_BASE_URL = 'https://codeforces.com/api';

// Function to fetch a CodeForces user profile
export async function fetchCodeForcesUserProfile(handle: string): Promise<CodeForcesUserProfile | null> {
  try {
    // Get user info
    const userResponse = await axios.get(`${CF_API_BASE_URL}/user.info`, {
      params: { handles: handle }
    });
    
    if (userResponse.data.status !== 'OK' || !userResponse.data.result.length) {
      return null;
    }
    
    const user = userResponse.data.result[0];
    
    return {
      platformType: 'codeforces',
      username: user.handle,
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank,
      contribution: user.contribution
    };
  } catch (error) {
    console.error('Error fetching CodeForces user profile:', error);
    return null;
  }
}

// Function to fetch submission stats
export async function fetchSubmissionStats(handle: string): Promise<SubmissionStats | null> {
  try {
    // Get user submissions
    const submissionsResponse = await axios.get(`${CF_API_BASE_URL}/user.status`, {
      params: { handle: handle, count: 100 } // Limit to last 100 submissions
    });
    
    if (submissionsResponse.data.status !== 'OK') {
      return null;
    }
    
    const submissions = submissionsResponse.data.result;
    const totalSubmissions = submissions.length;
    
    // Create a map of dates and counts
    const submissionCountByDate = new Map<string, number>();
    
    // Process submissions to generate submission dates
    submissions.forEach((sub: any) => {
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
      lastSubmissions
    };
  } catch (error) {
    console.error('Error fetching CodeForces submission stats:', error);
    return null;
  }
}

// Function to fetch language stats
export async function fetchLanguageStats(handle: string): Promise<LanguageStat[] | null> {
  try {
    // Get user submissions to analyze languages
    const submissionsResponse = await axios.get(`${CF_API_BASE_URL}/user.status`, {
      params: { handle: handle, count: 500 } // Use more submissions for better language stats
    });
    
    if (submissionsResponse.data.status !== 'OK') {
      return null;
    }
    
    const submissions = submissionsResponse.data.result;
    
    // Count languages
    const languageCounts: Record<string, number> = {};
    
    submissions.forEach((sub: any) => {
      if (sub.programmingLanguage) {
        languageCounts[sub.programmingLanguage] = (languageCounts[sub.programmingLanguage] || 0) + 1;
      }
    });
    
    // Calculate total
    const totalCount = Object.values(languageCounts).reduce((acc: number, count: number) => acc + count, 0);
    
    // Convert to LanguageStat[]
    const languageStats: LanguageStat[] = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: ((count / totalCount) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.count - a.count);
    
    return languageStats;
  } catch (error) {
    console.error('Error fetching CodeForces language stats:', error);
    return null;
  }
}

// Function to fetch contest history
export async function fetchContestHistory(handle: string): Promise<ContestInfo[] | null> {
  try {
    // Get contest ratings
    const ratingResponse = await axios.get(`${CF_API_BASE_URL}/user.rating`, {
      params: { handle: handle }
    });
    
    if (ratingResponse.data.status !== 'OK') {
      return null;
    }
    
    const contestHistory: ContestInfo[] = ratingResponse.data.result.map((contest: any) => ({
      contestName: contest.contestName,
      ranking: contest.rank.toString(),
      score: contest.newRating - contest.oldRating,
      date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0],
      platformType: 'codeforces'
    })).reverse().slice(0, 10); // Last 10 contests
    
    return contestHistory;
  } catch (error) {
    console.error('Error fetching CodeForces contest history:', error);
    return null;
  }
}

// Function to generate badges based on CodeForces stats
export async function generateBadges(handle: string): Promise<Badge[] | null> {
  try {
    const profile = await fetchCodeForcesUserProfile(handle);
    if (!profile) return null;
    
    const badges: Badge[] = [];
    
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

// Function to fetch all CodeForces data for a user
export async function fetchAllCodeForcesData(handle: string): Promise<PlatformData | null> {
  try {
    const profile = await fetchCodeForcesUserProfile(handle);
    if (!profile) return null;
    
    const submissionStats = await fetchSubmissionStats(handle);
    const languageStats = await fetchLanguageStats(handle) || [];
    const contestHistory = await fetchContestHistory(handle) || [];
    const badges = await generateBadges(handle) || [];
    
    return {
      platformType: 'codeforces',
      username: profile.handle,
      profile: {
        totalSubmissions: submissionStats?.totalSubmissions,
        ranking: profile.rank,
        contestAttended: contestHistory.length,
        additionalData: {
          rating: profile.rating,
          maxRating: profile.maxRating,
          maxRank: profile.maxRank,
          contribution: profile.contribution
        }
      },
      submissionStats: submissionStats?.lastSubmissions || [],
      languageStats,
      badges,
      contestHistory
    };
  } catch (error) {
    console.error('Error fetching all CodeForces data:', error);
    return null;
  }
}

// Function to check if a CodeForces handle exists
export async function checkCodeForcesUsername(handle: string): Promise<boolean> {
  try {
    const profile = await fetchCodeForcesUserProfile(handle);
    return profile !== null;
  } catch (error) {
    console.error('Error checking CodeForces handle:', error);
    return false;
  }
}