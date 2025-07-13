import { Request, Response } from "express";
import Officer from "../../model/officer.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find officer by email
    const officer = await Officer.findOne({ email });
    if (!officer) {
      return res.status(404).json({ message: "Officer not found." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if(!process.env.JWT_SECRET_OFFICER) {
      return res.status(500).json({ message: "JWT secret not configured." });
    }
    // Generate JWT token
    const token = jwt.sign({ id: officer._id }, process.env.JWT_SECRET_OFFICER, {
      expiresIn: "15h" 
    });
    res.status(200).json({ message: "Login successful.", token, officer, success: true });
  } catch (error) {
    console.error("Error during officer login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};