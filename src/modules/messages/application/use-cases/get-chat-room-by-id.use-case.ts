import { Injectable } from '@nestjs/common';
import {
  ChatRoomNotFoundException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ChatRoomResponseDto } from '../dtos/chat-room-response.dto';
import { ChatRoomMapper } from '../mappers/chat-room.mapper';

@Injectable()
export class GetChatRoomByIdUseCase {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(roomId: string, userId: string): Promise<ChatRoomResponseDto> {
    const room = await this.chatRoomRepo.findById(roomId);
    if (!room) {
      throw new ChatRoomNotFoundException(roomId);
    }

    if (room.adopterId !== userId && room.shelterId !== userId) {
      throw new UnauthorizedChatAccessForbiddenException();
    }

    const [unreadCount, lastMessage] = await Promise.all([
      this.messageRepo.getRoomUnreadCount(room.id, userId),
      this.messageRepo.getLastMessage(room.id),
    ]);

    return ChatRoomMapper.toResponseDto(room, unreadCount, lastMessage);
  }
}
