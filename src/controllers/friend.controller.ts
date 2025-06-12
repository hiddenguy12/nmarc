import AppError from "../errors/AppError";
import { Request, Response } from "express";
import { User } from "../models/user";
import mongoose from "mongoose";

// ✅ Send Friend Request
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.authSession?.user;
    const targetUserId = req.params.id;

    if (!currentUserId) throw new AppError(401, "User not authenticated");
    if (currentUserId.toString() === targetUserId)
      throw new AppError(400, "You cannot send a friend request to yourself");

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser || !targetUser) throw new AppError(404, "User not found");

    if (
      targetUser.friendRequests.some((id) => id.toString() === currentUserId.toString()) ||
      currentUser.sentRequests.some((id) => id.toString() === targetUserId.toString())
    ) {
      throw new AppError(400, "Friend request already sent");
    }

    targetUser.friendRequests.push(new mongoose.Types.ObjectId(currentUserId));
    currentUser.sentRequests.push(new mongoose.Types.ObjectId(targetUserId));

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({ success: true, message: "Friend request sent." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ✅ Accept Friend Request
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.authSession?.user;
    const senderId = req.params.id;

    if (!currentUserId) throw new AppError(401, "User not authenticated");

    const [currentUser, senderUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(senderId),
    ]);

    if (!currentUser || !senderUser) throw new AppError(404, "User not found");

    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== senderId
    );
    senderUser.sentRequests = senderUser.sentRequests.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    if (!currentUser.friends.some((id) => id.toString() === senderId)) {
      currentUser.friends.push(new mongoose.Types.ObjectId(senderId));
    }

    if (!senderUser.friends.some((id) => id.toString() === currentUserId.toString())) {
      senderUser.friends.push(new mongoose.Types.ObjectId(currentUserId));
    }

    await Promise.all([currentUser.save(), senderUser.save()]);

    res.status(200).json({ success: true, message: "Friend request accepted." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ✅ Reject Friend Request
export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.authSession?.user;
    const senderId = req.params.id;

    if (!currentUserId) throw new AppError(401, "User not authenticated");

    const [currentUser, senderUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(senderId),
    ]);

    if (!currentUser || !senderUser) throw new AppError(404, "User not found");

    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== senderId
    );
    senderUser.sentRequests = senderUser.sentRequests.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), senderUser.save()]);

    res.status(200).json({ success: true, message: "Friend request rejected." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ✅ Cancel Sent Friend Request
export const cancelFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.authSession?.user;
    const receiverId = req.params.id;

    if (!senderId) throw new AppError(401, "User not authenticated");

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!sender || !receiver) throw new AppError(404, "User not found");

    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId.toString()
    );

    await Promise.all([sender.save(), receiver.save()]);

    res.status(200).json({ success: true, message: "Friend request canceled." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ✅ Unfriend
export const unfriendUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.authSession?.user;
    const friendId = req.params.id;

    if (!currentUserId) throw new AppError(401, "User not authenticated");

    const [currentUser, friendUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId),
    ]);

    if (!currentUser || !friendUser) throw new AppError(404, "User not found");

    currentUser.friends = currentUser.friends.filter(
      (id) => id.toString() !== friendId
    );
    friendUser.friends = friendUser.friends.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), friendUser.save()]);

    res.status(200).json({ success: true, message: "Unfriended successfully." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ✅ Get Friends List
export const getFriendsList = async (req: Request, res: Response) => {
  try {
    const userId = req.authSession?.user;
    if (!userId) throw new AppError(401, "User not authenticated");

    const user = await User.findById(userId).populate("friends", "name email avatar");
    if (!user) throw new AppError(404, "User not found");

    res.status(200).json({ success: true, friends: user.friends });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
