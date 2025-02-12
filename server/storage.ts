import { User, InsertUser, Problem, UserSolution } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

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
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private problems: Map<number, Problem>;
  private userSolutions: Map<string, UserSolution>;
  sessionStore: session.SessionStore;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.problems = new Map();
    this.userSolutions = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });

    // Initialize with some sample problems
    this.initializeProblems();
  }

  private initializeProblems() {
    const sampleProblems: Problem[] = [
      {
        id: 1,
        title: "Simple RC Circuit",
        description: "Calculate the time constant of this RC circuit",
        difficulty: "Easy",
        points: 10,
        circuitData: {
          nodes: [
            { id: '1', type: 'resistor', value: '1k' },
            { id: '2', type: 'capacitor', value: '1uF' }
          ],
          edges: [
            { source: '1', target: '2' }
          ]
        },
        solution: { timeConstant: 0.001 }
      },
      // Add more sample problems here
    ];

    sampleProblems.forEach(p => this.problems.set(p.id, p));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, points: 0, solvedCount: 0 };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      points: user.points + points,
      solvedCount: user.solvedCount + 1
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getProblems(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    return this.problems.get(id);
  }

  async getUserSolution(userId: number, problemId: number): Promise<UserSolution | undefined> {
    const key = `${userId}-${problemId}`;
    return this.userSolutions.get(key);
  }

  async saveUserSolution(userId: number, problemId: number, solved: boolean): Promise<UserSolution> {
    const key = `${userId}-${problemId}`;
    const existing = this.userSolutions.get(key);
    
    const solution: UserSolution = {
      id: existing?.id || this.currentId++,
      userId,
      problemId,
      solved,
      attempts: (existing?.attempts || 0) + 1
    };
    
    this.userSolutions.set(key, solution);
    return solution;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  }
}

export const storage = new MemStorage();
