import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ChatRoomNotFoundException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';

export class MessagesReadEvent {
  static readonly EVENT_NAME = 'messages.read';
  constructor(
    public readonly chatRoomId: string,
    public readonly readByUserId: string,
    public readonly affectedCount: number,
  ) {}
}

@Injectable()
export class MarkMessagesAsReadUseCase {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly messageRepo: MessageRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(roomId: string, userId: string): Promise<{ affected: number }> {
    const room = await this.chatRoomRepo.findById(roomId);
    if (!room) {
      throw new ChatRoomNotFoundException(roomId);
    }

    if (room.adopterId !== userId && room.shelterId !== userId) {
      throw new UnauthorizedChatAccessForbiddenException();
    }

    const affected = await this.messageRepo.markAsRead(roomId, userId);

    if (affected > 0) {
      this.eventEmitter.emit(
        MessagesReadEvent.EVENT_NAME,
        new MessagesReadEvent(roomId, userId, affected),
      );
    }

    return { affected };
  }
}
