import { Router } from "express";
import { login } from "../controller/officer/login";
import { signup } from "../controller/officer/signup";
import { getBirthCertificates, updateBirthCertificate } from "../controller/officer/birthCertificate";

const officerRouter = Router(); 

officerRouter.post("/login", login);
officerRouter.post("/signup", signup);
officerRouter.post("/certificates", getBirthCertificates);
officerRouter.put("/birthcertificates/update", updateBirthCertificate); // Assuming this is for updating birth certificates

export default officerRouter;