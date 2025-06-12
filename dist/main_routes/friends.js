"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRoutes = void 0;
const friend_controller_1 = require("../controllers/friend.controller");
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Accept friend request
router.put("/friend-request/accept/:id", auth_middleware_1.validateUser, friend_controller_1.acceptFriendRequest);
// Reject friend request
router.put("/friend-request/reject/:id", auth_middleware_1.validateUser, friend_controller_1.rejectFriendRequest);
// Cancel sent friend request
router.put("/friend-request/cancel/:id", auth_middleware_1.validateUser, friend_controller_1.cancelFriendRequest);
// Unfriend user
router.put("/friend/unfriend/:id", auth_middleware_1.validateUser, friend_controller_1.unfriendUser);
// Get current user's friends list
router.get("/friends", auth_middleware_1.validateUser, friend_controller_1.getFriendsList);
exports.friendRoutes = router;
