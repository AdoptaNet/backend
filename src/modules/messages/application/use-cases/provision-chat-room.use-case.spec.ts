import { Test, TestingModule } from '@nestjs/testing';
import { AdoptionRequestRepository } from '../../../adoptions/domain/repositories/adoption-request.repository';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { AdoptionRequest } from '../../../adoptions/domain/entities/adoption-request.entity';
import { ProvisionChatRoomUseCase } from './provision-chat-room.use-case';

describe('ProvisionChatRoomUseCase', () => {
  let useCase: ProvisionChatRoomUseCase;
  let chatRoomRepo: jest.Mocked<ChatRoomRepository>;
  let adoptionRepo: jest.Mocked<AdoptionRequestRepository>;

  beforeEach(async () => {
    chatRoomRepo = {
      findById: jest.fn(),
      findByAdoptionRequestId: jest.fn(),
      findUserRooms: jest.fn(),
      save: jest.fn().mockImplementation((r) => Promise.resolve(r)),
    };

    adoptionRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      countActiveByAdopterId: jest.fn(),
      findActiveByPetAndAdopter: jest.fn(),
      findMyAdoptions: jest.fn(),
      findShelterAdoptions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvisionChatRoomUseCase,
        { provide: ChatRoomRepository, useValue: chatRoomRepo },
        { provide: AdoptionRequestRepository, useValue: adoptionRepo },
      ],
    }).compile();

    useCase = module.get<ProvisionChatRoomUseCase>(ProvisionChatRoomUseCase);
  });

  it('debe crear una nueva sala de chat si no existe para la postulación', async () => {
    chatRoomRepo.findByAdoptionRequestId.mockResolvedValue(null);
    adoptionRepo.findById.mockResolvedValue({
      id: 'adoption-1',
      adopterId: 'adopter-1',
      shelterId: 'shelter-1',
    } as AdoptionRequest);

    const result = await useCase.execute('adoption-1', true);

    expect(result).toBeDefined();
    expect(result?.adoptionRequestId).toBe('adoption-1');
    expect(result?.isActive).toBe(true);
    expect(chatRoomRepo.save).toHaveBeenCalled();
  });

  it('debe retornar la sala existente de forma idempotente sin duplicar', async () => {
    const existingRoom = {
      id: 'room-1',
      adoptionRequestId: 'adoption-1',
      isActive: true,
    } as ChatRoom;

    chatRoomRepo.findByAdoptionRequestId.mockResolvedValue(existingRoom);

    const result = await useCase.execute('adoption-1', true);

    expect(result?.id).toBe('room-1');
    expect(adoptionRepo.findById).not.toHaveBeenCalled();
  });

  it('debe congelar la sala existente si isActive cambia a false', async () => {
    const existingRoom = {
      id: 'room-1',
      adoptionRequestId: 'adoption-1',
      isActive: true,
    } as ChatRoom;

    chatRoomRepo.findByAdoptionRequestId.mockResolvedValue(existingRoom);

    const result = await useCase.execute('adoption-1', false);

    expect(result?.isActive).toBe(false);
    expect(chatRoomRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });
});
