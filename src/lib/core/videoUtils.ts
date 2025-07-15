/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import crypto , { randomUUID as uuidv4 } from 'crypto';
import axios from 'axios';


/**
 * Generate a unique room token for the video call
 * This is a simplified version. In production, you might want to:
 * 1. Use a third-party video service (Twilio, Agora, etc.)
 * 2. Create more secure tokens with appropriate TTL
 */
export async function generateRoomToken(): Promise<string> {
  return `room_${uuidv4()}`;
}

/**
 * Get TURN server credentials
 * In a real application, you would integrate with actual TURN servers
 */
export function getTurnCredentials() {
  // In production, use a real TURN server service
  return {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
        ],
      },
      // Example TURN server config (replace with actual credentials)
      // {
      //   urls: ['turn:your-turn-server.com:3478'],
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
  };
}

/**
 * Generate a time-limited token for security
 * (Example implementation - would need to be expanded in production)
 */
export function generateSecurityToken(userId: string, roomId: string): string {
  const hmac = crypto.createHmac('sha256', process.env.VIDEO_SECRET || 'video-secret');
  const expiry = Date.now() + 3600 * 1000; // 1 hour from now
  
  const data = `${userId}:${roomId}:${expiry}`;
  const signature = hmac.update(data).digest('hex');
  
  return `${data}:${signature}`;
}

/**
 * Verify a security token
 */
export function verifySecurityToken(token: string): { 
  valid: boolean; 
  userId?: string; 
  roomId?: string; 
} {
  try {
    const [userId, roomId, expiry, signature] = token.split(':');
    
    // Check if token has expired
    if (parseInt(expiry) < Date.now()) {
      return { valid: false };
    }
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.VIDEO_SECRET || 'video-secret');
    const data = `${userId}:${roomId}:${expiry}`;
    const expectedSignature = hmac.update(data).digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    return { valid: true, userId, roomId };
  } catch (error) {
    return { valid: false };
  }
}

// Utility: Extract YouTube video ID from a string
export function extractYouTubeVideoId(text: string): string | null {
  // Regex for YouTube URLs
  const regex = /(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/))([\w-]{11})/;
  const match = text.match(regex);
  return match ? match[1] : null;
}

// Utility: Fetch YouTube video metadata using YouTube Data API v3
export async function fetchYouTubeMetadata(videoId: string): Promise<{
  videoId: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
} | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set in environment variables');
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;
  try {
    const response = await axios.get(apiUrl);
    const item = response.data.items && response.data.items[0];
    if (!item) return null;
    const snippet = item.snippet;
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
    };
  } catch (error) {
    return null;
  }
}