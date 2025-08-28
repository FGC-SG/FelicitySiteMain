import {
  users,
  contactSubmissions,
  newsArticles,
  members,
  userInvitations,
  passwordResets,
  type User,
  type UpsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsArticle,
  type InsertNewsArticle,
  type Member,
  type InsertMember,
  type UserInvitation,
  type InsertUserInvitation,
  type PasswordReset,
  type InsertPasswordReset,
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
  updateNewsArticle(id: string, updates: Partial<InsertNewsArticle>): Promise<NewsArticle | null>;
  deleteNewsArticle(id: string): Promise<boolean>;
  
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
  
  // User invitation operations
  createInvitation(invitationData: InsertUserInvitation): Promise<UserInvitation>;
  getInvitations(): Promise<UserInvitation[]>;
  getInvitationByToken(token: string): Promise<UserInvitation | undefined>;
  acceptInvitation(token: string, password: string): Promise<User>;
  deleteInvitation(id: string): Promise<void>;
  
  // Password reset operations
  createPasswordReset(userId: string): Promise<PasswordReset>;
  getPasswordResetByToken(token: string): Promise<PasswordReset | undefined>;
  resetPassword(token: string, newPassword: string): Promise<User>;
  deletePasswordReset(id: string): Promise<void>;
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
    // Ensure all date fields are proper Date objects
    const articleData = {
      ...article,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      createdAt: article.createdAt ? new Date(article.createdAt) : new Date(),
      updatedAt: article.updatedAt ? new Date(article.updatedAt) : new Date()
    };
    
    const [result] = await db.insert(newsArticles).values(articleData).returning();
    return result;
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles).orderBy(desc(newsArticles.publishedAt));
  }

  async updateNewsArticle(id: string, updates: Partial<InsertNewsArticle>): Promise<NewsArticle | null> {
    try {
      const [updatedArticle] = await db
        .update(newsArticles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(newsArticles.id, id))
        .returning();
      return updatedArticle || null;
    } catch (error) {
      console.error("Error updating news article:", error);
      return null;
    }
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    const [deletedArticle] = await db
      .delete(newsArticles)
      .where(eq(newsArticles.id, id))
      .returning();
    return !!deletedArticle;
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

  // User invitation operations
  async createInvitation(invitationData: InsertUserInvitation): Promise<UserInvitation> {
    const inviteWithToken = {
      ...invitationData,
      invitationToken: this.generateInvitationToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };
    const [invitation] = await db.insert(userInvitations).values(inviteWithToken).returning();
    return invitation;
  }

  async getInvitations(): Promise<UserInvitation[]> {
    return await db.select().from(userInvitations).orderBy(desc(userInvitations.createdAt));
  }

  async getInvitationByToken(token: string): Promise<UserInvitation | undefined> {
    const [invitation] = await db.select().from(userInvitations).where(eq(userInvitations.invitationToken, token));
    return invitation;
  }

  async acceptInvitation(token: string, password: string): Promise<User> {
    const invitation = await this.getInvitationByToken(token);
    if (!invitation || invitation.status !== "pending" || new Date() > invitation.expiresAt!) {
      throw new Error("Invalid or expired invitation");
    }

    // Create the user account
    const userData: UpsertUser = {
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      role: invitation.role,
      password: password, // This will be hashed in the route handler
    };

    const user = await this.createUser(userData);

    // Mark invitation as accepted
    await db
      .update(userInvitations)
      .set({ 
        status: "accepted",
        acceptedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userInvitations.invitationToken, token));

    return user;
  }

  async deleteInvitation(id: string): Promise<void> {
    await db.delete(userInvitations).where(eq(userInvitations.id, id));
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Password reset operations
  async createPasswordReset(userId: string): Promise<PasswordReset> {
    const resetData = {
      userId,
      resetToken: this.generateResetToken(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    };
    const [reset] = await db.insert(passwordResets).values(resetData).returning();
    return reset;
  }

  async getPasswordResetByToken(token: string): Promise<PasswordReset | undefined> {
    const [reset] = await db.select().from(passwordResets).where(eq(passwordResets.resetToken, token));
    return reset;
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const reset = await this.getPasswordResetByToken(token);
    if (!reset || reset.usedAt || new Date() > reset.expiresAt!) {
      throw new Error("Invalid or expired reset token");
    }

    // Update user's password
    const [user] = await db
      .update(users)
      .set({ 
        password: newPassword, // This will be hashed in the route handler
        updatedAt: new Date()
      })
      .where(eq(users.id, reset.userId))
      .returning();

    // Mark reset token as used
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.resetToken, token));

    return user;
  }

  async deletePasswordReset(id: string): Promise<void> {
    await db.delete(passwordResets).where(eq(passwordResets.id, id));
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

export const storage = new DatabaseStorage();
