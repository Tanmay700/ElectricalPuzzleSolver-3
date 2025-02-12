import { User, InsertUser, Problem, UserSolution, users, problems, userSolutions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;

  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;

  getUserSolution(userId: number, problemId: number): Promise<UserSolution | undefined>;
  saveUserSolution(userId: number, problemId: number, solved: boolean): Promise<UserSolution>;

  getLeaderboard(): Promise<User[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        points: points,
        solvedCount: db.raw('solved_count + 1')
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getProblems(): Promise<Problem[]> {
    return await db.select().from(problems);
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.id, id));
    return problem;
  }

  async getUserSolution(userId: number, problemId: number): Promise<UserSolution | undefined> {
    const [solution] = await db
      .select()
      .from(userSolutions)
      .where(eq(userSolutions.userId, userId))
      .where(eq(userSolutions.problemId, problemId));
    return solution;
  }

  async saveUserSolution(userId: number, problemId: number, solved: boolean): Promise<UserSolution> {
    const existing = await this.getUserSolution(userId, problemId);
    if (existing) {
      const [solution] = await db
        .update(userSolutions)
        .set({
          solved,
          attempts: existing.attempts + 1
        })
        .where(eq(userSolutions.id, existing.id))
        .returning();
      return solution;
    } else {
      const [solution] = await db
        .insert(userSolutions)
        .values({
          userId,
          problemId,
          solved,
          attempts: 1
        })
        .returning();
      return solution;
    }
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.points)
      .limit(10);
  }
}

export const storage = new DatabaseStorage();