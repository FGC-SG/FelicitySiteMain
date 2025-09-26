import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { translateNewsArticle } from "./translation";
import * as XLSX from "xlsx";
import multer from "multer";
import { Readable } from "stream";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin user for production environments
  try {
    await storage.initializeDefaultUser();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Continue without failing - allow application to start
  }
  
  // Auth middleware - temporarily disabled for development
  // await setupAuth(app);

  // Health check and diagnostics
  app.get('/api/health', async (req, res) => {
    try {
      // Test database connectivity
      const news = await storage.getNewsArticles();
      const portfolios = await storage.getAllPortfolios();
      const users = await storage.getAllUsers();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: true,
          newsCount: news.length,
          portfolioCount: portfolios.length,
          userCount: users.length
        },
        session: {
          user: (req as any).session?.user || null
        }
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Email/Password Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log(`Login attempt for email: ${email}`);
      
      // Check database users with proper bcrypt comparison
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          console.log(`User not found: ${email}`);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        console.log(`User found: ${email}, checking password`);
        
        if (!user.password) {
          console.log(`No password set for user: ${email}`);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          console.log(`Password mismatch for user: ${email}`);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        console.log(`Login successful for user: ${email}`);
        
        // Check if user is active
        if (user.isActive === false) {
          console.log(`Inactive user attempted login: ${email}`);
          return res.status(401).json({ message: "Account deactivated" });
        }
        
        // Convert database user to session format
        const sessionUser = {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          profileImageUrl: user.profileImageUrl
        };
        
        // Set session
        (req as any).session.user = sessionUser;
        res.json(sessionUser);
      } catch (dbError) {
        console.error("Database error during login:", dbError);
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const user = (req as any).session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Temporary production login route for quick access
  app.post('/api/auth/temp-login', async (req, res) => {
    try {
      const { code } = req.body;
      
      // Temporary production access codes
      const tempCodes = {
        'fgc2025': { email: 'admin@fgcsg.com', role: 'superadmin' },
        'felicity': { email: 'temp@fgcsg.com', role: 'superadmin' },
        'prod2025': { email: 'production@fgcsg.com', role: 'superadmin' }
      };
      
      if (!tempCodes[code as keyof typeof tempCodes]) {
        return res.status(401).json({ message: "Invalid access code" });
      }
      
      const tempUser = tempCodes[code as keyof typeof tempCodes];
      
      // Create unique temporary ID
      const tempId = `temp-${Date.now()}`;
      
      // Create temporary session user
      const sessionUser = {
        id: tempId,
        email: tempUser.email,
        firstName: 'Temporary',
        lastName: 'Admin',
        role: tempUser.role,
        isActive: true,
        profileImageUrl: null,
        isTemporary: true // Flag to identify temporary sessions
      };
      
      // Store temporary user in database to satisfy foreign key constraints
      try {
        await storage.upsertUser({
          id: tempId,
          email: tempUser.email,
          firstName: 'Temporary',
          lastName: 'Admin',
          role: tempUser.role,
          isActive: true,
          profileImageUrl: null
        });
      } catch (error) {
        console.error("Error storing temporary user:", error);
        // Continue anyway - the session will still work for most operations
      }
      
      // Set session
      (req as any).session.user = sessionUser;
      
      console.log(`Temporary login successful with code: ${code}`);
      res.json(sessionUser);
    } catch (error) {
      console.error("Error during temporary login:", error);
      res.status(500).json({ message: "Temporary login failed" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ message: "Failed to submit contact form" });
      }
    }
  });

  // Get contact submissions (protected route)
  app.get("/api/contact", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  // News routes - temporarily remove auth for development
  app.post('/api/news', async (req: any, res) => {
    try {
      const userId = "38362161"; // Use existing user ID
      const newsData = {
        ...req.body,
        authorId: userId,
        publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : new Date()
      };
      const news = await storage.createNewsArticle(newsData);
      res.json(news);
    } catch (error) {
      console.error("Error creating news article:", error);
      res.status(500).json({ message: "Failed to create news article" });
    }
  });

  app.get('/api/news', async (req, res) => {
    try {
      console.log("Fetching news articles...");
      const news = await storage.getNewsArticles();
      console.log(`Retrieved ${news.length} news articles`);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  // Get news with AI translations
  app.get('/api/news-with-translations', async (req, res) => {
    try {
      const news = await storage.getNewsArticles();
      const englishNews = news.filter(article => article.language === 'en');
      const japaneseNews = news.filter(article => article.language === 'ja');
      
      // Generate Japanese translations for ALL English articles
      const translatedNews = [];
      for (const article of englishNews) {
        const translation = await translateNewsArticle(article);
        translatedNews.push(translation);
      }
      
      // Combine original articles with translations
      const allNews = [...news, ...translatedNews];
      res.json(allNews);
    } catch (error) {
      console.error("Error fetching news with translations:", error);
      res.status(500).json({ message: "Failed to fetch news with translations" });
    }
  });

  // Update news article - temporarily remove auth for development
  app.put('/api/news/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "News article ID is required" });
      }

      // Properly convert date fields
      const updateData = {
        ...req.body,
        publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : undefined
      };

      const updatedArticle = await storage.updateNewsArticle(id, updateData);
      
      if (!updatedArticle) {
        return res.status(404).json({ message: "News article not found" });
      }

      res.json(updatedArticle);
    } catch (error) {
      console.error("Error updating news article:", error);
      res.status(500).json({ message: "Failed to update news article" });
    }
  });

  // Delete news article - requires superuser role
  app.delete('/api/news/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for delete operations" });
      }

      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "News article ID is required" });
      }

      const success = await storage.deleteNewsArticle(id);
      
      if (!success) {
        return res.status(404).json({ message: "News article not found" });
      }

      res.json({ message: "News article deleted successfully" });
    } catch (error) {
      console.error("Error deleting news article:", error);
      res.status(500).json({ message: "Failed to delete news article" });
    }
  });

  // User management routes
  app.post('/api/users', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for user creation" });
      }

      const userData = {
        ...req.body,
        id: undefined, // Let the database generate the ID
      };
      
      // Hash password if provided
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Hash password if provided
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      
      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for delete operations" });
      }

      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Member management routes
  app.get('/api/members', async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post('/api/members', async (req, res) => {
    try {
      const member = await storage.createMember(req.body);
      res.json(member);
    } catch (error) {
      console.error("Error creating member:", error);
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  app.put('/api/members/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const member = await storage.updateMember(id, req.body);
      res.json(member);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.delete('/api/members/:id', async (req, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for delete operations" });
      }

      const { id } = req.params;
      await storage.deleteMember(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Portfolio management routes
  app.get('/api/portfolios', async (req, res) => {
    try {
      console.log("Fetching portfolios...");
      const portfolios = await storage.getAllPortfolios();
      console.log(`Retrieved ${portfolios.length} portfolios`);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.post('/api/portfolios', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required" });
      }

      const portfolio = await storage.createPortfolio(req.body);
      res.json(portfolio);
    } catch (error) {
      console.error("Error creating portfolio:", error);
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  app.put('/api/portfolios/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required" });
      }

      const { id } = req.params;
      const portfolio = await storage.updatePortfolio(id, req.body);
      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  app.delete('/api/portfolios/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for delete operations" });
      }

      const { id } = req.params;
      await storage.deletePortfolio(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ message: "Failed to delete portfolio" });
    }
  });

  app.delete('/api/portfolios', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for delete all operations" });
      }

      await storage.deleteAllPortfolios();
      res.json({ success: true, message: "All portfolios deleted successfully" });
    } catch (error) {
      console.error("Error deleting all portfolios:", error);
      res.status(500).json({ message: "Failed to delete all portfolios" });
    }
  });

  // Fund management routes
  app.get('/api/funds', async (req, res) => {
    try {
      console.log("Fetching funds...");
      const funds = await storage.getAllFunds();
      console.log(`Retrieved ${funds.length} funds`);
      res.json(funds);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });

  // Get individual fund by ID - public endpoint for fund detail pages
  app.get('/api/funds/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching fund with ID: ${id}`);
      const fund = await storage.getFund(id);
      
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }

      // Only return visible funds to public
      if (fund.isVisible === false) {
        return res.status(404).json({ message: "Fund not found" });
      }

      console.log(`Retrieved fund: ${fund.name}`);
      res.json(fund);
    } catch (error) {
      console.error("Error fetching fund:", error);
      res.status(500).json({ message: "Failed to fetch fund" });
    }
  });

  app.post('/api/funds', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required" });
      }

      const fund = await storage.createFund(req.body);
      res.json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      res.status(500).json({ message: "Failed to create fund" });
    }
  });

  app.put('/api/funds/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required" });
      }

      const { id } = req.params;
      const fund = await storage.updateFund(id, req.body);
      res.json(fund);
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  });

  app.delete('/api/funds/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for delete operations" });
      }

      const { id } = req.params;
      await storage.deleteFund(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  });

  // Fund disclosure management routes
  app.get('/api/fund-disclosures', async (req, res) => {
    try {
      console.log("Fetching fund disclosures...");
      const disclosures = await storage.getAllFundDisclosures();
      console.log(`Retrieved ${disclosures.length} fund disclosures`);
      res.json(disclosures);
    } catch (error) {
      console.error("Error fetching fund disclosures:", error);
      res.status(500).json({ message: "Failed to fetch fund disclosures" });
    }
  });

  app.post('/api/fund-disclosures', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superadmin role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Convert publishedAt string to Date object
      const disclosureData = {
        ...req.body,
        publishedAt: new Date(req.body.publishedAt)
      };

      const disclosure = await storage.createFundDisclosure(disclosureData);
      res.json(disclosure);
    } catch (error) {
      console.error("Error creating fund disclosure:", error);
      res.status(500).json({ message: "Failed to create fund disclosure" });
    }
  });

  app.put('/api/fund-disclosures/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superadmin role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      
      // Convert publishedAt string to Date object if provided
      const updateData = { ...req.body };
      if (updateData.publishedAt) {
        updateData.publishedAt = new Date(updateData.publishedAt);
      }

      const disclosure = await storage.updateFundDisclosure(id, updateData);
      res.json(disclosure);
    } catch (error) {
      console.error("Error updating fund disclosure:", error);
      res.status(500).json({ message: "Failed to update fund disclosure" });
    }
  });

  app.delete('/api/fund-disclosures/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superadmin role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required for delete operations" });
      }

      const { id } = req.params;
      await storage.deleteFundDisclosure(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fund disclosure:", error);
      res.status(500).json({ message: "Failed to delete fund disclosure" });
    }
  });

  // User invitation routes
  app.post('/api/invitations', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for sending invitations" });
      }

      const invitationData = {
        ...req.body,
        invitedById: sessionUser.id,
      };

      const invitation = await storage.createInvitation(invitationData);
      
      // In a real application, you would send an email here
      // For now, we'll just return the invitation with the token for testing
      res.json({
        message: "Invitation sent successfully",
        invitationId: invitation.id,
        // In production, don't expose the token in the response
        invitationLink: `${req.protocol}://${req.get('host')}/accept-invitation?token=${invitation.invitationToken}`
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  app.get('/api/invitations', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required" });
      }

      const invitations = await storage.getInvitations();
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get('/api/invitations/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const invitation = await storage.getInvitationByToken(token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ message: "Invitation already used" });
      }

      if (new Date() > invitation.expiresAt!) {
        return res.status(400).json({ message: "Invitation expired" });
      }

      // Return invitation details without sensitive information
      res.json({
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
      });
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ message: "Failed to fetch invitation" });
    }
  });

  app.post('/api/accept-invitation', async (req: any, res) => {
    try {
      const { token, password, passwordConfirm } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await storage.acceptInvitation(token, hashedPassword);
      
      // Auto-login the user
      const sessionUser = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        profileImageUrl: user.profileImageUrl
      };
      
      (req as any).session.user = sessionUser;
      
      res.json({ 
        user: sessionUser,
        message: "Account created successfully"
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to accept invitation" });
    }
  });

  // Password reset routes
  app.post('/api/password-reset/:userId', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Superuser access required for password reset" });
      }

      const { userId } = req.params;
      
      // Verify user exists
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const passwordReset = await storage.createPasswordReset(userId);
      
      res.json({
        message: "Password reset link generated successfully",
        resetId: passwordReset.id,
        resetLink: `${req.protocol}://${req.get('host')}/reset-password?token=${passwordReset.resetToken}`
      });
    } catch (error) {
      console.error("Error creating password reset:", error);
      res.status(500).json({ message: "Failed to create password reset" });
    }
  });

  app.get('/api/password-reset/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const passwordReset = await storage.getPasswordResetByToken(token);
      
      if (!passwordReset) {
        return res.status(404).json({ message: "Password reset not found" });
      }

      if (passwordReset.usedAt) {
        return res.status(400).json({ message: "Password reset link already used" });
      }

      if (new Date() > passwordReset.expiresAt!) {
        return res.status(400).json({ message: "Password reset link expired" });
      }

      // Get user info for display
      const user = await storage.getUser(passwordReset.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error fetching password reset:", error);
      res.status(500).json({ message: "Failed to fetch password reset" });
    }
  });

  app.post('/api/password-reset/:token/reset', async (req: any, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await storage.resetPassword(token, hashedPassword);
      
      res.json({ 
        message: "Password reset successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to reset password" });
    }
  });

  // Object storage routes for photo upload
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/member-photos", async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.photoURL,
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting member photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Excel export routes
  app.get('/api/news/export', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const newsArticles = await storage.getNewsArticles();
      
      // Prepare data for Excel
      const excelData = newsArticles.map(article => ({
        'Title': article.title,
        'Title (Japanese)': article.titleJa || '',
        'Content': article.content,
        'Content (Japanese)': article.contentJa || '',
        'Category': article.category,
        'Felicity Company': article.felicityCompany,
        'Published Date': article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        colWidths.push({ wch: Math.min(maxWidth, 50) });
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'News Articles');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `felicity-news-export-${timestamp}.xlsx`;

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write the file and send
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting news to Excel:', error);
      res.status(500).json({ message: 'Failed to export news data' });
    }
  });

  app.get('/api/news/export-template', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create template data with headers only
      const templateData = [
        {
          'Title': '',
          'Title (Japanese)': '',
          'Content': '',
          'Content (Japanese)': '',
          'Category': '',
          'Felicity Company': '',
          'Published Date': ''
        }
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        // Set minimum width for better usability
        colWidths.push({ wch: Math.max(maxWidth, 15) });
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'News Template');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `felicity-news-template-${timestamp}.xlsx`;

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write the file and send
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting news template:', error);
      res.status(500).json({ message: "Failed to export news template" });
    }
  });

  app.get('/api/portfolios/export-template', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create template data with headers only
      const templateData = [
        {
          'Company Name': '',
          'Company Name (Japanese)': '',
          'Felicity Company': 'felicity-singapore',
          'Fund Name': '',
          'Investment Type': 'growthequity',
          'Status': 'ongoing',
          'Country': '',
          'Industry': '',
          'Investment Year': '',
          'Description': '',
          'Description (Japanese)': '',
          'Website': ''
        }
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        // Set minimum width for better usability
        colWidths.push({ wch: Math.max(maxWidth, 15) });
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Portfolio Template');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `felicity-portfolio-template-${timestamp}.xlsx`;

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write the file and send
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting portfolio template:', error);
      res.status(500).json({ message: "Failed to export portfolio template" });
    }
  });

  app.get('/api/portfolios/export', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const portfolios = await storage.getAllPortfolios();
      
      // Prepare data for Excel
      const excelData = portfolios.map(portfolio => ({
        'Company Name': portfolio.companyName,
        'Company Name (Japanese)': portfolio.companyNameJa || '',
        'Felicity Company': portfolio.felicityCompany,
        'Fund Name': portfolio.fundName || '',
        'Investment Type': portfolio.investmentType,
        'Status': (portfolio as any).status === 'exit' ? 'Exit' : 'Ongoing',
        'Country': portfolio.country,
        'Industry': portfolio.industry,
        'Investment Year': portfolio.investmentYear || '',
        'Description': portfolio.description || '',
        'Description (Japanese)': portfolio.descriptionJa || '',
        'Website': portfolio.website || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        colWidths.push({ wch: Math.min(maxWidth, 50) });
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Portfolio Companies');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `felicity-portfolio-export-${timestamp}.xlsx`;

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write the file and send
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting portfolio to Excel:', error);
      res.status(500).json({ message: 'Failed to export portfolio data' });
    }
  });

  // Configure multer for file uploads with security limits
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1, // Only allow single file
    },
    fileFilter: (req, file, cb) => {
      // Check MIME types
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv'
      ];
      
      // Check file extension
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.originalname.split('.').pop()?.toLowerCase();
      
      if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'));
      }
    }
  });

  // Portfolio bulk import route
  app.post('/api/portfolios/import', upload.single('file'), async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const buffer = req.file.buffer;
      let workbook: XLSX.WorkBook;

      // Parse file based on extension
      try {
        if (req.file.originalname.endsWith('.csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
      } catch (parseError) {
        return res.status(400).json({ 
          message: "Failed to parse file. Please ensure it's a valid Excel or CSV file.",
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        });
      }

      // Validate workbook structure
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({ message: "File contains no sheets" });
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      // Limit number of rows to prevent memory issues
      const MAX_ROWS = 1000;
      if (jsonData.length > MAX_ROWS) {
        return res.status(400).json({ 
          message: `File contains too many rows. Maximum allowed: ${MAX_ROWS}, found: ${jsonData.length}` 
        });
      }

      if (jsonData.length === 0) {
        return res.status(400).json({ message: "File contains no data rows" });
      }

      let imported = 0;
      const errors: string[] = [];

      for (let index = 0; index < jsonData.length; index++) {
        const row = jsonData[index];
        try {
          const rowData = row as any;
          
          // Map Excel columns to database fields
          const portfolioData = {
            companyName: rowData['Company Name'] || rowData['companyName'] || '',
            companyNameJa: rowData['Company Name (Japanese)'] || rowData['companyNameJa'] || '',
            felicityCompany: rowData['Felicity Company'] || rowData['felicityCompany'] || 'felicity-singapore',
            fundName: rowData['Fund Name'] || rowData['fundName'] || '',
            investmentType: rowData['Investment Type'] || rowData['investmentType'] || 'growthequity',
            country: rowData['Country'] || rowData['country'] || '',
            industry: rowData['Industry'] || rowData['industry'] || '',
            investmentYear: rowData['Investment Year'] || rowData['investmentYear'] || '',
            description: rowData['Description'] || rowData['description'] || '',
            descriptionJa: rowData['Description (Japanese)'] || rowData['descriptionJa'] || '',
            website: rowData['Website'] || rowData['website'] || '',
          };

          // Validate required fields
          if (!portfolioData.companyName) {
            errors.push(`Row ${index + 2}: Company name is required`);
            continue;
          }
          if (!portfolioData.industry) {
            errors.push(`Row ${index + 2}: Industry is required`);
            continue;
          }
          if (!portfolioData.country) {
            errors.push(`Row ${index + 2}: Country is required`);
            continue;
          }

          // Validate investment type
          const validInvestmentTypes = ['buyout', 'growthequity', 'secondary'];
          if (!validInvestmentTypes.includes(portfolioData.investmentType)) {
            portfolioData.investmentType = 'growthequity'; // Default fallback
          }

          // Validate felicity company
          const validCompanies = ['felicity-singapore', 'felicity-japan'];
          if (!validCompanies.includes(portfolioData.felicityCompany)) {
            portfolioData.felicityCompany = 'felicity-singapore'; // Default fallback
          }

          await storage.createPortfolio(portfolioData);
          imported++;
        } catch (error) {
          console.error(`Error importing row ${index + 2}:`, error);
          errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({ 
        imported, 
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${imported} portfolio companies${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });
    } catch (error) {
      console.error('Error importing portfolio data:', error);
      res.status(500).json({ message: 'Failed to import portfolio data' });
    }
  });

  // News bulk import route
  app.post('/api/news/import', upload.single('file'), async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const buffer = req.file.buffer;
      let workbook: XLSX.WorkBook;

      // Parse file based on extension
      try {
        if (req.file.originalname.endsWith('.csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
      } catch (parseError) {
        return res.status(400).json({ 
          message: "Failed to parse file. Please ensure it's a valid Excel or CSV file.",
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        });
      }

      // Validate workbook structure
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({ message: "File contains no sheets" });
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      // Limit number of rows to prevent memory issues
      const MAX_ROWS = 1000;
      if (jsonData.length > MAX_ROWS) {
        return res.status(400).json({ 
          message: `File contains too many rows. Maximum allowed: ${MAX_ROWS}, found: ${jsonData.length}` 
        });
      }

      if (jsonData.length === 0) {
        return res.status(400).json({ message: "File contains no data rows" });
      }

      let imported = 0;
      const errors: string[] = [];

      // Get a valid author ID from the database (use first real user, not temporary)
      const users = await storage.getAllUsers();
      let validAuthorId = users.find((u: any) => !u.id.startsWith('temp-'))?.id;
      
      // If no real users exist, use the default admin user
      if (!validAuthorId) {
        const adminUser = await storage.getUserByEmail('onuma@fgcsg.com');
        validAuthorId = adminUser?.id || sessionUser.id;
      }

      for (let index = 0; index < jsonData.length; index++) {
        const row = jsonData[index];
        try {
          const rowData = row as any;
          
          // Map Excel columns to database fields
          const newsData = {
            title: rowData['Title'] || rowData['title'] || '',
            titleJa: rowData['Title (Japanese)'] || rowData['titleJa'] || '',
            description: rowData['Description'] || rowData['description'] || '',
            descriptionJa: rowData['Description (Japanese)'] || rowData['descriptionJa'] || '',
            content: rowData['Content'] || rowData['content'] || '',
            contentJa: rowData['Content (Japanese)'] || rowData['contentJa'] || '',
            felicityCompany: rowData['Felicity Company'] || rowData['felicityCompany'] || 'felicity-singapore',
            language: 'en',
            category: 'news',
            authorId: validAuthorId,
            publishedAt: new Date(),
          };

          // Validate required fields
          if (!newsData.title) {
            errors.push(`Row ${index + 2}: Title is required`);
            continue;
          }
          if (!newsData.description) {
            errors.push(`Row ${index + 2}: Description is required`);
            continue;
          }
          if (!newsData.content) {
            errors.push(`Row ${index + 2}: Content is required`);
            continue;
          }

          // Validate felicity company
          const validCompanies = ['felicity-singapore', 'felicity-japan'];
          if (!validCompanies.includes(newsData.felicityCompany)) {
            newsData.felicityCompany = 'felicity-singapore'; // Default fallback
          }

          await storage.createNewsArticle(newsData);
          imported++;
        } catch (error) {
          console.error(`Error importing row ${index + 2}:`, error);
          errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({ 
        imported, 
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${imported} news articles${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });
    } catch (error) {
      console.error('Error importing news data:', error);
      res.status(500).json({ message: 'Failed to import news data' });
    }
  });

  // Fund export routes
  app.get('/api/funds/export', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const funds = await storage.getAllFunds();
      
      // Prepare data for Excel
      const excelData = funds.map((fund: any) => ({
        'Fund Name': fund.name,
        'Description': fund.description,
        'Description (Japanese)': fund.descriptionJa || '',
        'Vintage': fund.vintage || '',
        'Status': fund.status || '',
        'Felicity Company': fund.felicityCompany || '',
        'Visible': fund.isVisible !== false ? 'TRUE' : 'FALSE'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        colWidths.push({ wch: Math.min(maxWidth, 50) });
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Funds');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `felicity-funds-export-${timestamp}.xlsx`;

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write the file and send
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting funds to Excel:', error);
      res.status(500).json({ message: 'Failed to export funds data' });
    }
  });

  app.get('/api/funds/export-template', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create template data with headers only
      const templateData = [
        {
          'Fund Name': '',
          'Display Name': '',
          'Description': '',
          'Description (Japanese)': '',
          'Vintage': '',
          'Status': '',
          'Felicity Company': '',
          'Visible': ''
        }
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        // Set minimum width for better usability
        colWidths.push({ wch: Math.max(maxWidth, 15) });
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Fund Template');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `felicity-funds-template-${timestamp}.xlsx`;

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write the file and send
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting fund template:', error);
      res.status(500).json({ message: "Failed to export fund template" });
    }
  });

  // Fund bulk import route
  app.post('/api/funds/import', upload.single('file'), async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const buffer = req.file.buffer;
      let workbook: XLSX.WorkBook;

      // Parse file based on extension
      try {
        if (req.file.originalname.endsWith('.csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
      } catch (parseError) {
        return res.status(400).json({ 
          message: "Failed to parse file. Please ensure it's a valid Excel or CSV file.",
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        });
      }

      // Validate workbook structure
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({ message: "File contains no sheets" });
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      // Limit number of rows to prevent memory issues
      const MAX_ROWS = 1000;
      if (jsonData.length > MAX_ROWS) {
        return res.status(400).json({ 
          message: `File contains too many rows. Maximum allowed: ${MAX_ROWS}, found: ${jsonData.length}` 
        });
      }

      if (jsonData.length === 0) {
        return res.status(400).json({ message: "File contains no data rows" });
      }

      let imported = 0;
      const errors: string[] = [];

      for (let index = 0; index < jsonData.length; index++) {
        const row = jsonData[index];
        try {
          const rowData = row as any;
          
          // Map Excel columns to database fields
          const fundData = {
            name: rowData['Fund Name'] || rowData['name'] || '',
            description: rowData['Description'] || rowData['description'] || '',
            descriptionJa: rowData['Description (Japanese)'] || rowData['descriptionJa'] || '',
          };

          // Validate required fields
          if (!fundData.name) {
            errors.push(`Row ${index + 2}: Fund Name is required`);
            continue;
          }
          if (!fundData.description) {
            errors.push(`Row ${index + 2}: Description is required`);
            continue;
          }

          await storage.createFund(fundData);
          imported++;
        } catch (error) {
          console.error(`Error importing row ${index + 2}:`, error);
          errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({ 
        imported, 
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${imported} funds${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });
    } catch (error) {
      console.error('Error importing fund data:', error);
      res.status(500).json({ message: 'Failed to import fund data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
