import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get all problems
  app.get("/api/problems", async (_req, res) => {
    const problems = await storage.getProblems();
    res.json(problems);
  });

  // Get specific problem
  app.get("/api/problems/:id", async (req, res) => {
    const problem = await storage.getProblem(Number(req.params.id));
    if (!problem) return res.status(404).send("Problem not found");
    res.json(problem);
  });

  // Submit solution
  app.post("/api/problems/:id/submit", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const problemId = Number(req.params.id);
    const problem = await storage.getProblem(problemId);
    if (!problem) return res.status(404).send("Problem not found");

    const solution = req.body.solution;
    const isCorrect = Math.abs(solution - problem.solution.timeConstant) < 0.001;
    
    await storage.saveUserSolution(req.user!.id, problemId, isCorrect);
    
    if (isCorrect) {
      const existingSolution = await storage.getUserSolution(req.user!.id, problemId);
      if (!existingSolution?.solved) {
        const updatedUser = await storage.updateUserPoints(req.user!.id, problem.points);
        return res.json({ correct: true, user: updatedUser });
      }
    }
    
    res.json({ correct: isCorrect });
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  const httpServer = createServer(app);
  return httpServer;
}
