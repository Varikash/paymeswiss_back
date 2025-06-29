export type VoteValue = 1 | 2 | 3 | 5 | 8 | 13 | '?' | '☕️';

export interface User {
  id: string;
  name: string;
  vote?: VoteValue;
  isHost?: boolean;
  joinedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  revealed: boolean;
  timer?: {
    duration: number;
    startTime?: Date;
    isActive: boolean;
  };
  createdAt: Date;
  hostId: string;
}