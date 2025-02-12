import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { problems } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from "express";


const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Create uploads directory if it doesn't exist
  app.use('/uploads', express.static('uploads'));

  // Create new problem
  app.post("/api/problems", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const problemData = JSON.parse(req.body.data);
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const problem = await storage.createProblem({
        ...problemData,
        imageUrl
      });

      res.status(201).json(problem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

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