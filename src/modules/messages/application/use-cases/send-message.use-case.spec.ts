import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ChatRoomInactiveException,
  ChatRoomNotFoundException,
  InvalidMessageContentException,
  UnauthorizedChatAccessForbiddenException,
} from '../../domain/exceptions/messages.exceptions';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { Message } from '../../domain/entities/message.entity';
import { MessageSentEvent } from '../../domain/events/message-sent.event';
import { SendMessageUseCase } from './send-message.use-case';

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let chatRoomRepo: jest.Mocked<ChatRoomRepository>;
  let messageRepo: jest.Mocked<MessageRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

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
      save: jest.fn().mockImplementation((r) => Promise.resolve(r)),
    };

    messageRepo = {
      findByRoomId: jest.fn(),
      save: jest.fn().mockImplementation((m) => {
        m.id = 'msg-1';
        m.createdAt = new Date();
        return Promise.resolve(m);
      }),
      markAsRead: jest.fn(),
      countUnreadForUser: jest.fn(),
      getRoomUnreadCount: jest.fn(),
      getLastMessage: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMessageUseCase,
        { provide: ChatRoomRepository, useValue: chatRoomRepo },
        { provide: MessageRepository, useValue: messageRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    useCase = module.get<SendMessageUseCase>(SendMessageUseCase);
  });

  it('debe enviar un mensaje de texto exitosamente en una sala activa', async () => {
    chatRoomRepo.findById.mockResolvedValue({ ...mockRoom });

    const result = await useCase.execute('room-1', 'adopter-1', {
      content: 'Hola, ¿podemos coordinar la entrega?',
    });

    expect(result.content).toBe('Hola, ¿podemos coordinar la entrega?');
    expect(result.senderId).toBe('adopter-1');
    expect(messageRepo.save).toHaveBeenCalled();
    expect(chatRoomRepo.save).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      MessageSentEvent.EVENT_NAME,
      expect.any(MessageSentEvent),
    );
  });

  it('debe permitir enviar un mensaje con foto adjunta', async () => {
    chatRoomRepo.findById.mockResolvedValue({ ...mockRoom });

    const result = await useCase.execute('room-1', 'adopter-1', {
      content: 'Adjunto foto del patio',
      attachmentUrl: 'https://res.cloudinary.com/firu/patio.jpg',
      attachmentType: 'image/jpeg',
    });

    expect(result.attachmentUrl).toBe(
      'https://res.cloudinary.com/firu/patio.jpg',
    );
  });

  it('debe lanzar InvalidMessageContentException si contenido y adjunto están vacíos', async () => {
    await expect(
      useCase.execute('room-1', 'adopter-1', { content: '   ' }),
    ).rejects.toThrow(InvalidMessageContentException);
  });

  it('debe lanzar ChatRoomNotFoundException si la sala no existe', async () => {
    chatRoomRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', 'adopter-1', { content: 'Hola' }),
    ).rejects.toThrow(ChatRoomNotFoundException);
  });

  it('debe lanzar UnauthorizedChatAccessForbiddenException si el usuario no es participante', async () => {
    chatRoomRepo.findById.mockResolvedValue({ ...mockRoom });

    await expect(
      useCase.execute('room-1', 'stranger-user', { content: 'Hola' }),
    ).rejects.toThrow(UnauthorizedChatAccessForbiddenException);
  });

  it('debe lanzar ChatRoomInactiveException si la sala está congelada (is_active = false)', async () => {
    chatRoomRepo.findById.mockResolvedValue({ ...mockRoom, isActive: false });

    await expect(
      useCase.execute('room-1', 'adopter-1', { content: 'Hola' }),
    ).rejects.toThrow(ChatRoomInactiveException);
  });
});
