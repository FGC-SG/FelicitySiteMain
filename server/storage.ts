import { User, InsertUser, Session, InsertSession, Contact, InsertContact } from "@shared/schema";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | null>;
  deleteSession(token: string): Promise<void>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private sessions: Session[] = [];
  private contacts: Contact[] = [];

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const newSession: Session = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.sessions.push(newSession);
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const session = this.sessions.find(s => s.token === token);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      // Remove expired session
      this.sessions = this.sessions.filter(s => s.token !== token);
    }
    return null;
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.token !== token);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.contacts.push(newContact);
    return newContact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return this.contacts;
  }
}