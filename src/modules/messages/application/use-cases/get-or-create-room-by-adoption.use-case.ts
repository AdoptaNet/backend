import { Injectable } from '@nestjs/common';
import { AdoptionRequestRepository } from '../../../adoptions/domain/repositories/adoption-request.repository';
import { AdoptionStatus } from '../../../adoptions/domain/value-objects/adoption-status.enum';
import {
  ChatRoomNotFoundException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ChatRoomResponseDto } from '../dtos/chat-room-response.dto';
import { ChatRoomMapper } from '../mappers/chat-room.mapper';
import { ProvisionChatRoomUseCase } from './provision-chat-room.use-case';

@Injectable()
export class GetOrCreateRoomByAdoptionUseCase {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly messageRepo: MessageRepository,
    private readonly adoptionRepo: AdoptionRequestRepository,
    private readonly provisionUseCase: ProvisionChatRoomUseCase,
  ) {}

  async execute(
    adoptionRequestId: string,
    userId: string,
  ): Promise<ChatRoomResponseDto> {
    let room = await this.chatRoomRepo.findByAdoptionRequestId(
      adoptionRequestId,
    );

    if (!room) {
      const adoption = await this.adoptionRepo.findById(adoptionRequestId);
      if (!adoption) {
        throw new ChatRoomNotFoundException(adoptionRequestId);
      }

      if (adoption.adopterId !== userId && adoption.shelterId !== userId) {
        throw new UnauthorizedChatAccessForbiddenException();
      }

      const isActive =
        adoption.status === AdoptionStatus.UNDER_REVIEW ||
        adoption.status === AdoptionStatus.APPROVED;

      room = await this.provisionUseCase.execute(adoptionRequestId, isActive);
      if (!room) {
        throw new ChatRoomNotFoundException(adoptionRequestId);
      }
      room = await this.chatRoomRepo.findById(room.id);
    } else {
      if (room.adopterId !== userId && room.shelterId !== userId) {
        throw new UnauthorizedChatAccessForbiddenException();
      }
    }

    const [unreadCount, lastMessage] = await Promise.all([
      this.messageRepo.getRoomUnreadCount(room!.id, userId),
      this.messageRepo.getLastMessage(room!.id),
    ]);

    return ChatRoomMapper.toResponseDto(room!, unreadCount, lastMessage);
  }
}
