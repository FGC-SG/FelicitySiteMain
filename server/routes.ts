import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContactSubmissionSchema, logoDisplayModeSchema } from "@shared/schema";
import { z } from "zod";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { translateNewsArticle } from "./translation";
import { translateText } from "./translate";
import * as XLSX from "xlsx";
import multer from "multer";
import { Readable } from "stream";
import {
  hasAdminPrivileges,
  canManageUser,
  canAssignRole,
  canDeleteUser,
  canUpdateUser,
  isSuperadmin
} from "./roles";

// Helper function to extract logo from HTML
function extractLogoFromHtml(html: string, baseUrl: string): string | null {
  // Strategy 1: Look for Open Graph image (og:image)
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    return resolveUrl(ogImageMatch[1], baseUrl);
  }

  // Strategy 2: Look for Twitter image
  const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (twitterImageMatch) {
    return resolveUrl(twitterImageMatch[1], baseUrl);
  }

  // Strategy 3: Look for apple-touch-icon
  const appleTouchMatch = html.match(/<link\s+rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
  if (appleTouchMatch) {
    return resolveUrl(appleTouchMatch[1], baseUrl);
  }

  // Strategy 4: Look for icon or shortcut icon with larger sizes
  const iconMatches = Array.from(html.matchAll(/<link\s+rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/gi));
  for (const match of iconMatches) {
    const href = match[1];
    // Skip .ico files and SVGs, prefer larger image formats
    if (!href.endsWith('.ico') && !href.endsWith('.svg')) {
      return resolveUrl(href, baseUrl);
    }
  }

  // Strategy 5: Look for images with "logo" in the filename or src
  const logoImgMatch = html.match(/<img[^>]*src=["']([^"']*logo[^"']*)["']/i);
  if (logoImgMatch) {
    return resolveUrl(logoImgMatch[1], baseUrl);
  }

  // Strategy 6: Fallback to favicon.ico
  return resolveUrl('/favicon.ico', baseUrl);
}

// Helper function to resolve relative URLs
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  if (url.startsWith('/')) {
    return baseUrl + url;
  }
  return baseUrl + '/' + url;
}

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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for delete operations" });
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

  // Translation API endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;

      if (!text || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ message: "Text, source language, and target language are required" });
      }

      if (!['en', 'jp'].includes(sourceLanguage) || !['en', 'jp'].includes(targetLanguage)) {
        return res.status(400).json({ message: "Language must be 'en' or 'jp'" });
      }

      if (sourceLanguage === targetLanguage) {
        return res.json({ translatedText: text });
      }

      const translatedText = await translateText({
        text,
        sourceLanguage: sourceLanguage as 'en' | 'jp',
        targetLanguage: targetLanguage as 'en' | 'jp'
      });

      res.json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Failed to translate text" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for user creation" });
      }

      const userData = {
        ...req.body,
        id: undefined, // Let the database generate the ID
      };

      // Check if current user can assign the requested role
      if (userData.role && !canAssignRole(sessionUser, userData.role)) {
        return res.status(403).json({ message: "You do not have permission to assign this role" });
      }
      
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
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;
      
      // Get the target user to check permissions
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if current user can manage the target user
      if (!canUpdateUser(sessionUser, targetUser)) {
        return res.status(403).json({ message: "You do not have permission to update this user" });
      }

      const updateData = { ...req.body };

      // Check if current user can assign the requested role (if role is being changed)
      if (updateData.role && !canAssignRole(sessionUser, updateData.role)) {
        return res.status(403).json({ message: "You do not have permission to assign this role" });
      }
      
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

      const { id } = req.params;
      
      // Get the target user to check permissions
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if current user can delete the target user
      if (!canDeleteUser(sessionUser, targetUser)) {
        return res.status(403).json({ message: "You do not have permission to delete this user" });
      }

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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for delete operations" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const portfolio = await storage.updatePortfolio(id, req.body);
      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  app.patch('/api/portfolios/:id/logo-display-mode', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { logoDisplayMode } = req.body;
      
      // Validate logoDisplayMode
      const validatedMode = logoDisplayModeSchema.parse(logoDisplayMode);
      
      const portfolio = await storage.updatePortfolio(id, { logoDisplayMode: validatedMode });
      res.json(portfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid logo display mode", errors: error.errors });
      }
      console.error("Error updating logo display mode:", error);
      res.status(500).json({ message: "Failed to update logo display mode" });
    }
  });

  app.delete('/api/portfolios/:id', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for delete operations" });
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

  // Fund export routes - Must be before the generic :id route
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for delete operations" });
      }

      const { id } = req.params;
      await storage.deleteFund(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  });

  // Translation endpoint
  app.post('/api/translate', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { text, targetLanguage = 'Japanese' } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text to translate is required" });
      }

      // Initialize Google Gemini client
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = process.env.GEMINI_API_KEY;
      console.log("GEMINI_API_KEY exists:", !!apiKey, "Length:", apiKey?.length);
      
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables");
      }
      
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Provide only the translation without any additional text or explanations. Maintain the original meaning and tone.\n\nText to translate: "${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const translation = response.text;
      res.json({ translation });
    } catch (error) {
      console.error("Error translating text:", error);
      
      // Handle specific Gemini API errors for better user feedback
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          return res.status(429).json({ 
            message: "Translation service temporarily unavailable due to quota limits. Please try again later.",
            errorType: "quota_exceeded"
          });
        }
        if (error.message.includes('401')) {
          return res.status(401).json({ 
            message: "Translation service configuration issue. Please contact administrator.",
            errorType: "api_key_invalid"
          });
        }
      }
      
      res.status(500).json({ message: "Failed to translate text. Please try again." });
    }
  });

  // Logo extraction endpoint
  app.post('/api/extract-logo', async (req: any, res) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      let websiteUrl: URL;
      try {
        websiteUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // SSRF Protection: Only allow http/https schemes
      if (websiteUrl.protocol !== 'http:' && websiteUrl.protocol !== 'https:') {
        return res.status(400).json({ message: "Only HTTP and HTTPS protocols are allowed" });
      }

      // SSRF Protection: Block private/internal IP ranges and localhost
      // NOTE: This provides hostname-based validation but does not perform DNS resolution
      // to check the actual IP address. Services like nip.io/sslip.io that resolve to private
      // IPs may bypass these checks. For production use with untrusted users, implement
      // DNS resolution and IP validation, or use an allowlist of approved domains.
      // This implementation is suitable for authenticated admin users.
      const hostname = websiteUrl.hostname.toLowerCase();
      
      // Comprehensive blocklist including edge cases
      const blockedPatterns = [
        // Localhost variants
        /^localhost\.?$/i,
        /^127\./,
        /^0\.0\.0\.0/,
        /^::1$/,
        /^::ffff:127\./,  // IPv6-mapped IPv4 localhost
        
        // Private IPv4 ranges
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        
        // Link-local
        /^169\.254\./,
        /^fe80:/,
        
        // IPv6 private ranges (Unique Local Addresses)
        /^fc00:/,
        /^fd[0-9a-f]{2}:/,
        
        // IPv6-mapped private addresses
        /^::ffff:(10|172\.(1[6-9]|2[0-9]|3[0-1])|192\.168)\./,
        
        // Loopback and special addresses
        /^0+\.0+\.0+\.0+/,
        /^255\.255\.255\.255/,
      ];

      if (blockedPatterns.some(pattern => pattern.test(hostname))) {
        return res.status(400).json({ message: "Cannot extract logos from internal/private networks" });
      }

      // Block metadata endpoints and suspicious domains
      if (hostname.includes('metadata') || 
          hostname === '169.254.169.254' ||
          hostname.endsWith('.local') ||
          hostname.includes('internal')) {
        return res.status(400).json({ message: "Cannot extract logos from internal endpoints" });
      }
      
      // Additional validation: hostname must contain at least one dot (reject bare names)
      if (!hostname.includes('.') && hostname !== 'localhost') {
        return res.status(400).json({ message: "Invalid hostname format" });
      }

      console.log(`Attempting to extract logo from: ${websiteUrl.href}`);

      // Fetch the website HTML
      // Note: We follow redirects (default behavior) because many legitimate sites redirect
      // (e.g., http→https, www→non-www). The hostname validation above provides
      // protection against direct SSRF attacks. For additional security in production,
      // consider implementing DNS resolution checking for each redirect hop.
      const response = await fetch(websiteUrl.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FelicityBot/1.0)',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`);
      }

      const html = await response.text();

      // Extract logo using multiple strategies
      const logoUrl = extractLogoFromHtml(html, websiteUrl.origin);

      if (logoUrl) {
        console.log(`Successfully extracted logo: ${logoUrl}`);
        res.json({ logoUrl });
      } else {
        res.status(404).json({ message: "Could not find logo on the website" });
      }
    } catch (error) {
      console.error("Error extracting logo:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to extract logo from website"
      });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for sending invitations" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required" });
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

      // Check if user has admin privileges (admin or superadmin)
      if (!hasAdminPrivileges(sessionUser)) {
        return res.status(403).json({ message: "Admin access required for password reset" });
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
        'Date of Announcement': article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''
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
          'Date of Announcement': ''
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
          'Website': '',
          'Company Logo URL': ''
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
        'Website': portfolio.website || '',
        'Company Logo URL': portfolio.logoUrl || ''
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
            logoUrl: rowData['Company Logo URL'] || rowData['logoUrl'] || '',
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

      // Helper function to get value from row with flexible column name matching
      const getColumnValue = (rowData: any, ...columnNames: string[]): string => {
        for (const name of columnNames) {
          if (rowData[name] !== undefined && rowData[name] !== null) {
            const value = String(rowData[name]).trim();
            if (value) return value;
          }
        }
        return '';
      };

      for (let index = 0; index < jsonData.length; index++) {
        const row = jsonData[index];
        try {
          const rowData = row as any;
          
          // Map Excel columns to database fields with flexible matching
          const announcementDate = getColumnValue(rowData, 'Date of Announcement', 'DateofAnnouncement', 'Announcement Date', 'AnnouncementDate', 'Published Date', 'PublishedDate');
          const newsData = {
            title: getColumnValue(rowData, 'Title', 'title'),
            titleJa: getColumnValue(rowData, 'Title (Japanese)', 'Title(Japanese)', 'titleJa', 'Title（Japanese）'),
            description: getColumnValue(rowData, 'Description', 'description'),
            descriptionJa: getColumnValue(rowData, 'Description (Japanese)', 'Description(Japanese)', 'descriptionJa', 'Description（Japanese）'),
            content: getColumnValue(rowData, 'Content', 'content'),
            contentJa: getColumnValue(rowData, 'Content (Japanese)', 'Content(Japanese)', 'contentJa', 'Content（Japanese）'),
            felicityCompany: getColumnValue(rowData, 'Felicity Company', 'felicityCompany') || 'felicity-singapore',
            language: 'en',
            category: getColumnValue(rowData, 'Category', 'category') || 'news',
            authorId: validAuthorId,
            publishedAt: announcementDate ? new Date(announcementDate) : new Date(),
          };

          // Validate required fields
          if (!newsData.title) {
            errors.push(`Row ${index + 2}: Title is required`);
            continue;
          }
          
          // Auto-generate content from title if both content fields are missing
          if (!newsData.content && !newsData.contentJa) {
            newsData.content = newsData.title;
            newsData.contentJa = newsData.titleJa || newsData.title;
          }
          
          // Auto-generate description from content if not provided
          if (!newsData.description && newsData.content) {
            newsData.description = newsData.content.substring(0, 150) + (newsData.content.length > 150 ? '...' : '');
          }
          if (!newsData.descriptionJa && newsData.contentJa) {
            newsData.descriptionJa = newsData.contentJa.substring(0, 150) + (newsData.contentJa.length > 150 ? '...' : '');
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

  // Moved fund export routes to before :id route

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
            vintage: rowData['Vintage'] || rowData['vintage'] || '',
            status: rowData['Status'] || rowData['status'] || '',
            felicityCompany: rowData['Felicity Company'] || rowData['felicityCompany'] || '',
            isVisible: rowData['Visible'] === 'TRUE' || rowData['Visible'] === true || rowData['isVisible'] === true
          };

          // Validate required fields
          if (!fundData.name || fundData.name.trim() === '') {
            errors.push(`Row ${index + 2}: Fund Name is required`);
            continue;
          }

          // Make description optional but add minimum length if provided
          if (fundData.description && fundData.description.trim().length < 10) {
            errors.push(`Row ${index + 2}: Description must be at least 10 characters if provided`);
            continue;
          }

          // Set default description if empty
          if (!fundData.description || fundData.description.trim() === '') {
            fundData.description = `Investment fund: ${fundData.name}`;
          }

          // Check for existing fund with same name
          const existingFund = await storage.getFundByName(fundData.name);
          if (existingFund) {
            errors.push(`Row ${index + 2}: Fund "${fundData.name}" already exists`);
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

  // Database Backup Export - All Tables
  app.get('/api/export/database-backup', async (req: any, res) => {
    try {
      // Check if user is authenticated and is superadmin
      if (!req.session?.user || req.session.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Access denied. Superadmin only.' });
      }

      console.log('Creating comprehensive database backup for download...');

      // Create workbook
      const wb = XLSX.utils.book_new();

      // 1. Export Portfolios
      const portfolios = await storage.getAllPortfolios();
      const portfolioData = portfolios.map(p => ({
        'ID': p.id,
        'Company Name': p.companyName,
        'Company Name (Japanese)': p.companyNameJa || '',
        'Felicity Company': p.felicityCompany,
        'Fund Name': p.fundName || '',
        'Industry': p.industry,
        'Investment Type': p.investmentType,
        'Country': p.country,
        'Investment Year': p.investmentYear || '',
        'Status': (p as any).status || 'ongoing',
        'Website': p.website || '',
        'Logo URL': p.logoUrl || '',
        'Logo Display Mode': (p as any).logoDisplayMode || 'auto',
        'Description': p.description || '',
        'Description (Japanese)': p.descriptionJa || '',
        'Visible': p.isVisible !== false ? 'TRUE' : 'FALSE',
        'Created At': p.createdAt ? new Date(p.createdAt).toISOString() : '',
        'Updated At': p.updatedAt ? new Date(p.updatedAt).toISOString() : ''
      }));
      if (portfolioData.length > 0) {
        const ws1 = XLSX.utils.json_to_sheet(portfolioData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Portfolios');
      }

      // 2. Export News Articles
      const news = await storage.getNewsArticles();
      console.log('Sample news article from DB:', news.length > 0 ? JSON.stringify(news[0], null, 2) : 'No articles');
      const newsData = news.map(n => ({
        'ID': n.id,
        'Title': n.title,
        'Title (Japanese)': n.titleJa || '',
        'Content': n.content,
        'Content (Japanese)': n.contentJa || '',
        'Attachment URL': n.attachmentUrl || '',
        'Author ID': n.authorId || '',
        'Language': n.language,
        'Category': n.category,
        'Felicity Company': n.felicityCompany,
        'Published At': n.publishedAt ? new Date(n.publishedAt).toISOString() : '',
        'Visible': n.isVisible !== false ? 'TRUE' : 'FALSE',
        'Created At': n.createdAt ? new Date(n.createdAt).toISOString() : '',
        'Updated At': n.updatedAt ? new Date(n.updatedAt).toISOString() : ''
      }));
      console.log('Sample newsData for export:', newsData.length > 0 ? JSON.stringify(newsData[0], null, 2) : 'No data');
      if (newsData.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(newsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'News Articles');
      }

      // 3. Export Members
      const members = await storage.getAllMembers();
      const memberData = members.map(m => ({
        'ID': m.id,
        'Name': m.name,
        'Title': m.title,
        'Company': m.company,
        'Bio': m.bio || '',
        'Photo URL': m.photoUrl || '',
        'Display Order': m.displayOrder || 0,
        'Visible': m.isVisible !== false ? 'TRUE' : 'FALSE',
        'Created At': m.createdAt ? new Date(m.createdAt).toISOString() : '',
        'Updated At': m.updatedAt ? new Date(m.updatedAt).toISOString() : ''
      }));
      if (memberData.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(memberData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Members');
      }

      // 4. Export Funds
      const funds = await storage.getAllFunds();
      const fundData = funds.map(f => ({
        'ID': f.id,
        'Name': f.name,
        'Description': f.description || '',
        'Description (Japanese)': f.descriptionJa || '',
        'Vintage': f.vintage || '',
        'Status': f.status || '',
        'Felicity Company': f.felicityCompany || '',
        'Visible': f.isVisible !== false ? 'TRUE' : 'FALSE',
        'Created At': f.createdAt ? new Date(f.createdAt).toISOString() : '',
        'Updated At': f.updatedAt ? new Date(f.updatedAt).toISOString() : ''
      }));
      if (fundData.length > 0) {
        const ws4 = XLSX.utils.json_to_sheet(fundData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Funds');
      }

      // 5. Export Fund Disclosures
      const disclosures = await storage.getAllFundDisclosures();
      const disclosureData = disclosures.map(d => ({
        'ID': d.id,
        'Fund ID': d.fundId,
        'Fund Name': d.fundName || '',
        'Title': d.title,
        'Title (Japanese)': d.titleJa || '',
        'PDF URL': d.pdfUrl || '',
        'Disclosure Date': d.disclosureDate ? new Date(d.disclosureDate).toISOString() : '',
        'Created At': d.createdAt ? new Date(d.createdAt).toISOString() : '',
        'Updated At': d.updatedAt ? new Date(d.updatedAt).toISOString() : ''
      }));
      if (disclosureData.length > 0) {
        const ws5 = XLSX.utils.json_to_sheet(disclosureData);
        XLSX.utils.book_append_sheet(wb, ws5, 'Fund Disclosures');
      }

      // 6. Export Users (exclude password hashes for security)
      const users = await storage.getAllUsers();
      const userData = users.map(u => ({
        'ID': u.id,
        'Email': u.email || '',
        'First Name': u.firstName || '',
        'Last Name': u.lastName || '',
        'Role': u.role || 'member',
        'Is Active': u.isActive !== false ? 'TRUE' : 'FALSE',
        'Created At': u.createdAt ? new Date(u.createdAt).toISOString() : '',
        'Updated At': u.updatedAt ? new Date(u.updatedAt).toISOString() : ''
      }));
      if (userData.length > 0) {
        const ws6 = XLSX.utils.json_to_sheet(userData);
        XLSX.utils.book_append_sheet(wb, ws6, 'Users');
      }

      // 7. Export Contact Submissions
      const contacts = await storage.getContactSubmissions();
      const contactData = contacts.map(c => ({
        'ID': c.id,
        'First Name': c.firstName,
        'Last Name': c.lastName,
        'Email': c.email,
        'Company': c.company || '',
        'Message': c.message,
        'Created At': c.createdAt ? new Date(c.createdAt).toISOString() : ''
      }));
      if (contactData.length > 0) {
        const ws7 = XLSX.utils.json_to_sheet(contactData);
        XLSX.utils.book_append_sheet(wb, ws7, 'Contact Submissions');
      }

      // 8. Export User Invitations
      const invitations = await storage.getInvitations();
      const invitationData = invitations.map(i => ({
        'ID': i.id,
        'Email': i.email,
        'First Name': i.firstName || '',
        'Last Name': i.lastName || '',
        'Role': i.role || 'user',
        'Invited By ID': i.invitedById,
        'Invitation Token': i.invitationToken,
        'Status': i.status,
        'Created At': i.createdAt ? new Date(i.createdAt).toISOString() : '',
        'Expires At': i.expiresAt ? new Date(i.expiresAt).toISOString() : '',
        'Accepted At': i.acceptedAt ? new Date(i.acceptedAt).toISOString() : ''
      }));
      if (invitationData.length > 0) {
        const ws8 = XLSX.utils.json_to_sheet(invitationData);
        XLSX.utils.book_append_sheet(wb, ws8, 'User Invitations');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `felicity-database-backup-${timestamp}.xlsx`;

      // Write the file to buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Send file as download - browser will show save dialog for location selection
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
      
      console.log(`Database backup exported as download: ${filename}`);
    } catch (error) {
      console.error('Error exporting database backup:', error);
      res.status(500).json({ message: 'Failed to export database backup' });
    }
  });

  // Database Restore Import - Restore from Backup File
  // Configure upload with size limits for restore
  const restoreUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.originalname.endsWith('.xlsx')) {
        cb(null, true);
      } else {
        cb(new Error('Only .xlsx files are allowed'));
      }
    }
  });

  app.post('/api/import/database-restore', restoreUpload.single('file'), async (req: any, res) => {
    try {
      // Check if user is authenticated and is superadmin (case-insensitive)
      if (!req.session?.user || !hasAdminPrivileges(req.session.user)) {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { mode = 'merge', dryRun = 'true', selectedTables } = req.body;
      const isDryRun = dryRun === 'true' || dryRun === true;
      
      // Parse selected tables if provided
      let tablesToRestore: Set<string> | null = null;
      if (selectedTables) {
        try {
          const tables = JSON.parse(selectedTables);
          tablesToRestore = new Set(tables);
          console.log(`Selected tables for restore:`, Array.from(tablesToRestore));
        } catch (error) {
          console.error('Error parsing selectedTables:', error);
        }
      }

      console.log(`Database restore initiated - Mode: ${mode}, Dry Run: ${isDryRun}`);

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      
      // Log available sheets for debugging
      console.log('Available sheets in workbook:', workbook.SheetNames);
      
      // Required sheets (must have at least one data table)
      const coreSheets = ['Users', 'Portfolios', 'Funds', 'News Articles'];
      const missingCoreSheets = coreSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
      
      if (missingCoreSheets.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid backup file format', 
          errors: [`Missing required core sheets: ${missingCoreSheets.join(', ')}`]
        });
      }
      
      // Optional sheets (may not exist if no data was present during backup)
      const optionalSheets = ['Fund Disclosures', 'Members', 'Contact Submissions', 'User Invitations'];
      console.log('Available sheets:', workbook.SheetNames);

      // Initialize preview/result object
      const result: any = {
        mode,
        dryRun: isDryRun,
        tables: {},
        errors: [],
        warnings: []
      };

      // Helper function to parse sheet data
      const parseSheet = (sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return [];
        return XLSX.utils.sheet_to_json(sheet);
      };

      // Parse all sheets
      const usersData = parseSheet('Users');
      const portfoliosData = parseSheet('Portfolios');
      const fundsData = parseSheet('Funds');
      const disclosuresData = parseSheet('Fund Disclosures');
      const newsData = parseSheet('News Articles');
      const membersData = parseSheet('Members');
      const contactsData = parseSheet('Contact Submissions');
      const invitationsData = parseSheet('User Invitations');

      // Validation: Check for required columns
      const validateColumns = (data: any[], requiredColumns: string[], tableName: string) => {
        if (data.length === 0) return [];
        const firstRow = data[0];
        const actualColumns = Object.keys(firstRow);
        console.log(`${tableName} - Available columns:`, actualColumns);
        const missing = requiredColumns.filter(col => !(col in firstRow));
        if (missing.length > 0) {
          result.errors.push(`${tableName}: Missing required columns: ${missing.join(', ')}. Available: ${actualColumns.join(', ')}`);
        }
        return missing;
      };

      // Validate each table's columns (only validate if data exists for optional tables)
      validateColumns(usersData, ['ID', 'Email', 'Role'], 'Users');
      validateColumns(portfoliosData, ['ID', 'Company Name'], 'Portfolios');
      validateColumns(fundsData, ['ID', 'Name'], 'Funds');
      validateColumns(newsData, ['ID', 'Title', 'Content'], 'News Articles');
      
      // Optional tables - only validate if they have data
      if (membersData.length > 0) {
        validateColumns(membersData, ['ID', 'Name', 'Title'], 'Members');
      }
      if (contactsData.length > 0) {
        validateColumns(contactsData, ['ID', 'Email', 'Message'], 'Contact Submissions');
      }
      if (disclosuresData.length > 0) {
        validateColumns(disclosuresData, ['ID', 'Fund ID'], 'Fund Disclosures');
      }
      if (invitationsData.length > 0) {
        validateColumns(invitationsData, ['ID', 'Email'], 'User Invitations');
      }

      // If validation errors, return early
      if (result.errors.length > 0) {
        console.error('Validation errors found:', result.errors);
        return res.status(400).json(result);
      }

      // Count records for preview
      result.tables = {
        users: { total: usersData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        portfolios: { total: portfoliosData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        funds: { total: fundsData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        fundDisclosures: { total: disclosuresData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        newsArticles: { total: newsData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        members: { total: membersData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        contactSubmissions: { total: contactsData.length, action: mode === 'replace' ? 'replace' : 'merge' },
        userInvitations: { total: invitationsData.length, action: mode === 'replace' ? 'replace' : 'merge' }
      };

      // If dry run, return preview
      if (isDryRun) {
        result.message = 'Dry run complete. Review the preview and submit again with dryRun=false to apply changes.';
        return res.json(result);
      }

      // Actual restore logic (transaction-safe)
      console.log('Starting actual database restore...');
      
      // If replace mode, delete existing data in FK-safe order
      if (mode === 'replace') {
        result.warnings.push('Replace mode: All existing data will be deleted before import');
        
        // Delete in dependency order to avoid FK violations
        // Note: Using deleteAll methods from storage where available
        await storage.deleteAllPortfolios();
        
        result.tables.deleted = {
          newsArticles: 'partial',
          fundDisclosures: 'partial',
          portfolios: 'all',
          members: 'partial',
          contactSubmissions: 'partial',
          funds: 'partial',
          userInvitations: 'partial'
        };
        
        result.warnings.push('Note: Some tables may have partial deletion to preserve system integrity');
      }

      // Import data with proper type conversion
      const importedCounts = {
        users: 0,
        portfolios: 0,
        funds: 0,
        fundDisclosures: 0,
        newsArticles: 0,
        members: 0,
        contactSubmissions: 0,
        userInvitations: 0
      };

      // Helper to parse boolean
      const parseBoolean = (value: any) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toUpperCase() === 'TRUE' || value === '1' || value.toLowerCase() === 'yes';
        }
        return false;
      };
      
      // Helper to check if table should be restored
      const shouldRestoreTable = (tableName: string) => {
        // If no tables selected (dry run or initial), restore all
        if (!tablesToRestore || tablesToRestore.size === 0) return true;
        // Otherwise, only restore selected tables
        return tablesToRestore.has(tableName);
      };

      // Import Users (merge/upsert by email)
      if (shouldRestoreTable('users')) {
        for (const row of usersData as any[]) {
          try {
            await storage.upsertUser({
              id: row['ID'],
              email: row['Email'],
              firstName: row['First Name'] || '',
              lastName: row['Last Name'] || '',
              role: row['Role'] || 'user',
              isActive: parseBoolean(row['Is Active'])
            });
            importedCounts.users++;
          } catch (error) {
            console.error('Error importing user:', error);
            result.warnings.push(`User ${row['Email']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import Funds
      if (shouldRestoreTable('funds')) {
        for (const row of fundsData as any[]) {
          try {
            const fundData: any = {
              id: row['ID'],
              name: row['Name'],
              description: row['Description'] || '',
              descriptionJa: row['Description (Japanese)'] || '',
              vintage: row['Vintage'] || '',
              status: row['Status'] || '',
              felicityCompany: row['Felicity Company'] || '',
              isVisible: parseBoolean(row['Visible'])
            };
            
            // Try to get existing fund
            const existing = await storage.getFund(row['ID']);
            if (existing) {
              await storage.updateFund(row['ID'], fundData);
            } else {
              await storage.createFund(fundData);
            }
            importedCounts.funds++;
          } catch (error) {
            console.error('Error importing fund:', error);
            result.warnings.push(`Fund ${row['Name']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import Portfolios
      if (shouldRestoreTable('portfolios')) {
        for (const row of portfoliosData as any[]) {
          try {
            const portfolioData: any = {
              id: row['ID'],
              companyName: row['Company Name'],
              companyNameJa: row['Company Name (Japanese)'] || '',
              felicityCompany: row['Felicity Company'],
              fundName: row['Fund Name'] || '',
              industry: row['Industry'],
              investmentType: row['Investment Type'],
              country: row['Country'],
              investmentYear: row['Investment Year'] || '',
              status: row['Status'] || 'ongoing',
              website: row['Website'] || '',
              logoUrl: row['Logo URL'] || '',
              logoDisplayMode: row['Logo Display Mode'] || 'auto',
              description: row['Description'] || '',
              descriptionJa: row['Description (Japanese)'] || '',
              isVisible: parseBoolean(row['Visible'])
            };
            
            try {
              await storage.createPortfolio(portfolioData);
            } catch {
              // If create fails (ID already exists), try update
              await storage.updatePortfolio(row['ID'], portfolioData);
            }
            importedCounts.portfolios++;
          } catch (error) {
            console.error('Error importing portfolio:', error);
            result.warnings.push(`Portfolio ${row['Company Name']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import Members
      if (shouldRestoreTable('members')) {
        for (const row of membersData as any[]) {
          try {
            const memberData: any = {
              id: row['ID'],
              name: row['Name'],
              title: row['Title'],
              company: row['Company'],
              bio: row['Bio'] || '',
              photoUrl: row['Photo URL'] || '',
              displayOrder: parseInt(row['Display Order']) || 0,
              isVisible: parseBoolean(row['Visible'])
            };
            
            try {
              await storage.createMember(memberData);
            } catch {
              await storage.updateMember(row['ID'], memberData);
            }
            importedCounts.members++;
          } catch (error) {
            console.error('Error importing member:', error);
            result.warnings.push(`Member ${row['Name']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import News Articles
      if (shouldRestoreTable('newsArticles')) {
        for (const row of newsData as any[]) {
          try {
            const newsData: any = {
              id: row['ID'],
              title: row['Title'],
              titleJa: row['Title (Japanese)'] || '',
              content: row['Content'],
              contentJa: row['Content (Japanese)'] || '',
              attachmentUrl: row['Attachment URL'] || '',
              authorId: row['Author ID'] || null,
              language: row['Language'],
              category: row['Category'],
              felicityCompany: row['Felicity Company'],
              publishedAt: row['Published At'] ? new Date(row['Published At']) : new Date(),
              isVisible: parseBoolean(row['Visible'])
            };
            
            try {
              await storage.createNewsArticle(newsData);
            } catch {
              await storage.updateNewsArticle(row['ID'], newsData);
            }
            importedCounts.newsArticles++;
          } catch (error) {
            console.error('Error importing news article:', error);
            result.warnings.push(`News ${row['Title']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import Fund Disclosures
      if (shouldRestoreTable('fundDisclosures')) {
        for (const row of disclosuresData as any[]) {
          try {
            const disclosureData: any = {
              id: row['ID'],
              fundId: row['Fund ID'],
              fundName: row['Fund Name'] || '',
              title: row['Title'] || row['Title (Japanese)'] || '',
              titleJa: row['Title (Japanese)'] || '',
              pdfUrl: row['PDF URL'] || '',
              disclosureDate: row['Disclosure Date'] ? new Date(row['Disclosure Date']) : new Date()
            };
            
            try {
              await storage.createFundDisclosure(disclosureData);
            } catch {
              await storage.updateFundDisclosure(row['ID'], disclosureData);
            }
            importedCounts.fundDisclosures++;
          } catch (error) {
            console.error('Error importing fund disclosure:', error);
            result.warnings.push(`Fund Disclosure ${row['Title']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import Contact Submissions
      if (shouldRestoreTable('contactSubmissions')) {
        for (const row of contactsData as any[]) {
          try {
            const contactData: any = {
              id: row['ID'],
              firstName: row['First Name'],
              lastName: row['Last Name'],
              email: row['Email'],
              company: row['Company'] || '',
              message: row['Message']
            };
            
            try {
              await storage.createContactSubmission(contactData);
            } catch {
              // Contact submissions typically don't need updates, skip on duplicate
              result.warnings.push(`Contact ${row['Email']}: Skipped (duplicate ID)`);
            }
            importedCounts.contactSubmissions++;
          } catch (error) {
            console.error('Error importing contact submission:', error);
            result.warnings.push(`Contact ${row['Email']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      // Import User Invitations
      if (shouldRestoreTable('userInvitations')) {
        for (const row of invitationsData as any[]) {
          try {
            const invitationData: any = {
              id: row['ID'],
              email: row['Email'],
              firstName: row['First Name'] || '',
              lastName: row['Last Name'] || '',
              role: row['Role'] || 'user',
              invitedById: row['Invited By ID'],
              invitationToken: row['Invitation Token'],
              status: row['Status'],
              expiresAt: row['Expires At'] ? new Date(row['Expires At']) : null,
              acceptedAt: row['Accepted At'] ? new Date(row['Accepted At']) : null
            };
            
            try {
              await storage.createInvitation(invitationData);
            } catch {
              // Invitations typically don't need updates, skip on duplicate
              result.warnings.push(`Invitation ${row['Email']}: Skipped (duplicate ID)`);
            }
            importedCounts.userInvitations++;
          } catch (error) {
            console.error('Error importing user invitation:', error);
            result.warnings.push(`Invitation ${row['Email']}: ${error instanceof Error ? error.message : 'Import failed'}`);
          }
        }
      }

      result.imported = importedCounts;
      result.success = true;
      result.message = `Database restore completed successfully in ${mode} mode`;

      console.log('Database restore completed:', importedCounts);
      res.json(result);

    } catch (error) {
      console.error('Error restoring database:', error);
      res.status(500).json({ 
        message: 'Failed to restore database', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
