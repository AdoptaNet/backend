import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionCancelledEvent } from '../../domain/events/adoption-cancelled.event';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import {
  AdoptionActionNotAllowedException,
  AdoptionRequestNotFoundException,
} from '../../domain/exceptions/adoption.exceptions';
import { CancelAdoptionRequestUseCase } from './cancel-adoption-request.use-case';

describe('CancelAdoptionRequestUseCase', () => {
  let useCase: CancelAdoptionRequestUseCase;

  const mockAdoptionRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelAdoptionRequestUseCase,
        { provide: AdoptionRequestRepository, useValue: mockAdoptionRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<CancelAdoptionRequestUseCase>(
      CancelAdoptionRequestUseCase,
    );
  });

  const baseAdoption: AdoptionRequest = {
    id: 'req-1',
    petId: 'pet-1',
    shelterId: 'shelter-1',
    adopterId: 'adopter-1',
    status: AdoptionStatus.PENDING,
    motivationLetter: 'Carta de motivación con suficiente extensión.',
    adopterSnapshot: {} as any,
    pet: { id: 'pet-1', name: 'Max' } as any,
    adopter: { id: 'adopter-1', fullName: 'John Doe', email: 'john@example.com' } as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AdoptionRequest;

  it('should throw AdoptionRequestNotFoundException if request not found or adopter is different', async () => {
    mockAdoptionRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id', 'adopter-1')).rejects.toThrow(
      AdoptionRequestNotFoundException,
    );

    mockAdoptionRepo.findById.mockResolvedValue(baseAdoption);
    await expect(useCase.execute('req-1', 'other-adopter')).rejects.toThrow(
      AdoptionRequestNotFoundException,
    );
  });

  it('should throw AdoptionActionNotAllowedException if request is already approved or rejected', async () => {
    mockAdoptionRepo.findById.mockResolvedValue({
      ...baseAdoption,
      status: AdoptionStatus.APPROVED,
    });

    await expect(useCase.execute('req-1', 'adopter-1')).rejects.toThrow(
      AdoptionActionNotAllowedException,
    );
  });

  it('should successfully cancel a pending application and emit event', async () => {
    const cancelledAdoption = {
      ...baseAdoption,
      status: AdoptionStatus.CANCELLED,
    };

    mockAdoptionRepo.findById.mockResolvedValue(baseAdoption);
    mockAdoptionRepo.save.mockResolvedValue(cancelledAdoption);

    const result = await useCase.execute('req-1', 'adopter-1');

    expect(result.status).toBe(AdoptionStatus.CANCELLED);
    expect(mockAdoptionRepo.save).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      AdoptionCancelledEvent.EVENT_NAME,
      expect.any(AdoptionCancelledEvent),
    );
  });
});
