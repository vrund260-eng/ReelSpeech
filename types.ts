import { Type } from '@google/genai';

export interface User {
  username: string;
  displayName: string;
  avatar: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  followers: number;
  following: number;
  followingUsernames: string[];
}

export interface Video {
  id: number;
  src: string;
  user: User;
  caption: string;
  audioName: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLocal?: boolean;
}

export interface ChatMessage {
  id: number | string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

// Keep this export for other potential schema definitions
export { Type };
