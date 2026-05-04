import express from "express";
import * as tokenController from "../controllers/tokenController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/balance", authenticate, tokenController.getUserTokens);
router.post("/redeem", authenticate, tokenController.redeemTokens);
router.get("/leaderboard", tokenController.getLeaderboard);
router.post("/bonus", authenticate, tokenController.addBonus);

export default router;
