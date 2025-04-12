interface ContestHistory {
  rating: number;
  globalRanking: number;
  attendedContestsCount: number;
}

export async function fetchLeetCodeContestHistory(username: string): Promise<ContestHistory> {
  const query = `
    query userContestRanking($username: String!) {
      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
      }
    }
  `;

  const variables = { username };

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contest history');
    }

    const data = await response.json();
    const contestRanking = data.data.userContestRanking;

    if (!contestRanking) {
      return {
        rating: 1500, // Default rating for users who haven't participated in contests
        globalRanking: 0,
        attendedContestsCount: 0,
      };
    }

    return {
      rating: contestRanking.rating,
      globalRanking: contestRanking.globalRanking,
      attendedContestsCount: contestRanking.attendedContestsCount,
    };
  } catch (error) {
    console.error('Error fetching contest history:', error);
    throw new Error('Failed to fetch contest history from LeetCode');
  }
} 