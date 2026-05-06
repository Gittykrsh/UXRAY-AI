import express from "express";
import * as authController from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);

export default router;
