import express from "express";
import * as analysisController from "../controllers/analysisController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/analyze", authenticate, analysisController.analyzeWebsite);
router.get("/history", authenticate, analysisController.getAnalysisHistory);
router.get("/detail/:analysisId", authenticate, analysisController.getAnalysisDetail);

export default router;
