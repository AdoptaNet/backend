import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { Message } from '../../domain/entities/message.entity';
import { ChatRoomResponseDto } from '../dtos/chat-room-response.dto';
import { MessageMapper } from './message.mapper';

export class ChatRoomMapper {
  static toResponseDto(
    room: ChatRoom,
    unreadCount: number = 0,
    lastMessage?: Message | null,
  ): ChatRoomResponseDto {
    const petPhotos = room.adoptionRequest?.pet?.photos || [];
    const primaryPhoto =
      petPhotos.find((p) => p.isPrimary)?.url ||
      petPhotos[0]?.url ||
      null;

    return {
      id: room.id,
      adoptionRequestId: room.adoptionRequestId,
      adopterId: room.adopterId,
      adopter: {
        id: room.adopter?.id || room.adopterId,
        fullName: room.adopter?.fullName || null,
        email: room.adopter?.email || '',
        avatarUrl: room.adopter?.avatarUrl || null,
      },
      shelterId: room.shelterId,
      shelter: {
        id: room.shelter?.id || room.shelterId,
        fullName:
          room.shelter?.shelterProfile?.organizationName ||
          room.shelter?.fullName ||
          null,
        email: room.shelter?.email || '',
        avatarUrl: room.shelter?.avatarUrl || null,
      },
      pet: {
        id: room.adoptionRequest?.pet?.id || room.adoptionRequest?.petId || '',
        name: room.adoptionRequest?.pet?.name || 'Mascota',
        species: room.adoptionRequest?.pet?.species || 'other',
        primaryPhotoUrl: primaryPhoto,
      },
      adoptionStatus: room.adoptionRequest?.status || 'unknown',
      isActive: room.isActive,
      lastMessageAt: room.lastMessageAt,
      unreadCount,
      lastMessage: lastMessage
        ? MessageMapper.toResponseDto(lastMessage)
        : room.messages && room.messages.length > 0
          ? MessageMapper.toResponseDto(room.messages[room.messages.length - 1])
          : null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
