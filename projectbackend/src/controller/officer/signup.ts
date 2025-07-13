import { Request, Response } from "express";
import Officer from "../../model/officer.model";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if officer already exists
    const existingOfficer = await Officer.findOne({ email });
    if (existingOfficer) {
      return res.status(409).json({ message: "Officer already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOfficer = new Officer({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await newOfficer.save();
    res.status(201).json({ message: "Officer created successfully.", officer: newOfficer, success: true });
  } catch (error) {
    console.error("Error creating officer:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

