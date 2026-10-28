import { Test, TestingModule } from '@nestjs/testing';
import {
  ChatRoomNotFoundException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { Message } from '../../domain/entities/message.entity';
import { GetChatRoomMessagesUseCase } from './get-chat-room-messages.use-case';

describe('GetChatRoomMessagesUseCase', () => {
  let useCase: GetChatRoomMessagesUseCase;
  let chatRoomRepo: jest.Mocked<ChatRoomRepository>;
  let messageRepo: jest.Mocked<MessageRepository>;

  const mockRoom: ChatRoom = {
    id: 'room-1',
    adoptionRequestId: 'adoption-1',
    adopterId: 'adopter-1',
    shelterId: 'shelter-1',
    isActive: true,
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    adoptionRequest: null as any,
    adopter: null as any,
    shelter: null as any,
    messages: [],
  };

  beforeEach(async () => {
    chatRoomRepo = {
      findById: jest.fn(),
      findByAdoptionRequestId: jest.fn(),
      findUserRooms: jest.fn(),
      save: jest.fn(),
    };

    messageRepo = {
      findByRoomId: jest.fn(),
      save: jest.fn(),
      markAsRead: jest.fn(),
      countUnreadForUser: jest.fn(),
      getRoomUnreadCount: jest.fn(),
      getLastMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetChatRoomMessagesUseCase,
        { provide: ChatRoomRepository, useValue: chatRoomRepo },
        { provide: MessageRepository, useValue: messageRepo },
      ],
    }).compile();

    useCase = module.get<GetChatRoomMessagesUseCase>(
      GetChatRoomMessagesUseCase,
    );
  });

  it('debe retornar los mensajes si el usuario es participante', async () => {
    chatRoomRepo.findById.mockResolvedValue({ ...mockRoom });
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        chatRoomId: 'room-1',
        senderId: 'adopter-1',
        content: 'Hola',
        attachmentUrl: null,
        attachmentType: null,
        readAt: null,
        createdAt: new Date(),
        chatRoom: null as any,
        sender: null as any,
      },
    ];
    messageRepo.findByRoomId.mockResolvedValue(mockMessages);

    const result = await useCase.execute('room-1', 'adopter-1', { limit: 20 });

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Hola');
    expect(messageRepo.findByRoomId).toHaveBeenCalledWith(
      'room-1',
      20,
      undefined,
    );
  });

  it('debe lanzar UnauthorizedChatAccessForbiddenException si el usuario no es participante', async () => {
    chatRoomRepo.findById.mockResolvedValue({ ...mockRoom });

    await expect(
      useCase.execute('room-1', 'intruder-id'),
    ).rejects.toThrow(UnauthorizedChatAccessForbiddenException);
  });

  it('debe lanzar ChatRoomNotFoundException si la sala no existe', async () => {
    chatRoomRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', 'adopter-1'),
    ).rejects.toThrow(ChatRoomNotFoundException);
  });
});
