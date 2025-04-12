import axios from 'axios';
import {
  LeetCodeUserProfile,
  LeetCodeSubmissionStats,
  LeetCodeLanguageStat,
  LeetCodeBadge,
  LeetCodeContest
} from '@shared/types';

// Base URL for LeetCode GraphQL API
const LEETCODE_API_URL = 'https://leetcode.com/graphql';

// GraphQL query to fetch user profile data
const GET_USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
        reputation
        starRating
        userAvatar
      }
      submissionCalendar
    }
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

// Query to get language stats
const GET_LANGUAGE_STATS_QUERY = `
  query languageStats($username: String!) {
    matchedUser(username: $username) {
      languageProblemCount {
        languageName
        problemsSolved
      }
    }
  }
`;

// Function to fetch user profile from LeetCode
export async function fetchLeetCodeUserProfile(username: string): Promise<LeetCodeUserProfile | null> {
  try {
    console.log(`Fetching LeetCode profile for username: ${username}`);
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
        query: GET_USER_PROFILE_QUERY,
        variables: { username }
      }),
    });

    console.log(`LeetCode API response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.error("LeetCode API rate limit reached");
        throw new Error("LeetCode API rate limit reached. Please try again later.");
      }
      console.error(`LeetCode API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch LeetCode profile: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("LeetCode API response data:", JSON.stringify(data, null, 2));
    
    if (data.errors) {
      console.error("LeetCode GraphQL errors:", data.errors);
      throw new Error("Failed to fetch LeetCode profile: GraphQL errors");
    }

    if (!data.data || !data.data.matchedUser) {
      console.log(`No LeetCode user found with username: ${username}`);
      return null;
    }

    const { matchedUser } = data.data;
    const { submitStats, profile } = matchedUser;
    
    if (!submitStats || !submitStats.acSubmissionNum || !submitStats.totalSubmissionNum) {
      console.error("Invalid LeetCode profile data structure:", matchedUser);
      throw new Error("Invalid LeetCode profile data structure");
    }
    
    // Calculate acceptance rate
    const totalSubmissions = submitStats.totalSubmissionNum[0]?.submissions || 0;
    const totalAccepted = submitStats.acSubmissionNum[0]?.submissions || 0;
    const acceptanceRate = totalSubmissions > 0 
      ? ((totalAccepted / totalSubmissions) * 100).toFixed(1) + '%'
      : '0%';

    return {
      username: matchedUser.username,
      totalSolved: submitStats.acSubmissionNum[0]?.count || 0,
      easySolved: submitStats.acSubmissionNum[1]?.count || 0,
      mediumSolved: submitStats.acSubmissionNum[2]?.count || 0,
      hardSolved: submitStats.acSubmissionNum[3]?.count || 0,
      acceptanceRate,
      ranking: profile?.ranking?.toString() || '0',
      reputation: profile?.reputation || 0,
      starRating: profile?.starRating || 0,
      userAvatar: profile?.userAvatar || '',
      submissionCalendar: matchedUser.submissionCalendar || ''
    };
  } catch (error) {
    console.error("Error fetching LeetCode profile:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch LeetCode profile");
  }
}

// Function to get submission stats
export async function fetchSubmissionStats(username: string): Promise<LeetCodeSubmissionStats | null> {
  try {
    const userProfile = await fetchLeetCodeUserProfile(username);
    if (!userProfile) return null;
    
    const calendar = userProfile.submissionCalendar;
    if (!calendar || typeof calendar !== 'object') {
      console.error("Invalid submission calendar data");
      return {
        totalSubmissions: 0,
        lastSubmissions: []
      };
    }

    // Safely convert calendar values to numbers
    const totalSubmissions = Object.values(calendar).reduce((acc: number, val: unknown) => {
      const numVal = typeof val === 'string' ? parseInt(val, 10) : Number(val);
      return acc + (isNaN(numVal) ? 0 : numVal);
    }, 0);
    
    // Get last 30 days of submissions
    const today = new Date();
    const lastSubmissions = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const timestamp = Math.floor(date.getTime() / 1000).toString();
      
      // Find the closest timestamp in the calendar
      const closestTimestamp = Object.keys(calendar).find(ts => {
        const tsDate = new Date(parseInt(ts) * 1000);
        return tsDate.toDateString() === date.toDateString();
      });
      
      const submissionCount = closestTimestamp ? 
        (typeof calendar[closestTimestamp] === 'string' ? 
          parseInt(calendar[closestTimestamp] as string, 10) : 
          Number(calendar[closestTimestamp])) : 0;
      
      lastSubmissions.push({
        date: date.toISOString().split('T')[0],
        count: isNaN(submissionCount) ? 0 : submissionCount
      });
    }
    
    return {
      totalSubmissions: totalSubmissions || 0,
      lastSubmissions
    };
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    return null;
  }
}

