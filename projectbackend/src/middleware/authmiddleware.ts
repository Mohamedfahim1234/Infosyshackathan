import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Interface } from "readline";
dotenv.config();

interface AuthRequest extends Request {
  user?: { id: string }; // Optional user property to hold decoded JWT info
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")as ({ id: string});
    req.user = decoded; // Attach user info to request object
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};  