import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { UnreadCountResponseDto } from '../dtos/unread-count-response.dto';

@Injectable()
export class GetUnreadMessagesCountUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(userId: string): Promise<UnreadCountResponseDto> {
    const count = await this.messageRepo.countUnreadForUser(userId);
    return { unreadCount: count };
  }
}
