import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// User schema for authentication
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  name: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const insertUserSchema = createInsertSchema(userSchema).omit({
  id: true,
  createdAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Session schema
export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});

export const insertSessionSchema = createInsertSchema(sessionSchema).omit({
  id: true,
  createdAt: true,
});

export type Session = z.infer<typeof sessionSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Contact form schema
export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export const insertContactSchema = createInsertSchema(contactSchema).omit({
  id: true,
  createdAt: true,
});

export type Contact = z.infer<typeof contactSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginForm = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterForm = z.infer<typeof registerSchema>;