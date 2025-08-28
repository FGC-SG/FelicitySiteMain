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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled for development
  // await setupAuth(app);

  // Email/Password Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Simple hardcoded admin credentials for demo
      // In production, this should use proper password hashing and database storage
      // Using the same credentials from the original website extraction (fc:0729)
      if ((email === "admin@fgcsg.com" && password === "admin123") || 
          (email === "fc" && password === "0729") ||
          (email === "onuma@fgcsg.com" && password === "0729")) {
        const adminUser = {
          id: "admin-001",
          email: "admin@fgcsg.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          department: "management",
          title: "System Administrator",
          isActive: true,
          profileImageUrl: null
        };
        
        // Set session
        (req as any).session.user = adminUser;
        res.json(adminUser);
      } else {
        res.status(401).json({ message: "Invalid credentials" });
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
      const news = await storage.getNewsArticles();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  // Update news article - temporarily remove auth for development
  app.put('/api/news/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "News article ID is required" });
      }

      const updatedArticle = await storage.updateNewsArticle(id, req.body);
      
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

  // User management routes - temporarily remove auth for development
  app.post('/api/users', async (req: any, res) => {
    try {
      const userData = {
        ...req.body,
        id: undefined, // Let the database generate the ID
      };
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
