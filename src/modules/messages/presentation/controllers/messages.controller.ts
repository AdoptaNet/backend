import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import {
  ChatRoomResponseDto,
  MessageResponseDto,
} from '../../application/dtos/chat-room-response.dto';
import { QueryMessagesDto } from '../../application/dtos/query-messages.dto';
import { SendMessageDto } from '../../application/dtos/send-message.dto';
import { UnreadCountResponseDto } from '../../application/dtos/unread-count-response.dto';
import { GetChatRoomByIdUseCase } from '../../application/use-cases/get-chat-room-by-id.use-case';
import { GetChatRoomMessagesUseCase } from '../../application/use-cases/get-chat-room-messages.use-case';
import { GetMyChatRoomsUseCase } from '../../application/use-cases/get-my-chat-rooms.use-case';
import { GetOrCreateRoomByAdoptionUseCase } from '../../application/use-cases/get-or-create-room-by-adoption.use-case';
import { GetUnreadMessagesCountUseCase } from '../../application/use-cases/get-unread-messages-count.use-case';
import { MarkMessagesAsReadUseCase } from '../../application/use-cases/mark-messages-as-read.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(
    private readonly getMyChatRoomsUseCase: GetMyChatRoomsUseCase,
    private readonly getChatRoomByIdUseCase: GetChatRoomByIdUseCase,
    private readonly getOrCreateRoomByAdoptionUseCase: GetOrCreateRoomByAdoptionUseCase,
    private readonly getChatRoomMessagesUseCase: GetChatRoomMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markMessagesAsReadUseCase: MarkMessagesAsReadUseCase,
    private readonly getUnreadMessagesCountUseCase: GetUnreadMessagesCountUseCase,
  ) {}

  @Get('rooms')
  @ApiOperation({
    summary: 'Listar salas de chat activas del usuario autenticado',
    description:
      'Retorna todas las conversaciones del adoptante o albergue ordenadas por actividad reciente, con contador de no leídos.',
  })
  @ApiResponse({ status: 200, type: [ChatRoomResponseDto] })
  async getMyRooms(@Req() req: any): Promise<ChatRoomResponseDto[]> {
    return this.getMyChatRoomsUseCase.execute(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Obtener contador global de mensajes no leídos del usuario',
  })
  @ApiResponse({ status: 200, type: UnreadCountResponseDto })
  async getUnreadCount(@Req() req: any): Promise<UnreadCountResponseDto> {
    return this.getUnreadMessagesCountUseCase.execute(req.user.id);
  }

  @Get('adoptions/:adoptionRequestId')
  @ApiOperation({
    summary: 'Obtener o aprovisionar la sala de chat de una postulación',
    description:
      'Retorna la sala vinculada a una solicitud de adopción en evaluación o aprobada.',
  })
  @ApiParam({ name: 'adoptionRequestId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: ChatRoomResponseDto })
  async getOrCreateByAdoption(
    @Param('adoptionRequestId', ParseUUIDPipe) adoptionRequestId: string,
    @Req() req: any,
  ): Promise<ChatRoomResponseDto> {
    return this.getOrCreateRoomByAdoptionUseCase.execute(
      adoptionRequestId,
      req.user.id,
    );
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Obtener el detalle de una sala de chat por su ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: ChatRoomResponseDto })
  async getRoomById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<ChatRoomResponseDto> {
    return this.getChatRoomByIdUseCase.execute(id, req.user.id);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({
    summary: 'Obtener el historial de mensajes de una sala de chat',
    description:
      'Carga mensajes ordenados cronológicamente con soporte de paginación mediante query params.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  async getRoomMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryMessagesDto,
    @Req() req: any,
  ): Promise<MessageResponseDto[]> {
    return this.getChatRoomMessagesUseCase.execute(id, req.user.id, query);
  }

  @Post('rooms/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar un mensaje de texto o fotografía a la sala de chat',
    description:
      'Valida que la sala esté activa (is_active = true) y persiste el mensaje actualizando la última actividad.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Req() req: any,
  ): Promise<MessageResponseDto> {
    return this.sendMessageUseCase.execute(id, req.user.id, dto);
  }

  @Patch('rooms/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar como leídos los mensajes pendientes en la sala',
    description:
      'Actualiza read_at para los mensajes recibidos no leídos y activa el doble check azul.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mensajes marcados como leídos' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<{ affected: number }> {
    return this.markMessagesAsReadUseCase.execute(id, req.user.id);
  }
}
