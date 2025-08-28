import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
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
  role: varchar("role").default("member"),
  department: varchar("department"),
  title: varchar("title"),
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

// News articles table
export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: varchar("description"),
  content: varchar("content").notNull(),
  language: varchar("language").notNull(),
  category: varchar("category").notNull(),
  tags: varchar("tags"),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
