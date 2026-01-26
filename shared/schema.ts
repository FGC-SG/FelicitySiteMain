import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // Hashed password
  role: varchar("role").default("member"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  message: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Portfolio table
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name").notNull(),
  companyNameJa: varchar("company_name_ja"),
  felicityCompany: varchar("felicity_company").notNull().default("felicity-singapore"), // felicity-singapore, felicity-japan
  fundName: varchar("fund_name"),
  industry: varchar("industry").notNull(),
  investmentType: varchar("investment_type").notNull(), // buyout, growth-equity, secondary
  country: varchar("country").notNull(),
  investmentYear: varchar("investment_year"), // MM/YYYY format
  status: varchar("status").notNull().default("ongoing"), // ongoing, exit
  description: text("description"),
  descriptionJa: text("description_ja"),
  website: varchar("website"),
  logoUrl: varchar("logo_url"),
  logoDisplayMode: varchar("logo_display_mode").notNull().default("auto"), // auto, light, dark - controls logo background display
  isVisible: boolean("is_visible").default(true), // Controls visibility on public Portfolio page
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const logoDisplayModeSchema = z.enum(["auto", "light", "dark"]);

export type InsertPortfolio = typeof portfolios.$inferInsert;
export type Portfolio = typeof portfolios.$inferSelect;

// Members table for company member profiles
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  company: varchar("company").notNull(),
  bio: varchar("bio", { length: 1000 }),
  photoUrl: varchar("photo_url"),
  displayOrder: integer("display_order").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertMember = typeof members.$inferInsert;
export type Member = typeof members.$inferSelect;

// Funds table
export const funds = pgTable("funds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name"),
  displayNameJa: varchar("display_name_ja"),
  description: text("description").notNull(),
  descriptionJa: text("description_ja"),
  status: varchar("status").notNull().default("active"), // active, inactive
  vintage: varchar("vintage", { length: 4 }), // Fund starting year (YYYY)
  felicityCompany: varchar("felicity_company").notNull().default("felicity-singapore"), // felicity-singapore, felicity-japan
  isVisible: boolean("is_visible").default(true), // Controls visibility on public Fund page
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Fund = typeof funds.$inferSelect;
export type InsertFund = typeof funds.$inferInsert;

// News articles table
export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: varchar("content").notNull(),
  titleJa: varchar("title_ja"),
  contentJa: varchar("content_ja"),
  attachmentUrl: varchar("attachment_url"), // English attachment - OneDrive or other file URL
  attachmentUrlJa: varchar("attachment_url_ja"), // Japanese attachment - OneDrive or other file URL
  language: varchar("language").notNull(),
  category: varchar("category").notNull(),
  felicityCompany: varchar("felicity_company").notNull().default("felicity-singapore"), // felicity-singapore, felicity-japan
  tags: varchar("tags"),
  authorId: varchar("author_id").references(() => users.id),
  isVisible: boolean("is_visible").default(true), // Controls visibility on public News page
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// User invitations table for one-click invitation system
export const userInvitations = pgTable("user_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("user"),
  invitedById: varchar("invited_by_id").notNull().references(() => users.id),
  invitationToken: varchar("invitation_token").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = typeof userInvitations.$inferInsert;

export const insertUserInvitationSchema = createInsertSchema(userInvitations).pick({
  email: true,
  firstName: true,
  lastName: true,
  role: true,
});

// Password reset table for secure password reset functionality
export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resetToken: varchar("reset_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

// Fund disclosures table for PDF document uploads  
export const fundDisclosures = pgTable("fund_disclosures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fundId: varchar("fund_id").references(() => funds.id), // Reference to specific fund (nullable initially)
  descriptionJa: text("description_ja"),
  pdfUrl: varchar("pdf_url").notNull(), // Path to uploaded PDF file
  publishedAt: timestamp("published_at").notNull(),
  disclosureType: varchar("disclosure_type").notNull().default("business-report"), // business-report, semi-annual-report
  isVisible: boolean("is_visible").default(true), // Controls visibility on public Fund Disclosure page
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FundDisclosure = typeof fundDisclosures.$inferSelect;
export type InsertFundDisclosure = typeof fundDisclosures.$inferInsert;

// Site settings table for global configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
