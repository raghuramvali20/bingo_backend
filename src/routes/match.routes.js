import express from "express";
import {protect} from "../middleware/auth.middleware.js"
import { recordMatchResult,getLeaderBoard, getMatchHistory} from "../controllers/match.controller.js";

const router = express.Router();

router.post("/record", protect, recordMatchResult);
router.get("/leaderboard", getLeaderBoard);
router.get("/history", protect, getMatchHistory);

export default router;