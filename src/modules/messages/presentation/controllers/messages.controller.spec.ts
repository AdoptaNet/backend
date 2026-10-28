import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { GetMyChatRoomsUseCase } from '../../application/use-cases/get-my-chat-rooms.use-case';
import { GetChatRoomByIdUseCase } from '../../application/use-cases/get-chat-room-by-id.use-case';
import { GetOrCreateRoomByAdoptionUseCase } from '../../application/use-cases/get-or-create-room-by-adoption.use-case';
import { GetChatRoomMessagesUseCase } from '../../application/use-cases/get-chat-room-messages.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { MarkMessagesAsReadUseCase } from '../../application/use-cases/mark-messages-as-read.use-case';
import { GetUnreadMessagesCountUseCase } from '../../application/use-cases/get-unread-messages-count.use-case';

describe('MessagesController', () => {
  let controller: MessagesController;
  let getMyRoomsUseCase: jest.Mocked<GetMyChatRoomsUseCase>;
  let sendMessageUseCase: jest.Mocked<SendMessageUseCase>;
  let markMessagesAsReadUseCase: jest.Mocked<MarkMessagesAsReadUseCase>;

  beforeEach(async () => {
    getMyRoomsUseCase = { execute: jest.fn() } as any;
    sendMessageUseCase = { execute: jest.fn() } as any;
    markMessagesAsReadUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: GetMyChatRoomsUseCase, useValue: getMyRoomsUseCase },
        {
          provide: GetChatRoomByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetOrCreateRoomByAdoptionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetChatRoomMessagesUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: SendMessageUseCase, useValue: sendMessageUseCase },
        {
          provide: MarkMessagesAsReadUseCase,
          useValue: markMessagesAsReadUseCase,
        },
        {
          provide: GetUnreadMessagesCountUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('debe listar salas de chat del usuario autenticado', async () => {
    getMyRoomsUseCase.execute.mockResolvedValue([]);

    const result = await controller.getMyRooms({ user: { id: 'user-1' } });

    expect(result).toEqual([]);
    expect(getMyRoomsUseCase.execute).toHaveBeenCalledWith('user-1');
  });

  it('debe enviar un mensaje a través del use case', async () => {
    const mockMessageDto: any = { id: 'msg-1', content: 'Hola mundo' };
    sendMessageUseCase.execute.mockResolvedValue(mockMessageDto);

    const result = await controller.sendMessage(
      'room-1',
      { content: 'Hola mundo' },
      { user: { id: 'user-1' } },
    );

    expect(result).toBe(mockMessageDto);
    expect(sendMessageUseCase.execute).toHaveBeenCalledWith(
      'room-1',
      'user-1',
      { content: 'Hola mundo' },
    );
  });

  it('debe marcar mensajes como leídos', async () => {
    markMessagesAsReadUseCase.execute.mockResolvedValue({ affected: 3 });

    const result = await controller.markAsRead('room-1', {
      user: { id: 'user-1' },
    });

    expect(result).toEqual({ affected: 3 });
    expect(markMessagesAsReadUseCase.execute).toHaveBeenCalledWith(
      'room-1',
      'user-1',
    );
  });
});
