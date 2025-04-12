export type PlatformType = 'leetcode' | 'geeksforgeeks' | 'codeforces' | 'codingninjas';

export interface PlatformUserProfile {
  username: string;
  platformType: PlatformType;
  ranking?: string;
  totalSolved?: number;
  totalQuestions?: number;
  easySolved?: number;
  easyTotal?: number;
  mediumSolved?: number;
  mediumTotal?: number;
  hardSolved?: number;
  hardTotal?: number;
  acceptanceRate?: string;
  submissionCalendar?: Record<string, number>;
  // Platform-specific additional data
  additionalData?: Record<string, any>;
}

// LeetCode-specific profile interface
export interface LeetCodeUserProfile {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: string;
  ranking: string;
  reputation: number;
  starRating: number;
  userAvatar: string;
  submissionCalendar: string;
}

// GeeksForGeeks-specific profile interface
export interface GeeksForGeeksUserProfile extends PlatformUserProfile {
  platformType: 'geeksforgeeks';
  instituteName?: string;
  instituteRank?: string;
  overallCodingScore?: number;
  totalProblemsSolved?: number;
  monthlyCodingScore?: number;
}

// CodeForces-specific profile interface
export interface CodeForcesUserProfile extends PlatformUserProfile {
  platformType: 'codeforces';
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  contribution?: number;
}

// CodingNinjas-specific profile interface 
export interface CodingNinjasUserProfile extends PlatformUserProfile {
  platformType: 'codingninjas';
  level?: string;
  experience?: number;
  problemsSolved?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export interface SubmissionStats {
  totalSubmissions: number;
  lastSubmissions: {
    date: string;
    count: number;
  }[];
}

export interface LanguageStat {
  language: string;
  count: number;
  percentage: string;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
}

export interface ContestInfo {
  contestName: string;
  ranking: string;
  score: number;
  date: string;
  platformType: PlatformType;
}

// Platform profiles combined to show all user's platforms
export interface PlatformData {
  platformType: PlatformType;
  username: string;
  profile: {
    totalSolved?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    totalSubmissions?: number;
    acceptanceRate?: string;
    ranking?: string;
    contestAttended?: number;
    additionalData?: Record<string, any>;
  };
  submissionStats: {
    date: string;
    count: number;
  }[];
  languageStats: {
    language: string;
    count: number;
    percentage: string;
  }[];
  badges: {
    name: string;
    description: string;
    icon: string;
  }[];
  contestHistory: {
    contestName: string;
    ranking: string;
    score: number;
    date: string;
  }[];
}

// Complete user data with all platform data
export interface UserWithStats {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  platforms: {
    [platformType in PlatformType]?: {
      username: string;
      isActive: boolean;
    }
  };
  platformData: PlatformData[];
  
  // For backward compatibility:
  leetcodeUsername?: string;
}

export interface LeetCodeContestHistory {
  totalParticipants: number;
  attendedContestCount: number;
  rating: number;
  globalRanking: number;
  topPercentage: number;
  contestHistory: LeetCodeContest[];
}

export interface LeetCodeContest {
  title: string;
  startTime: number;
  ranking: number;
  score: number;
  totalParticipants: number;
}

export interface LeetCodeSubmissionStats extends SubmissionStats {}

export interface LeetCodeLanguageStat extends LanguageStat {}

export interface LeetCodeBadge extends Badge {}
