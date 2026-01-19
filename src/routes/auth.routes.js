import express from "express";
import { socialLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/social-login", socialLogin)

export default router;