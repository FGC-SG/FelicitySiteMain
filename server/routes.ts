import { Request, Response, Router } from "express";
import { IStorage } from "./storage";
import { loginSchema, registerSchema, insertContactSchema } from "@shared/schema";
import crypto from "crypto";

export function createRouter(storage: IStorage): Router {
  const router = Router();

  // Helper function to hash passwords
  const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
  };

  // Generate session token
  const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
  };

  // Register endpoint
  router.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create user with hashed password
      const user = await storage.createUser({
        name: userData.name,
        email: userData.email,
        password: hashPassword(userData.password),
      });

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      res.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name },
        token 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  // Login endpoint
  router.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const hashedPassword = hashPassword(loginData.password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      res.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name },
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  // Logout endpoint
  router.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        await storage.deleteSession(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get current user
  router.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const session = await storage.getSessionByToken(token);
      if (!session) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const user = await storage.getUserById(session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({ 
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Authentication check failed" });
    }
  });

  // Contact form endpoint
  router.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      
      const contact = await storage.createContact(contactData);
      
      res.json({ success: true, contact });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  // Get all contacts (admin only - in real app would need auth)
  router.get("/api/contacts", async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  return router;
}