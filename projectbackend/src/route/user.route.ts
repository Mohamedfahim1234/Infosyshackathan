import { Router } from "express";
import multer from "multer";
import { signup } from "../controller/user/signup";
import { sendEmail, verifyOtp } from "../controller/user/login";
import { createBirthCertificate } from "../controller/user/birthCertificate";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/'); // Specify the directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Use a unique filename
    }
});

const upload = multer({ storage });

router.post("/signup", signup);
router.post("/sendmail", sendEmail);
router.post("/verifyotp", verifyOtp); 
router.post("/upload", upload.fields([
    { name: 'parentIdProof', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 }
]), createBirthCertificate);

export default router;