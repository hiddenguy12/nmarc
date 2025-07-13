"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_1 = require("../models/post");
const multer_1 = require("../config/multer");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Utility: Populate user info for posts/comments
const populateUserFields = [
    { path: 'userId', select: 'name profileImage.url' },
    { path: 'comments.userId', select: 'name profileImage.url' },
    { path: 'comments.replies.userId', select: 'name profileImage.url' },
];
/**
 * @route POST /post
 * @desc Create a new post (with optional image upload)
 * @access Authenticated users only
 */
router.post('/', auth_middleware_1.validateUser, multer_1.upload.single('image'), async (req, res) => {
    try {
        const { content, category } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        let image = undefined;
        if (req.file) {
            const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                unique_filename: true,
                resource_type: 'image',
                transformation: ['media_lib_thumb'],
            });
            image = {
                url: result.url,
                public_id: result.public_id,
            };
        }
        const post = await post_1.Post.create({
            userId,
            content,
            category,
            image,
        });
        await post.populate(populateUserFields);
        return res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to create post', error });
    }
});
/**
 * @route GET /post/search
 * @desc Search posts by content or category
 * @access Public
 */
router.get('/search', async (req, res) => {
    try {
        const { q, category } = req.query;
        const filter = { isDeleted: false };
        if (q)
            filter.content = { $regex: q, $options: 'i' };
        if (category)
            filter.category = category;
        const posts = await post_1.Post.find(filter).populate(populateUserFields).sort({ createdAt: -1 });
        return res.json({ success: true, data: posts });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to search posts', error });
    }
});
/**
 * @route GET /post/:id
 * @desc Get a single post by ID (with user info)
 * @access Public
 */
router.get('/:id', async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        const post = await post_1.Post.findById(req.params.id).populate(populateUserFields);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        return res.json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get post', error });
    }
});
/**
 * @route PUT /post/:id
 * @desc Update a post (only by owner)
 * @access Authenticated users only
 */
router.put('/:id', auth_middleware_1.validateUser, multer_1.upload.single('image'), async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        const userId = req.user?._id;
        if (!userId || !post.userId || post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const { content, category } = req.body;
        if (content)
            post.content = content;
        if (category)
            post.category = category;
        if (req.file) {
            const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                unique_filename: true,
                resource_type: 'image',
                transformation: ['media_lib_thumb'],
            });
            post.image = {
                url: result.url,
                public_id: result.public_id,
            };
        }
        post.updatedAt = new Date();
        await post.save();
        await post.populate(populateUserFields);
        return res.json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update post', error });
    }
});
/**
 * @route DELETE /post/:id
 * @desc Delete a post (only by owner)
 * @access Authenticated users only
 */
router.delete('/:id', auth_middleware_1.validateUser, async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        const userId = req.user?._id;
        if (!userId || !post.userId || post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        post.isDeleted = true;
        await post.save();
        return res.json({ success: true, message: 'Post deleted' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete post', error });
    }
});
/**
 * @route POST /post/:id/like
 * @desc Like or unlike a post
 * @access Authenticated users only
 */
router.post('/:id/like', auth_middleware_1.validateUser, async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // Check if user already liked
        const alreadyLiked = post.likesIDs.map((id) => id.toString()).includes(userId.toString());
        if (alreadyLiked) {
            // Remove like using DocumentArray method
            post.likesIDs.pull(userId);
            post.likesCount = Math.max(0, typeof post.likesCount === 'number' ? post.likesCount - 1 : 0);
        }
        else {
            // Add like using DocumentArray method
            if (typeof post.likesIDs.addToSet === 'function') {
                post.likesIDs.addToSet(userId);
            }
            else {
                post.likesIDs.push(userId);
            }
            post.likesCount = typeof post.likesCount === 'number' ? post.likesCount + 1 : 1;
        }
        await post.save();
        return res.json({ success: true, liked: !alreadyLiked, likesCount: post.likesCount });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to like/unlike post', error });
    }
});
/**
 * @route POST /post/:id/comment
 * @desc Add a comment to a post
 * @access Authenticated users only
 */
router.post('/:id/comment', auth_middleware_1.validateUser, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ success: false, message: 'Content is required' });
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const post = await post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        const comment = {
            userId,
            content,
            replies: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (!Array.isArray(post.comments))
            post.comments = [];
        post.comments.push(comment);
        post.commentsCount = post.comments.length;
        await post.save();
        await post.populate(populateUserFields);
        return res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to add comment', error });
    }
});
/**
 * @route POST /post/:postId/comment/:commentId/reply
 * @desc Add a reply to a comment
 * @access Authenticated users only
 */
router.post('/:postId/comment/:commentId/reply', auth_middleware_1.validateUser, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ success: false, message: 'Content is required' });
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const post = await post_1.Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        if (!Array.isArray(post.comments))
            post.comments = [];
        const comment = post.comments.find((c) => c._id && c._id.toString() === req.params.commentId);
        if (!comment)
            return res.status(404).json({ success: false, message: 'Comment not found' });
        if (!Array.isArray(comment.replies))
            comment.replies = [];
        comment.replies.push({
            userId,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        post.commentsCount = post.comments.length;
        await post.save();
        await post.populate(populateUserFields);
        return res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to add reply', error });
    }
});
/**
 * @route GET /post
 * @desc Get paginated list of posts (with user info)
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        let { offset = 0, limit = 10 } = req.query;
        offset = parseInt(offset, 10);
        limit = parseInt(limit, 10);
        const filter = { isDeleted: false };
        const total = await post_1.Post.countDocuments(filter);
        const posts = await post_1.Post.find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate(populateUserFields);
        return res.json({
            success: true,
            total,
            offset,
            limit,
            data: posts,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get posts', error });
    }
});
exports.default = router;
