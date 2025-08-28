import {
  users,
  contactSubmissions,
  newsArticles,
  members,
  type User,
  type UpsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsArticle,
  type InsertNewsArticle,
  type Member,
  type InsertMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // News operations
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  getNewsArticles(): Promise<NewsArticle[]>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // User management operations
  createUser(userData: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Member management operations
  createMember(memberData: InsertMember): Promise<Member>;
  getAllMembers(): Promise<Member[]>;
  updateMember(id: string, memberData: Partial<InsertMember>): Promise<Member>;
  deleteMember(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [result] = await db.insert(contactSubmissions).values(submission).returning();
    return result;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [result] = await db.insert(newsArticles).values(article).returning();
    return result;
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles).orderBy(desc(newsArticles.createdAt));
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createMember(memberData: InsertMember): Promise<Member> {
    const [member] = await db.insert(members).values(memberData).returning();
    return member;
  }

  async getAllMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(desc(members.displayOrder), desc(members.createdAt));
  }

  async updateMember(id: string, memberData: Partial<InsertMember>): Promise<Member> {
    const [member] = await db
      .update(members)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  async deleteMember(id: string): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }
}

export const storage = new DatabaseStorage();
