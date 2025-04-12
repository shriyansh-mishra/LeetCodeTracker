import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { leetcodeUsername } = req.body;

    if (!leetcodeUsername || typeof leetcodeUsername !== 'string') {
      return res.status(400).json({ error: 'Valid LeetCode username is required' });
    }

    // Update the user's LeetCode username
    const user = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        leetcodeUsername: leetcodeUsername.trim()
      }
    });

    // Delete any existing LeetCode stats for this user
    // This ensures we'll fetch fresh data on next sync
    await prisma.leetCodeStats.deleteMany({
      where: {
        userId: user.id
      }
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        leetcodeUsername: user.leetcodeUsername
      }
    });
  } catch (error) {
    console.error('Error setting LeetCode username:', error);
    return res.status(500).json({ 
      error: 'Failed to update LeetCode username. Please try again.' 
    });
  }
} 