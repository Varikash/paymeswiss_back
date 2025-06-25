import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PokerService } from './poker.service';
import { VoteValue } from './types';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class PokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('PokerGateway');

  constructor(private readonly pokerService: PokerService) {}

  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const roomId = client.data?.roomId;
    if (roomId) {
      this.pokerService.removeUser(roomId, client.id);
      this.emitRoomUpdate(roomId);
    }
  }

  @SubscribeMessage('join_room')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; username: string },
  ) {
    const { roomId, username } = data;
    client.join(roomId);
    client.data.roomId = roomId;

    this.pokerService.addUser(roomId, {
      id: client.id,
      name: username,
    });

    this.emitRoomUpdate(roomId);
  }

  @SubscribeMessage('vote')
  handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; value: VoteValue },
  ) {
    const { roomId, value } = data;

    this.pokerService.setVote(roomId, client.id, value);
    const room = this.pokerService.getRoom(roomId);

    if (room.revealed) {
      this.server.to(roomId).emit('vote_reveal', { users: room.users });
    } else {
      this.emitRoomUpdate(roomId);
    }
  }

  @SubscribeMessage('reset')
  handleReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    this.pokerService.resetVotes(roomId);
    this.server.to(roomId).emit('vote_reset');
    this.emitRoomUpdate(roomId);
  }

  private emitRoomUpdate(roomId: string) {
    const room = this.pokerService.getRoom(roomId);
    if (!room) return;
    this.server.to(roomId).emit('room_update', {
      users: room.users.map(u => ({
        id: u.id,
        name: u.name,
        vote: room.revealed ? u.vote : undefined,
      })),
      revealed: room.revealed,
    });
  }
}