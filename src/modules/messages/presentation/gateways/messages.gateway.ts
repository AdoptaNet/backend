import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageSentEvent } from '../../domain/events/message-sent.event';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageMapper } from '../../application/mappers/message.mapper';
import { MessagesReadEvent } from '../../application/use-cases/mark-messages-as-read.use-case';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatRoomRepo: ChatRoomRepository,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization?.startsWith('Bearer ')
          ? client.handshake.headers.authorization.slice(7)
          : null) ||
        client.handshake.query?.token;

      if (!rawToken || typeof rawToken !== 'string') {
        this.logger.warn(
          `Socket ${client.id} desconectado: token no suministrado`,
        );
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(rawToken, { secret });

      if (!payload?.sub) {
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;
      client.data.email = payload.email;

      // Unir socket al canal personal del usuario
      await client.join(`user:${payload.sub}`);

      this.logger.log(
        `Cliente ${client.id} autenticado como usuario ${payload.sub}`,
      );
    } catch (err) {
      this.logger.warn(
        `Socket ${client.id} falló en autenticación: ${err.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data?.roomId) return;

    try {
      const room = await this.chatRoomRepo.findById(data.roomId);
      if (!room) return;

      if (room.adopterId !== userId && room.shelterId !== userId) {
        this.logger.warn(
          `Usuario ${userId} intentó unirse sin permiso a sala ${data.roomId}`,
        );
        return;
      }

      await client.join(data.roomId);
      this.logger.log(`Usuario ${userId} se unió al room ${data.roomId}`);
      return { event: 'room_joined', data: { roomId: data.roomId } };
    } catch (error) {
      this.logger.error(`Error al unir room: ${error.message}`);
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!data?.roomId) return;
    await client.leave(data.roomId);
  }

  @OnEvent(MessageSentEvent.EVENT_NAME, { async: true })
  handleMessageSent(event: MessageSentEvent) {
    try {
      const payload = MessageMapper.toResponseDto(event.message);

      // 1. Emitir a todos los miembros de la sala
      this.server.to(event.chatRoomId).emit('new_message', payload);

      // 2. Notificar al canal personal del receptor para actualizar contadores
      this.server
        .to(`user:${event.recipientId}`)
        .emit('unread_message_notification', {
          roomId: event.chatRoomId,
          message: payload,
        });
    } catch (err) {
      this.logger.error(`Error al emitir new_message: ${err.message}`);
    }
  }

  @OnEvent(MessagesReadEvent.EVENT_NAME, { async: true })
  handleMessagesRead(event: MessagesReadEvent) {
    try {
      this.server.to(event.chatRoomId).emit('messages_read', {
        roomId: event.chatRoomId,
        readByUserId: event.readByUserId,
        affectedCount: event.affectedCount,
      });
    } catch (err) {
      this.logger.error(`Error al emitir messages_read: ${err.message}`);
    }
  }
}
