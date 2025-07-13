import { Request, Response } from "express";
import User from "../../model/user.model";
import { Email } from "../../controller/user/email";
import jwt from "jsonwebtoken";

// export const login = async (req: Request, res: Response) => {
//   const { email, phone } = req.body;

//   if (!email || !phone) {
//     return res.status(400).json({ message: "Email and phone are required." });
//   }

//   try {
//     const user = await User.findOne({ email, phone });
//     if (!user) {    
//       return res.status(404).json({ message: "User not found." });
//     }   
//     if (!user.isVerified) {
//       return res.status(403).json({ message: "User is not verified." });
//     }



// }catch (error) {
//     console.error("Error during login:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// }


export const sendEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email ) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }   
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    user.otp = otp;
    await user.save();

    await Email(email, "Your OTP Code", `Your OTP code is: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully.", success: true });

}catch (error) {
    console.error("Error during email sending:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const user = await User.findOne({ email, otp });
    if (!user) {
      return res.status(404).json({ message: "Invalid OTP or user not found." });
    }

    if(!otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.isVerified = true;
    user.otp = ""; 
    await user.save();

    if(!process.env.JWT_SECRET_USER) {
      return res.status(500).json({ message: "JWT secret not configured." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_USER, {
      expiresIn: "15h"  
    });
    res.status(200).json({ message: "OTP verified successfully.", token, user, success: true });

  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};