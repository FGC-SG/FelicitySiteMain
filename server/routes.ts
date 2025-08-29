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

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin user for production environments
  await storage.initializeDefaultUser();
  
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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

  // User invitation routes
  app.post('/api/invitations', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has superuser role
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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
      if (sessionUser.role !== "admin" && sessionUser.role !== "superadmin" && sessionUser.role !== "Superadmin") {
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

  const httpServer = createServer(app);
  return httpServer;
}
