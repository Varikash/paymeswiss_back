import { Injectable } from '@nestjs/common';
import { Room, User, VoteValue } from './types';

@Injectable()
export class PokerService {
  private rooms: Map<string, Room> = new Map();

  getOrCreateRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: [],
        revealed: false,
      });
    }
    return this.rooms.get(roomId);
  }

  addUser(roomId: string, user: User) {
    const room = this.getOrCreateRoom(roomId);
    if (!room.users.find((u) => u.id === user.id)) {
      room.users.push(user);
    }
  }

  removeUser(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.users = room.users.filter(u => u.id !== socketId);
    if (room.users.length === 0) this.rooms.delete(roomId);
  }

  setVote(roomId: string, userId: string, value: VoteValue) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const user = room.users.find((u) => u.id === userId);
    if (user) user.vote = value;

    const allVoted = room.users.every((u) => u.vote !== undefined);
    if (allVoted) room.revealed = true;
  }

  resetVotes(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.users.forEach((u) => delete u.vote);
    room.revealed = false;
  }

  getRoom(roomId: string): Room {
    return this.rooms.get(roomId);
  }
}