// Function to fetch language stats
export async function fetchLanguageStats(username: string): Promise<LeetCodeLanguageStat[] | null> {
  try {
    const response = await axios.post(LEETCODE_API_URL, {
      query: GET_LANGUAGE_STATS_QUERY,
      variables: { username }
    });

    const data = response.data.data;
    
    if (!data.matchedUser) {
      return null;
    }

    const { languageProblemCount } = data.matchedUser;
    
    // Calculate total problems solved
    const totalSolved = languageProblemCount.reduce(
      (acc: number, curr: any) => acc + curr.problemsSolved, 
      0
    );
    
    // Map to our required format with percentages
    const languageStats: LeetCodeLanguageStat[] = languageProblemCount
      .filter((lang: any) => lang.problemsSolved > 0)
      .map((lang: any) => ({
        language: lang.languageName,
        count: lang.problemsSolved,
        percentage: ((lang.problemsSolved / totalSolved) * 100).toFixed(1) + '%'
      }))
      .sort((a: LeetCodeLanguageStat, b: LeetCodeLanguageStat) => b.count - a.count);
    
    return languageStats;
  } catch (error) {
    console.error('Error fetching language stats:', error);
    return null;
  }
}

// Since LeetCode API doesn't provide direct badge information, we'll generate some based on user stats
export async function generateBadges(username: string): Promise<LeetCodeBadge[] | null> {
  try {
    const userProfile = await fetchLeetCodeUserProfile(username);
    if (!userProfile) return null;
    
    const badges: LeetCodeBadge[] = [];
    
    // Badge for total problems solved
    if (userProfile.totalSolved >= 100) {
      badges.push({
        name: "Century Club",
        description: "Solved 100+ problems",
        icon: "trophy"
      });
    }
    
    // Badge for hard problems
    if (userProfile.hardSolved >= 20) {
      badges.push({
        name: "Hard Hitter",
        description: "Solved 20+ hard problems",
        icon: "zap"
      });
    }
    
    // Badge for consistency (based on submission calendar)
    const calendar = userProfile.submissionCalendar;
    const daysWithSubmissions = Object.keys(calendar).length;
    
    if (daysWithSubmissions >= 30) {
      badges.push({
        name: "Consistent Coder",
        description: "Coded on 30+ different days",
        icon: "calendar"
      });
    }
    
    // Badge for balanced solving (if solved problems in all difficulties)
    if (userProfile.easySolved > 0 && userProfile.mediumSolved > 0 && userProfile.hardSolved > 0) {
      badges.push({
        name: "Balanced Solver",
        description: "Solved problems of all difficulties",
        icon: "scale"
      });
    }
    
    // Badge for good acceptance rate
    const acceptanceRate = parseFloat(userProfile.acceptanceRate);
    if (acceptanceRate > 60) {
      badges.push({
        name: "Efficient Coder",
        description: "Maintained over 60% acceptance rate",
        icon: "check-circle"
      });
    }
    
    // Always provide at least one badge
    if (badges.length === 0) {
      badges.push({
        name: "LeetCode Beginner",
        description: "Started the LeetCode journey",
        icon: "code"
      });
    }
    
    return badges;
  } catch (error) {
    console.error('Error generating badges:', error);
    return null;
  }
}

// Fetch actual contest history from LeetCode
export async function fetchLeetCodeContestHistory(username: string): Promise<LeetCodeContest[] | null> {
  try {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          trendDirection
          problemsSolved
          totalProblems
          finishTimeInSeconds
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }
    `;

    const response = await fetch(LEETCODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();
    
    if (!data.data?.userContestRankingHistory) {
      return null;
    }

    const contests = data.data.userContestRankingHistory
      .filter((contest: any) => contest.attended)
      .map((contest: any) => ({
        contestName: contest.contest.title,
        ranking: `${contest.ranking} / ${data.data.userContestRanking?.totalParticipants || '?'}`,
        score: contest.problemsSolved,
        date: new Date(contest.contest.startTime * 1000).toISOString().split('T')[0],
        rating: contest.rating,
        problemsSolved: contest.problemsSolved,
        totalProblems: contest.totalProblems,
        finishTimeInSeconds: contest.finishTimeInSeconds
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return contests;
  } catch (error) {
    console.error('Error fetching contest history:', error);
    return null;
  }
}
