import { Injectable, Logger } from '@nestjs/common';
import { AdoptionRequestRepository } from '../../../adoptions/domain/repositories/adoption-request.repository';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';

@Injectable()
export class ProvisionChatRoomUseCase {
  private readonly logger = new Logger(ProvisionChatRoomUseCase.name);

  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly adoptionRepo: AdoptionRequestRepository,
  ) {}

  async execute(
    adoptionRequestId: string,
    isActive: boolean = true,
  ): Promise<ChatRoom | null> {
    const existing = await this.chatRoomRepo.findByAdoptionRequestId(
      adoptionRequestId,
    );

    if (existing) {
      if (existing.isActive !== isActive) {
        existing.isActive = isActive;
        const updated = await this.chatRoomRepo.save(existing);
        this.logger.log(
          `Sala de chat ${updated.id} actualizada: isActive = ${isActive}`,
        );
        return updated;
      }
      return existing;
    }

    const adoption = await this.adoptionRepo.findById(adoptionRequestId);
    if (!adoption) {
      this.logger.warn(
        `No se pudo aprovisionar chat: solicitud ${adoptionRequestId} no encontrada`,
      );
      return null;
    }

    const room = new ChatRoom();
    room.adoptionRequestId = adoption.id;
    room.adopterId = adoption.adopterId;
    room.shelterId = adoption.shelterId;
    room.isActive = isActive;
    room.lastMessageAt = null;

    const saved = await this.chatRoomRepo.save(room);
    this.logger.log(
      `Sala de chat ${saved.id} aprovisionada exitosamente para la adopción ${adoptionRequestId}`,
    );

    return saved;
  }
}
