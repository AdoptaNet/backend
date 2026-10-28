import { Injectable } from '@nestjs/common';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ChatRoomResponseDto } from '../dtos/chat-room-response.dto';
import { ChatRoomMapper } from '../mappers/chat-room.mapper';

@Injectable()
export class GetMyChatRoomsUseCase {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(userId: string): Promise<ChatRoomResponseDto[]> {
    const rooms = await this.chatRoomRepo.findUserRooms(userId);

    const roomDtos = await Promise.all(
      rooms.map(async (room) => {
        const [unreadCount, lastMessage] = await Promise.all([
          this.messageRepo.getRoomUnreadCount(room.id, userId),
          this.messageRepo.getLastMessage(room.id),
        ]);

        return ChatRoomMapper.toResponseDto(room, unreadCount, lastMessage);
      }),
    );

    return roomDtos;
  }
}
