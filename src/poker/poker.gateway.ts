import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
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
export class PokerGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private logger = new Logger('PokerGateway');

  constructor(private readonly pokerService: PokerService) {}

  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

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

    try {
      client.join(roomId);
      client.data.roomId = roomId;

      const user = {
        id: client.id,
        name: username,
        joinedAt: new Date(),
      };

      this.pokerService.addUser(roomId, user);
      this.emitRoomUpdate(roomId);
    } catch (error) {
      client.emit('join_error', { message: error.message });
      this.logger.warn(`Failed to join room ${roomId}: ${error.message}`);
    }
  }

  @SubscribeMessage('vote')
  handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; value: VoteValue },
  ) {
    const { roomId, value } = data;

    if (!this.isValidVoteValue(value)) {
      this.logger.warn(
        `Invalid vote value: ${value} from client: ${client.id}`,
      );
      return;
    }

    this.pokerService.setVote(roomId, client.id, value);
    const room = this.pokerService.getRoom(roomId);

    if (room.revealed) {
      this.server.to(roomId).emit('vote_reveal', { room });
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
    this.server
      .to(roomId)
      .emit('vote_reset', { room: this.pokerService.getRoom(roomId) });
    this.emitRoomUpdate(roomId);
  }

  @SubscribeMessage('start_timer')
  handleStartTimer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; duration: number },
  ) {
    const { roomId, duration } = data;
    this.pokerService.startTimer(roomId, duration, () => {
      this.handleTimerEnd(roomId);
    });
    this.emitRoomUpdate(roomId);
  }

  private handleTimerEnd(roomId: string) {
    const room = this.pokerService.getRoom(roomId);
    if (!room) return;

    this.server.to(roomId).emit('vote_reveal', { room });
    this.emitRoomUpdate(roomId);
  }

  @SubscribeMessage('stop_timer')
  handleStopTimer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    this.pokerService.stopTimer(roomId);
    this.emitRoomUpdate(roomId);
  }

  private emitRoomUpdate(roomId: string) {
    const room = this.pokerService.getRoom(roomId);
    if (!room) return;
    console.log('Sending room_update:', { room });
    this.server.to(roomId).emit('room_update', { room });
  }

  private isValidVoteValue(value: any): value is VoteValue {
    const validValues: VoteValue[] = [1, 2, 3, 5, 8, 13, '?', '☕️'];
    return validValues.includes(value);
  }
}
