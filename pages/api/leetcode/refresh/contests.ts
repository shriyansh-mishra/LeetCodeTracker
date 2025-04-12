import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { fetchLeetCodeContestHistory } from '@/lib/leetcode';

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

    const contestHistory = await fetchLeetCodeContestHistory(user.leetcodeUsername);
    
    // Update user's contest history in the database
    await prisma.leetCodeStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        contestRating: contestHistory.rating,
        contestRanking: contestHistory.globalRanking,
        attendedContestsCount: contestHistory.attendedContestsCount,
        lastUpdated: new Date(),
      },
      update: {
        contestRating: contestHistory.rating,
        contestRanking: contestHistory.globalRanking,
        attendedContestsCount: contestHistory.attendedContestsCount,
        lastUpdated: new Date(),
      },
    });

    return res.status(200).json({ message: 'Successfully synced contest history' });
  } catch (error: any) {
    console.error('Error syncing contest history:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to sync contest history'
    });
  }
} 