import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum for coding platforms
export const PLATFORM_TYPES = {
  LEETCODE: 'leetcode',
  GEEKSFORGEEKS: 'geeksforgeeks',
  CODEFORCES: 'codeforces',
  CODINGNINJAS: 'codingninjas'
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User platform connections
export const userPlatforms = pgTable("user_platforms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformType: text("platform_type").notNull(), // From PLATFORM_TYPES
  username: text("username").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Platform Profiles - General stats across platforms
export const platformProfiles = pgTable("platform_profiles", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").notNull().references(() => users.id),
  platformType: text("platform_type").notNull(), // From PLATFORM_TYPES
  totalSolved: integer("total_solved"),
  easySolved: integer("easy_solved"),
  mediumSolved: integer("medium_solved"),
  hardSolved: integer("hard_solved"),
  totalSubmissions: integer("total_submissions"),
  acceptanceRate: text("acceptance_rate"),
  ranking: text("ranking"),
  contestAttended: integer("contest_attended"),
  // Additional platform-specific data can be stored in JSON format
  additionalData: jsonb("additional_data"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const submissionStats = pgTable("submission_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformType: text("platform_type").notNull(), // From PLATFORM_TYPES
  date: timestamp("date").notNull(),
  count: integer("count").notNull(),
});

export const languageStats = pgTable("language_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformType: text("platform_type").notNull(), // From PLATFORM_TYPES
  language: text("language").notNull(),
  count: integer("count").notNull(),
  percentage: text("percentage").notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformType: text("platform_type").notNull(), // From PLATFORM_TYPES
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const contestHistory = pgTable("contest_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformType: text("platform_type").notNull(), // From PLATFORM_TYPES
  contestName: text("contest_name").notNull(),
  ranking: text("ranking").notNull(),
  score: integer("score").notNull(),
  date: timestamp("date").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  platforms: many(userPlatforms),
  profiles: many(platformProfiles),
  submissionStats: many(submissionStats),
  languageStats: many(languageStats),
  badges: many(badges),
  contestHistory: many(contestHistory),
}));

export const userPlatformsRelations = relations(userPlatforms, ({ one }) => ({
  user: one(users, {
    fields: [userPlatforms.userId],
    references: [users.id],
  }),
}));

export const platformProfilesRelations = relations(platformProfiles, ({ one }) => ({
  user: one(users, {
    fields: [platformProfiles.userId],
    references: [users.id],
  }),
}));

export const submissionStatsRelations = relations(submissionStats, ({ one }) => ({
  user: one(users, {
    fields: [submissionStats.userId],
    references: [users.id],
  }),
}));

export const languageStatsRelations = relations(languageStats, ({ one }) => ({
  user: one(users, {
    fields: [languageStats.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, {
    fields: [badges.userId],
    references: [users.id],
  }),
}));

export const contestHistoryRelations = relations(contestHistory, ({ one }) => ({
  user: one(users, {
    fields: [contestHistory.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUserPlatformSchema = createInsertSchema(userPlatforms).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformProfileSchema = createInsertSchema(platformProfiles).omit({
  id: true,
  lastUpdated: true,
});

export const insertSubmissionStatSchema = createInsertSchema(submissionStats).omit({
  id: true,
});

export const insertLanguageStatSchema = createInsertSchema(languageStats).omit({
  id: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

export const insertContestHistorySchema = createInsertSchema(contestHistory).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserPlatform = typeof userPlatforms.$inferSelect;
export type InsertUserPlatform = z.infer<typeof insertUserPlatformSchema>;
export type PlatformProfile = typeof platformProfiles.$inferSelect;
export type InsertPlatformProfile = z.infer<typeof insertPlatformProfileSchema>;
export type SubmissionStat = typeof submissionStats.$inferSelect;
export type InsertSubmissionStat = z.infer<typeof insertSubmissionStatSchema>;
export type LanguageStat = typeof languageStats.$inferSelect;
export type InsertLanguageStat = z.infer<typeof insertLanguageStatSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type ContestHistory = typeof contestHistory.$inferSelect;
export type InsertContestHistory = z.infer<typeof insertContestHistorySchema>;
