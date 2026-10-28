import { Injectable } from '@nestjs/common';
import {
  ChatRoomNotFoundException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessageResponseDto } from '../dtos/chat-room-response.dto';
import { QueryMessagesDto } from '../dtos/query-messages.dto';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class GetChatRoomMessagesUseCase {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(
    roomId: string,
    userId: string,
    dto: QueryMessagesDto = {},
  ): Promise<MessageResponseDto[]> {
    const room = await this.chatRoomRepo.findById(roomId);
    if (!room) {
      throw new ChatRoomNotFoundException(roomId);
    }

    if (room.adopterId !== userId && room.shelterId !== userId) {
      throw new UnauthorizedChatAccessForbiddenException();
    }

    const beforeDate = dto.before ? new Date(dto.before) : undefined;
    const messages = await this.messageRepo.findByRoomId(
      roomId,
      dto.limit || 50,
      beforeDate,
    );

    return messages.map((m) => MessageMapper.toResponseDto(m));
  }
}
