import { Request, Response } from "express";
import BirthCertificate from "../../model/birthCertificate.model";

export const getBirthCertificates = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (userId) {
      const userBirthCertificates = await BirthCertificate.find({ userId });
      if (!userBirthCertificates || userBirthCertificates.length === 0) {
        return res.status(404).json({ message: "No birth certificates found for this user." });
      }
        return res.status(200).json({ message: "Birth certificates retrieved successfully.", birthCertificates: userBirthCertificates, success: true });
    }
    const birthCertificates = await BirthCertificate.find();
    res.status(200).json({ message: "Birth certificates retrieved successfully.", birthCertificates, success: true });
  } catch (error) {
    console.error("Error retrieving birth certificates:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const updateBirthCertificate = async (req: Request, res: Response) => {
  const { userId ,Isapproved, Isrejected } = req.body;

  console.log("Received data:", { userId, Isapproved, Isrejected });

  if (Isapproved === undefined || Isrejected === undefined) {
    return res.status(400).json({ message: "All details are required." });
  }

  try {
    const birthCertificate = await BirthCertificate.findByIdAndUpdate(userId, {
      Isapproved,
      Isrejected,
    });

    console.log("Updated Birth Certificate:", birthCertificate);

    if (!birthCertificate) {
      return res.status(404).json({ message: "Birth certificate not found." });
    }

    res.status(200).json({ message: "Birth certificate updated successfully.", birthCertificate, success: true });
  } catch (error) {
    console.error("Error updating birth certificate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}   