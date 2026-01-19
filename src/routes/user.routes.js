import express from "express";
import { 
    getUserProfile, 
    searchUsers, 
    sendFriendRequest,
    respondFriendRequest 
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Now the routes just call the functions from the controller
router.get("/profile", protect, getUserProfile);
router.get("/search", protect, searchUsers);
router.post("/add-friend", protect, sendFriendRequest);
router.post("/respond-friend-request", protect, respondFriendRequest);

export default router;