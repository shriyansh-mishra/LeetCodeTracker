import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  fetchLeetCodeUserProfile,
  fetchSubmissionStats,
  fetchLanguageStats,
  generateBadges,
  fetchLeetCodeContestHistory
} from "./leetcode";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Add proper type for authenticated user
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      fullName: string | null;
      leetcodeUsername?: string;
    }
  }
}

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  const MemoryStoreInstance = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "leetcode-tracker-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      store: new MemoryStoreInstance({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Registration endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user with just basic info (no platform connections yet)
      const user = await storage.createUser(validatedData);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login" });
        }
        return res.status(201).json({ 
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName
          }
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req: Request, res: Response, next: Function) => {
    try {
      // Validate request body
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: Error, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.json({ 
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              leetcodeUsername: user.leetcodeUsername
            }
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", isAuthenticated, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json({ 
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        leetcodeUsername: req.user.leetcodeUsername
      }
    });
  });

  // Get user dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user.id;
      const userWithStats = await storage.getUserWithStats(userId);
      
      if (!userWithStats) {
        return res.status(404).json({ message: "User data not found" });
      }
      
      res.json(userWithStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  });

  // Refresh LeetCode data
  app.post("/api/leetcode/refresh", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userPlatform = await storage.getUserPlatform(userId, 'leetcode');
      if (!userPlatform || !userPlatform.username) {
        return res.status(400).json({ message: "Please set your LeetCode username first" });
      }
      
      await updateUserLeetCodeData(userId, userPlatform.username);
      
      const updatedStats = await storage.getUserWithStats(userId);
      res.json(updatedStats);
    } catch (error) {
      console.error("Error refreshing LeetCode data:", error);
      res.status(500).json({ message: "Error refreshing LeetCode data" });
    }
  });

  // Set LeetCode username
  app.post("/api/leetcode/username", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("Received request to set LeetCode username:", req.body);
      
      if (!req.user) {
        console.error("No authenticated user found");
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized" 
        });
      }

      const { leetcodeUsername } = req.body;
      
      if (!leetcodeUsername) {
        console.error("LeetCode username is missing in request body");
        return res.status(400).json({ 
          success: false,
          message: "LeetCode username is required" 
        });
      }

      console.log("Attempting to verify LeetCode username:", leetcodeUsername);
      // Verify the LeetCode username exists by trying to fetch their profile
      const profile = await fetchLeetCodeUserProfile(leetcodeUsername);
      if (!profile) {
        console.error("Invalid LeetCode username:", leetcodeUsername);
        return res.status(400).json({ 
          success: false,
          message: "Invalid LeetCode username" 
        });
      }

      console.log("LeetCode username verified, updating database...");
      // Update the user's platform connection
      const userId = req.user.id;
      let userPlatform = await storage.getUserPlatform(userId, 'leetcode');
      
      try {
        if (!userPlatform) {
          console.log("Creating new LeetCode platform connection");
          userPlatform = await storage.createUserPlatform({
            userId,
            platformType: 'leetcode',
            username: leetcodeUsername
          });
        } else {
          console.log("Updating existing LeetCode platform connection");
          userPlatform = await storage.updateUserPlatform(userPlatform.id, {
            username: leetcodeUsername
          });
        }

        console.log("Updating LeetCode data...");
        // Update all LeetCode data
        await updateUserLeetCodeData(userId, leetcodeUsername);

        console.log("LeetCode username update successful");
        res.json({ 
          success: true,
          message: "LeetCode username updated successfully",
          profile: {
            totalSolved: profile.totalSolved,
            easySolved: profile.easySolved,
            mediumSolved: profile.mediumSolved,
            hardSolved: profile.hardSolved,
            ranking: profile.ranking,
            acceptanceRate: profile.acceptanceRate
          }
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("Error setting LeetCode username:", error);
      // Log the full error stack trace
      if (error instanceof Error) {
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ 
        success: false,
        message: "Error setting LeetCode username",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to update all user's LeetCode data
async function updateUserLeetCodeData(userId: number, leetcodeUsername: string): Promise<void> {
  if (!leetcodeUsername) {
    throw new Error("LeetCode username is required");
  }

  // Fetch data from LeetCode API
  const [profile, submissions, languages, badges, contests] = await Promise.all([
    fetchLeetCodeUserProfile(leetcodeUsername),
    fetchSubmissionStats(leetcodeUsername),
    fetchLanguageStats(leetcodeUsername),
    generateBadges(leetcodeUsername),
    fetchLeetCodeContestHistory(leetcodeUsername)
  ]);
  
  if (!profile) {
    throw new Error("Could not fetch LeetCode profile data");
  }

  // Get or create platform connection
  let userPlatform = await storage.getUserPlatform(userId, 'leetcode');
  if (!userPlatform) {
    userPlatform = await storage.createUserPlatform({
      userId,
      platformType: 'leetcode',
      username: leetcodeUsername
    });
  } else if (userPlatform.username !== leetcodeUsername) {
    userPlatform = await storage.updateUserPlatform(userPlatform.id, {
      username: leetcodeUsername
    });
  }
  
  // Update platform profile
  const platformProfile = {
    userId,
    platformType: 'leetcode',
    totalSolved: profile.totalSolved,
    easySolved: profile.easySolved,
    mediumSolved: profile.mediumSolved,
    hardSolved: profile.hardSolved,
    totalSubmissions: submissions?.totalSubmissions || 0,
    acceptanceRate: profile.acceptanceRate,
    ranking: profile.ranking,
    contestAttended: contests?.length || 0,
    lastUpdated: new Date()
  };

  await storage.updatePlatformProfile(userId, 'leetcode', platformProfile);
  
  // Update submission stats
  if (submissions) {
    await Promise.all(
      submissions.lastSubmissions.map(stat => 
        storage.createSubmissionStat({
          userId,
          platformType: 'leetcode',
          date: new Date(stat.date),
          count: stat.count
        })
      )
    );
  }
  
  // Update language stats
  if (languages) {
    await storage.clearLanguageStats(userId, 'leetcode');
    await Promise.all(
      languages.map(lang => 
        storage.createLanguageStat({
          userId,
          platformType: 'leetcode',
          language: lang.language,
          count: lang.count,
          percentage: lang.percentage
        })
      )
    );
  }
  
  // Update badges
  if (badges) {
    await Promise.all(
      badges.map(badge => 
        storage.createBadge({
          userId,
          platformType: 'leetcode',
          name: badge.name,
          description: badge.description,
          icon: badge.icon
        })
      )
    );
  }
  
  // Update contest history
  if (contests) {
    await Promise.all(
      contests.map(contest => 
        storage.createContestHistory({
          userId,
          platformType: 'leetcode',
          contestName: contest.title,
          ranking: contest.ranking.toString(),
          score: contest.score,
          date: new Date(contest.startTime * 1000)
        })
      )
    );
  }
}
