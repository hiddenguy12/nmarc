
import { acceptFriendRequest, cancelFriendRequest, getFriendsList, rejectFriendRequest, sendFriendRequest, unfriendUser } from "../controllers/friend.controller";
import { validateUser } from "../lib/middlewares/auth.middleware";
import express from "express";




const router = express.Router();
// Send Friend Request
router.put("/friend-request/send/:id", validateUser, sendFriendRequest);
// Accept friend request
router.put("/friend-request/accept/:id", validateUser, acceptFriendRequest);

// Reject friend request
router.put("/friend-request/reject/:id", validateUser, rejectFriendRequest);

// Cancel sent friend request
router.put("/friend-request/cancel/:id", validateUser, cancelFriendRequest);

// Unfriend user
router.put("/friend/unfriend/:id", validateUser, unfriendUser);

// Get current user's friends list
router.get("/friends", validateUser, getFriendsList);

export const friendRoutes = router;
