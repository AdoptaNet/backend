import { Message } from '../../domain/entities/message.entity';
import { MessageResponseDto } from '../dtos/chat-room-response.dto';

export class MessageMapper {
  static toResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      chatRoomId: message.chatRoomId,
      senderId: message.senderId,
      sender: message.sender
        ? {
            id: message.sender.id,
            fullName: message.sender.fullName,
            email: message.sender.email,
            avatarUrl: message.sender.avatarUrl,
          }
        : undefined,
      content: message.content,
      attachmentUrl: message.attachmentUrl,
      attachmentType: message.attachmentType,
      readAt: message.readAt,
      createdAt: message.createdAt,
    };
  }
}
