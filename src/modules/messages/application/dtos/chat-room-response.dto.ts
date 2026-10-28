import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatParticipantDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  fullName: string | null;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatarUrl: string | null;
}

export class ChatPetDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  species: string;

  @ApiPropertyOptional()
  primaryPhotoUrl: string | null;
}

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatRoomId: string;

  @ApiProperty()
  senderId: string;

  @ApiPropertyOptional({ type: () => ChatParticipantDto })
  sender?: ChatParticipantDto;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  attachmentUrl: string | null;

  @ApiPropertyOptional()
  attachmentType: string | null;

  @ApiPropertyOptional()
  readAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

export class ChatRoomResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adoptionRequestId: string;

  @ApiProperty()
  adopterId: string;

  @ApiProperty({ type: () => ChatParticipantDto })
  adopter: ChatParticipantDto;

  @ApiProperty()
  shelterId: string;

  @ApiProperty({ type: () => ChatParticipantDto })
  shelter: ChatParticipantDto;

  @ApiProperty({ type: () => ChatPetDto })
  pet: ChatPetDto;

  @ApiProperty()
  adoptionStatus: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  lastMessageAt: Date | null;

  @ApiProperty({ default: 0 })
  unreadCount: number;

  @ApiPropertyOptional({ type: () => MessageResponseDto })
  lastMessage?: MessageResponseDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
