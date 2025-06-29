import { Injectable } from '@nestjs/common';
import { Room, User, VoteValue } from './types';

@Injectable()
export class PokerService {
  private rooms: Map<string, Room> = new Map();

  getOrCreateRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      const newRoom: Room = {
        id: roomId,
        name: `Room ${roomId}`,
        users: [],
        revealed: false,
        createdAt: new Date(),
        hostId: '',
      };
      this.rooms.set(roomId, newRoom);
    }
    return this.rooms.get(roomId);
  }

  addUser(roomId: string, user: User) {
    const room = this.getOrCreateRoom(roomId);

    if (room.users.length >= 12) {
      throw new Error('Room is full. Maximum 12 players allowed.');
    }

    if (!room.users.find((u) => u.id === user.id)) {
      if (room.users.length === 0) {
        user.isHost = true;
        room.hostId = user.id;
      } else {
        user.isHost = false;
      }

      room.users.push(user);
    }
  }

  removeUser(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const removedUser = room.users.find((u) => u.id === socketId);
    room.users = room.users.filter((u) => u.id !== socketId);

    if (removedUser?.isHost && room.users.length > 0) {
      const newHost = room.users[0];
      newHost.isHost = true;
      room.hostId = newHost.id;
    }

    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }
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

  startTimer(roomId: string, duration: number, onTimerEnd?: () => void) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.stopTimer(roomId);

    room.timer = {
      duration,
      startTime: new Date(),
      isActive: true,
    };

    setTimeout(() => {
      this.handleTimerEnd(roomId);
      if (onTimerEnd) {
        onTimerEnd();
      }
    }, duration * 1000);
  }

  stopTimer(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.timer) return;

    room.timer.isActive = false;
    room.timer.startTime = undefined;
  }

  private handleTimerEnd(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.stopTimer(roomId);

    room.users.forEach((user) => {
      if (!user.vote) {
        user.vote = '☕️';
      }
    });

    room.revealed = true;
  }

  getRoom(roomId: string): Room {
    return this.rooms.get(roomId);
  }
}
