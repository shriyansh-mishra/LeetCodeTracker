import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { fetchLeetCodeProfile } from '@/lib/leetcode';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { leetcodeUsername: true }
    });

    if (!user?.leetcodeUsername) {
      return res.status(400).json({ message: 'LeetCode username not found' });
    }

    const profile = await fetchLeetCodeProfile(user.leetcodeUsername);
    
    // Update user's LeetCode stats in the database
    await prisma.leetCodeStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        totalSolved: profile.totalSolved,
        easySolved: profile.easySolved,
        mediumSolved: profile.mediumSolved,
        hardSolved: profile.hardSolved,
        contestRating: profile.contestRating,
        contestRanking: profile.contestRanking,
        reputation: profile.reputation,
        submissionStats: profile.submissionStats,
        lastUpdated: new Date(),
      },
      update: {
        totalSolved: profile.totalSolved,
        easySolved: profile.easySolved,
        mediumSolved: profile.mediumSolved,
        hardSolved: profile.hardSolved,
        contestRating: profile.contestRating,
        contestRanking: profile.contestRanking,
        reputation: profile.reputation,
        submissionStats: profile.submissionStats,
        lastUpdated: new Date(),
      },
    });

    return res.status(200).json({ message: 'Successfully synced LeetCode data' });
  } catch (error: any) {
    console.error('Error syncing LeetCode data:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to sync LeetCode data'
    });
  }
} 