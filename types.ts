export interface User {
  username: string;
  displayName: string;
  avatar: string;
  email?: string;
  phone?: string;
  password?: string;
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