"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriendsList = exports.unfriendUser = exports.cancelFriendRequest = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const AppError_1 = __importDefault(require("@/errors/AppError"));
const user_1 = require("@/models/user");
const mongoose_1 = __importDefault(require("mongoose"));
// ✅ Send Friend Request
const sendFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.authSession?.user;
        const targetUserId = req.params.id;
        if (!currentUserId)
            throw new AppError_1.default(401, "User not authenticated");
        if (currentUserId.toString() === targetUserId)
            throw new AppError_1.default(400, "You cannot send a friend request to yourself");
        const [currentUser, targetUser] = await Promise.all([
            user_1.User.findById(currentUserId),
            user_1.User.findById(targetUserId),
        ]);
        if (!currentUser || !targetUser)
            throw new AppError_1.default(404, "User not found");
        if (targetUser.friendRequests.some((id) => id.toString() === currentUserId.toString()) ||
            currentUser.sentRequests.some((id) => id.toString() === targetUserId.toString())) {
            throw new AppError_1.default(400, "Friend request already sent");
        }
        targetUser.friendRequests.push(new mongoose_1.default.Types.ObjectId(currentUserId));
        currentUser.sentRequests.push(new mongoose_1.default.Types.ObjectId(targetUserId));
        await Promise.all([currentUser.save(), targetUser.save()]);
        res.status(200).json({ success: true, message: "Friend request sent." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.sendFriendRequest = sendFriendRequest;
// ✅ Accept Friend Request
const acceptFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.authSession?.user;
        const senderId = req.params.id;
        if (!currentUserId)
            throw new AppError_1.default(401, "User not authenticated");
        const [currentUser, senderUser] = await Promise.all([
            user_1.User.findById(currentUserId),
            user_1.User.findById(senderId),
        ]);
        if (!currentUser || !senderUser)
            throw new AppError_1.default(404, "User not found");
        currentUser.friendRequests = currentUser.friendRequests.filter((id) => id.toString() !== senderId);
        senderUser.sentRequests = senderUser.sentRequests.filter((id) => id.toString() !== currentUserId.toString());
        if (!currentUser.friends.some((id) => id.toString() === senderId)) {
            currentUser.friends.push(new mongoose_1.default.Types.ObjectId(senderId));
        }
        if (!senderUser.friends.some((id) => id.toString() === currentUserId.toString())) {
            senderUser.friends.push(new mongoose_1.default.Types.ObjectId(currentUserId));
        }
        await Promise.all([currentUser.save(), senderUser.save()]);
        res.status(200).json({ success: true, message: "Friend request accepted." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.acceptFriendRequest = acceptFriendRequest;
// ✅ Reject Friend Request
const rejectFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.authSession?.user;
        const senderId = req.params.id;
        if (!currentUserId)
            throw new AppError_1.default(401, "User not authenticated");
        const [currentUser, senderUser] = await Promise.all([
            user_1.User.findById(currentUserId),
            user_1.User.findById(senderId),
        ]);
        if (!currentUser || !senderUser)
            throw new AppError_1.default(404, "User not found");
        currentUser.friendRequests = currentUser.friendRequests.filter((id) => id.toString() !== senderId);
        senderUser.sentRequests = senderUser.sentRequests.filter((id) => id.toString() !== currentUserId.toString());
        await Promise.all([currentUser.save(), senderUser.save()]);
        res.status(200).json({ success: true, message: "Friend request rejected." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.rejectFriendRequest = rejectFriendRequest;
// ✅ Cancel Sent Friend Request
const cancelFriendRequest = async (req, res) => {
    try {
        const senderId = req.authSession?.user;
        const receiverId = req.params.id;
        if (!senderId)
            throw new AppError_1.default(401, "User not authenticated");
        const [sender, receiver] = await Promise.all([
            user_1.User.findById(senderId),
            user_1.User.findById(receiverId),
        ]);
        if (!sender || !receiver)
            throw new AppError_1.default(404, "User not found");
        sender.sentRequests = sender.sentRequests.filter((id) => id.toString() !== receiverId);
        receiver.friendRequests = receiver.friendRequests.filter((id) => id.toString() !== senderId.toString());
        await Promise.all([sender.save(), receiver.save()]);
        res.status(200).json({ success: true, message: "Friend request canceled." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.cancelFriendRequest = cancelFriendRequest;
// ✅ Unfriend
const unfriendUser = async (req, res) => {
    try {
        const currentUserId = req.authSession?.user;
        const friendId = req.params.id;
        if (!currentUserId)
            throw new AppError_1.default(401, "User not authenticated");
        const [currentUser, friendUser] = await Promise.all([
            user_1.User.findById(currentUserId),
            user_1.User.findById(friendId),
        ]);
        if (!currentUser || !friendUser)
            throw new AppError_1.default(404, "User not found");
        currentUser.friends = currentUser.friends.filter((id) => id.toString() !== friendId);
        friendUser.friends = friendUser.friends.filter((id) => id.toString() !== currentUserId.toString());
        await Promise.all([currentUser.save(), friendUser.save()]);
        res.status(200).json({ success: true, message: "Unfriended successfully." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.unfriendUser = unfriendUser;
// ✅ Get Friends List
const getFriendsList = async (req, res) => {
    try {
        const userId = req.authSession?.user;
        if (!userId)
            throw new AppError_1.default(401, "User not authenticated");
        const user = await user_1.User.findById(userId).populate("friends", "name email avatar");
        if (!user)
            throw new AppError_1.default(404, "User not found");
        res.status(200).json({ success: true, friends: user.friends });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.getFriendsList = getFriendsList;
