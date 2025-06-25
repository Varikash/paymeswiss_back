export type VoteValue = number | '?';

export interface User {
  id: string; // socket.id
  name: string;
  vote?: VoteValue;
}

export interface Room {
  id: string;
  users: User[];
  revealed: boolean;
  timer?: NodeJS.Timeout;
  timerValue?: number;
}