import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../domain/entities/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';

@Injectable()
export class MessageTypeOrmRepository implements MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  async findByRoomId(
    roomId: string,
    limit: number = 50,
    before?: Date,
  ): Promise<Message[]> {
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.chat_room_id = :roomId', { roomId });

    if (before) {
      qb.andWhere('m.created_at < :before', { before });
    }

    const messages = await qb
      .orderBy('m.created_at', 'DESC')
      .take(limit)
      .getMany();

    return messages.reverse();
  }

  async save(message: Message): Promise<Message> {
    return this.repo.save(message);
  }

  async markAsRead(roomId: string, recipientUserId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: new Date() })
      .where('chat_room_id = :roomId', { roomId })
      .andWhere('sender_id != :recipientUserId', { recipientUserId })
      .andWhere('read_at IS NULL')
      .execute();

    return result.affected || 0;
  }

  async countUnreadForUser(userId: string): Promise<number> {
    return this.repo
      .createQueryBuilder('m')
      .innerJoin('m.chatRoom', 'room')
      .where('(room.adopter_id = :userId OR room.shelter_id = :userId)', {
        userId,
      })
      .andWhere('m.sender_id != :userId', { userId })
      .andWhere('m.read_at IS NULL')
      .andWhere('room.is_active = true')
      .getCount();
  }

  async getRoomUnreadCount(roomId: string, userId: string): Promise<number> {
    return this.repo
      .createQueryBuilder('m')
      .where('m.chat_room_id = :roomId', { roomId })
      .andWhere('m.sender_id != :userId', { userId })
      .andWhere('m.read_at IS NULL')
      .getCount();
  }

  async getLastMessage(roomId: string): Promise<Message | null> {
    return this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.chat_room_id = :roomId', { roomId })
      .orderBy('m.created_at', 'DESC')
      .getOne();
  }
}
