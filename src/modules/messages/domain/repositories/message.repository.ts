import { Message } from '../entities/message.entity';

export abstract class MessageRepository {
  abstract findByRoomId(
    roomId: string,
    limit?: number,
    before?: Date,
  ): Promise<Message[]>;
  abstract save(message: Message): Promise<Message>;
  abstract markAsRead(roomId: string, recipientUserId: string): Promise<number>;
  abstract countUnreadForUser(userId: string): Promise<number>;
  abstract getRoomUnreadCount(roomId: string, userId: string): Promise<number>;
  abstract getLastMessage(roomId: string): Promise<Message | null>;
}
