import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ChatRoomInactiveException,
  ChatRoomNotFoundException,
  InvalidMessageContentException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { Message } from '../../domain/entities/message.entity';
import { MessageSentEvent } from '../../domain/events/message-sent.event';
import { SendMessageDto } from '../dtos/send-message.dto';
import { MessageResponseDto } from '../dtos/chat-room-response.dto';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly messageRepo: MessageRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    roomId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const trimmedContent = dto.content?.trim();
    if (!trimmedContent && !dto.attachmentUrl) {
      throw new InvalidMessageContentException(
        'El mensaje no puede estar vacío. Debes enviar texto o un archivo adjunto.',
      );
    }

    const room = await this.chatRoomRepo.findById(roomId);
    if (!room) {
      throw new ChatRoomNotFoundException(roomId);
    }

    if (room.adopterId !== senderId && room.shelterId !== senderId) {
      throw new UnauthorizedChatAccessForbiddenException();
    }

    if (!room.isActive) {
      throw new ChatRoomInactiveException();
    }

    const message = new Message();
    message.chatRoomId = room.id;
    message.senderId = senderId;
    message.content = trimmedContent || '';
    message.attachmentUrl = dto.attachmentUrl || null;
    message.attachmentType =
      dto.attachmentType || (dto.attachmentUrl ? 'image/jpeg' : null);
    message.readAt = null;

    const saved = await this.messageRepo.save(message);
    saved.sender =
      senderId === room.adopterId ? room.adopter : room.shelter;

    room.lastMessageAt = saved.createdAt;
    await this.chatRoomRepo.save(room);

    const recipientId =
      senderId === room.adopterId ? room.shelterId : room.adopterId;

    this.eventEmitter.emit(
      MessageSentEvent.EVENT_NAME,
      new MessageSentEvent(saved, room.id, recipientId),
    );

    return MessageMapper.toResponseDto(saved);
  }
}
