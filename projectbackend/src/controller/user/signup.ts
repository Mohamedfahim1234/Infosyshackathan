import { Request, Response } from "express";
import User from "../../model/user.model";

export const signup = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newUser = new User({
      name,
      email,
      phone,
      isVerified: false
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully.", user: newUser, success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

