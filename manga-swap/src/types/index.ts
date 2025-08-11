export interface Manga {
  id: string;
  title: string;
  author: string;
  volume: number;
  imageUri: string;
  ownerId: string;
  ownerPseudo: string;
  ownerCity: string;
  description?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  isAvailable: boolean;
}

export interface User {
  id: string;
  pseudo: string;
  email: string;
  city: string;
  description?: string;
  avatar?: string;
  level: number;
  experience: number;
  exchangeCount: number;
  createdAt: string;
}

export interface Exchange {
  id: string;
  requesterId: string;
  ownerId: string;
  requestedManga: Manga;
  offeredManga: Manga;
  status: 'pending' | 'accepted' | 'declined' | 'meeting_planned' | 'completed';
  message: string;
  meetingLocation?: string;
  meetingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  exchangeId: string;
  senderId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Collection {
  id: string;
  userId: string;
  manga: Manga;
  status: 'offering' | 'seeking';
  addedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  levelRequired: number;
  imageUri: string;
  redeemUrl: string;
  isUnlocked: boolean;
}