import mongoose, { Schema, Types } from 'mongoose';

// Comment Reply Schema
const replySchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'VideoProfile', required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

// Comment Schema
const commentSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'VideoProfile', required: true },
  content: { type: String, required: true, trim: true },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

// Post Schema
const postSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'VideoProfile', required: true, index: true },
  content: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: 'general' },
  image: {
    url: { type: String },
    public_id: { type: String },
    assetId: { type: Types.ObjectId, ref: 'Asset' },
  },
  // Add YouTube metadata field
  youtubeMeta: {
    videoId: { type: String },
    url: { type: String },
    title: { type: String },
    description: { type: String },
    thumbnail: { type: String },
    channelTitle: { type: String },
    publishedAt: { type: Date },
  },
  likesIDs: [{ type: Types.ObjectId, ref: 'VideoProfile' }],
  likesCount: { type: Number, default: 0 },
  comments: [commentSchema],
  commentsCount: { type: Number, default: 0 },
  shareCounts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Additional fields for extensibility
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const Post = mongoose.model('Post', postSchema); 