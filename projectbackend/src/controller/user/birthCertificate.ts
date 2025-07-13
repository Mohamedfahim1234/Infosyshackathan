import { Request, Response } from "express";
import BirthCertificate from "../../model/birthCertificate.model";

export const createBirthCertificate = async (req: Request, res: Response) => {
  const { childName, DOB, fatherName, motherName, address, parentNativity } = req.body;

  if (!childName || !DOB || !fatherName || !motherName || !address || !parentNativity) {
    return res.status(400).json({ message: "All details are required." });
  }

  try {
    const birthCertificate = new BirthCertificate({
        childName,
        DOB,
        fatherName,
        motherName,
        address,
        parentNativity,
        parentIdProof: (req as Request & { files?: any }).files?.parentIdProof?.[0]?.path || "",
        medicalCertificate: (req as Request & { files?: any }).files?.medicalCertificate?.[0]?.path || ""
    });

    await birthCertificate.save();
    res.status(201).json({ message: "Birth certificate created successfully.", birthCertificate, success: true });
  } catch (error) {
    console.error("Error creating birth certificate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}