import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({ description: 'Total de mensajes no leídos dirigidos al usuario autenticado' })
  unreadCount: number;
}
