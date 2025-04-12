import { 
  users, 
  userPlatforms,
  platformProfiles,
  submissionStats, 
  languageStats, 
  badges, 
  contestHistory,
  PLATFORM_TYPES,
  type User, 
  type InsertUser,
  type UserPlatform,
  type InsertUserPlatform,
  type PlatformProfile,
  type InsertPlatformProfile,
  type SubmissionStat,
  type InsertSubmissionStat,
  type LanguageStat,
  type InsertLanguageStat,
  type Badge,
  type InsertBadge,
  type ContestHistory,
  type InsertContestHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { UserWithStats, PlatformData, PlatformType } from "@shared/types";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Platform connections
  getUserPlatforms(userId: number): Promise<UserPlatform[]>;
  getUserPlatform(userId: number, platformType: PlatformType): Promise<UserPlatform | undefined>;
  createUserPlatform(platform: InsertUserPlatform): Promise<UserPlatform>;
  updateUserPlatform(id: number, data: Partial<InsertUserPlatform>): Promise<UserPlatform>;
  
  // Platform profile operations
  getPlatformProfile(userId: number, platformType: PlatformType): Promise<PlatformProfile | undefined>;
  createPlatformProfile(profile: InsertPlatformProfile): Promise<PlatformProfile>;
  updatePlatformProfile(userId: number, platformType: PlatformType, profile: Partial<InsertPlatformProfile>): Promise<PlatformProfile | undefined>;
  
  // Submission stats operations
  getSubmissionStats(userId: number, platformType?: PlatformType): Promise<SubmissionStat[]>;
  createSubmissionStat(stat: InsertSubmissionStat): Promise<SubmissionStat>;
  
  // Language stats operations
  getLanguageStats(userId: number, platformType?: PlatformType): Promise<LanguageStat[]>;
  createLanguageStat(stat: InsertLanguageStat): Promise<LanguageStat>;
  clearLanguageStats(userId: number, platformType: PlatformType): Promise<void>;
  
  // Badge operations
  getBadges(userId: number, platformType?: PlatformType): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Contest history operations
  getContestHistory(userId: number, platformType?: PlatformType): Promise<ContestHistory[]>;
  createContestHistory(contest: InsertContestHistory): Promise<ContestHistory>;
  
  // Aggregated stats
  getUserWithStats(userId: number): Promise<UserWithStats | undefined>;
  getPlatformData(userId: number, platformType: PlatformType): Promise<PlatformData | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async getUserPlatforms(userId: number): Promise<UserPlatform[]> {
    return db
      .select()
      .from(userPlatforms)
      .where(eq(userPlatforms.userId, userId));
  }

  async getUserPlatform(userId: number, platformType: PlatformType): Promise<UserPlatform | undefined> {
    const [platform] = await db
      .select()
      .from(userPlatforms)
      .where(
        and(
          eq(userPlatforms.userId, userId),
          eq(userPlatforms.platformType, platformType as string)
        )
      );
    return platform;
  }

  async createUserPlatform(platform: InsertUserPlatform): Promise<UserPlatform> {
    const [createdPlatform] = await db
      .insert(userPlatforms)
      .values(platform)
      .returning();
    return createdPlatform;
  }

  async updateUserPlatform(id: number, data: Partial<InsertUserPlatform>): Promise<UserPlatform> {
    const [updatedPlatform] = await db
      .update(userPlatforms)
      .set(data)
      .where(eq(userPlatforms.id, id))
      .returning();
    return updatedPlatform;
  }

  async getPlatformProfile(userId: number, platformType: PlatformType): Promise<PlatformProfile | undefined> {
    const [profile] = await db
      .select()
      .from(platformProfiles)
      .where(
        and(
          eq(platformProfiles.userId, userId),
          eq(platformProfiles.platformType, platformType as string)
        )
      );
    return profile;
  }

  async createPlatformProfile(profile: InsertPlatformProfile): Promise<PlatformProfile> {
    const [createdProfile] = await db
      .insert(platformProfiles)
      .values(profile)
      .returning();
    return createdProfile;
  }

  async updatePlatformProfile(userId: number, platformType: PlatformType, profile: Partial<InsertPlatformProfile>): Promise<PlatformProfile | undefined> {
    const [updatedProfile] = await db
      .update(platformProfiles)
      .set({
        ...profile,
        lastUpdated: new Date()
      })
      .where(
        and(
          eq(platformProfiles.userId, userId),
          eq(platformProfiles.platformType, platformType as string)
        )
      )
      .returning();
    return updatedProfile;
  }

  async getSubmissionStats(userId: number, platformType?: PlatformType): Promise<SubmissionStat[]> {
    let query = db
      .select()
      .from(submissionStats)
      .where(eq(submissionStats.userId, userId));
    
    if (platformType) {
      query = query.where(eq(submissionStats.platformType, platformType as string));
    }
    
    return query.orderBy(submissionStats.date);
  }

  async createSubmissionStat(stat: InsertSubmissionStat): Promise<SubmissionStat> {
    // First check if there's already a stat for this date, user, and platform
    const [existingStat] = await db
      .select()
      .from(submissionStats)
      .where(
        and(
          eq(submissionStats.userId, stat.userId),
          eq(submissionStats.platformType, stat.platformType),
          eq(submissionStats.date, stat.date)
        )
      );

    if (existingStat) {
      // Update existing stat
      const [updatedStat] = await db
        .update(submissionStats)
        .set({ count: stat.count })
        .where(eq(submissionStats.id, existingStat.id))
        .returning();
      return updatedStat;
    } else {
      // Create new stat
      const [createdStat] = await db
        .insert(submissionStats)
        .values(stat)
        .returning();
      return createdStat;
    }
  }

  async getLanguageStats(userId: number, platformType?: PlatformType): Promise<LanguageStat[]> {
    let query = db
      .select()
      .from(languageStats)
      .where(eq(languageStats.userId, userId));
    
    if (platformType) {
      query = query.where(eq(languageStats.platformType, platformType as string));
    }
    
    return query.orderBy(desc(languageStats.count));
  }

  async createLanguageStat(stat: InsertLanguageStat): Promise<LanguageStat> {
    const [createdStat] = await db
      .insert(languageStats)
      .values(stat)
      .returning();
    return createdStat;
  }

  async clearLanguageStats(userId: number, platformType: PlatformType): Promise<void> {
    await db
      .delete(languageStats)
      .where(
        and(
          eq(languageStats.userId, userId),
          eq(languageStats.platformType, platformType as string)
        )
      );
  }

  async getBadges(userId: number, platformType?: PlatformType): Promise<Badge[]> {
    let query = db
      .select()
      .from(badges)
      .where(eq(badges.userId, userId));
    
    if (platformType) {
      query = query.where(eq(badges.platformType, platformType as string));
    }
    
    return query;
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [createdBadge] = await db
      .insert(badges)
      .values(badge)
      .returning();
    return createdBadge;
  }

  async getContestHistory(userId: number, platformType?: PlatformType): Promise<ContestHistory[]> {
    let query = db
      .select()
      .from(contestHistory)
      .where(eq(contestHistory.userId, userId));
    
    if (platformType) {
      query = query.where(eq(contestHistory.platformType, platformType as string));
    }
    
    return query.orderBy(desc(contestHistory.date));
  }

  async createContestHistory(contest: InsertContestHistory): Promise<ContestHistory> {
    const [createdContest] = await db
      .insert(contestHistory)
      .values(contest)
      .returning();
    return createdContest;
  }

  async getPlatformData(userId: number, platformType: PlatformType): Promise<PlatformData | undefined> {
    const userPlatform = await this.getUserPlatform(userId, platformType);
    if (!userPlatform) return undefined;
    
    const profile = await this.getPlatformProfile(userId, platformType);
    const subStats = await this.getSubmissionStats(userId, platformType);
    const langStats = await this.getLanguageStats(userId, platformType);
    const userBadges = await this.getBadges(userId, platformType);
    const contests = await this.getContestHistory(userId, platformType);
    
    return {
      platformType: platformType,
      username: userPlatform.username,
      profile: {
        totalSolved: profile?.totalSolved,
        easySolved: profile?.easySolved,
        mediumSolved: profile?.mediumSolved,
        hardSolved: profile?.hardSolved,
        totalSubmissions: profile?.totalSubmissions,
        acceptanceRate: profile?.acceptanceRate,
        ranking: profile?.ranking,
        contestAttended: profile?.contestAttended,
        additionalData: profile?.additionalData
      },
      submissionStats: subStats.map(stat => ({
        date: stat.date.toISOString().split('T')[0],
        count: stat.count
      })),
      languageStats: langStats.map(stat => ({
        language: stat.language,
        count: stat.count,
        percentage: stat.percentage
      })),
      badges: userBadges.map(badge => ({
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      })),
      contestHistory: contests.map(contest => ({
        contestName: contest.contestName,
        ranking: contest.ranking,
        score: contest.score,
        date: contest.date.toISOString().split('T')[0]
      }))
    };
  }

  async getUserWithStats(userId: number): Promise<UserWithStats | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // Get all user platforms
    const userPlatforms = await this.getUserPlatforms(userId);
    
    // Build platforms object
    const platforms: { [key: string]: { username: string, isActive: boolean } } = {};
    for (const platform of userPlatforms) {
      platforms[platform.platformType] = {
        username: platform.username,
        isActive: platform.isActive
      };
    }
    
    // Get platform data for each active platform
    const platformData: PlatformData[] = [];
    for (const platform of userPlatforms.filter(p => p.isActive)) {
      const data = await this.getPlatformData(userId, platform.platformType as PlatformType);
      if (data) {
        platformData.push(data);
      }
    }
    
    // Find LeetCode username for backward compatibility
    const leetcodePlatform = userPlatforms.find(p => p.platformType === PLATFORM_TYPES.LEETCODE);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      leetcodeUsername: leetcodePlatform?.username,
      platforms: platforms as any,
      platformData
    };
  }
}

export const storage = new DatabaseStorage();
