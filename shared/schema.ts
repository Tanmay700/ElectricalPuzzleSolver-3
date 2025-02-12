import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").notNull().default(0),
  solvedCount: integer("solved_count").notNull().default(0)
});

// Define the circuit data schema
export const circuitNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string()
});

export const circuitEdgeSchema = z.object({
  source: z.string(),
  target: z.string()
});

export const circuitDataSchema = z.object({
  nodes: z.array(circuitNodeSchema),
  edges: z.array(circuitEdgeSchema)
});

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty", { enum: ["Easy", "Medium", "Hard"] }).notNull(),
  points: integer("points").notNull(),
  circuitData: jsonb("circuit_data").notNull(),
  solution: jsonb("solution").notNull()
});

export const userSolutions = pgTable("user_solutions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  solved: boolean("solved").notNull().default(false),
  attempts: integer("attempts").notNull().default(0)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type UserSolution = typeof userSolutions.$inferSelect;
export type CircuitData = z.infer<typeof circuitDataSchema>;