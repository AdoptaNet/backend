import { ChatRoom } from '../entities/chat-room.entity';

export abstract class ChatRoomRepository {
  abstract findById(id: string): Promise<ChatRoom | null>;
  abstract findByAdoptionRequestId(
    adoptionRequestId: string,
  ): Promise<ChatRoom | null>;
  abstract findUserRooms(userId: string): Promise<ChatRoom[]>;
  abstract save(chatRoom: ChatRoom): Promise<ChatRoom>;
}
