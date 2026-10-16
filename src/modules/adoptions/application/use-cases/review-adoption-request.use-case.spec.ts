import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../../domain/value-objects/adoption-rejection-reason.enum';
import { AdoptionStatusChangedEvent } from '../../domain/events/adoption-status-changed.event';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import {
  AdoptionActionNotAllowedException,
  AdoptionRequestNotFoundException,
  UnauthorizedShelterActionForbiddenException,
} from '../../domain/exceptions/adoption.exceptions';
import { ReviewAdoptionRequestUseCase } from './review-adoption-request.use-case';

describe('ReviewAdoptionRequestUseCase', () => {
  let useCase: ReviewAdoptionRequestUseCase;

  const mockAdoptionRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewAdoptionRequestUseCase,
        { provide: AdoptionRequestRepository, useValue: mockAdoptionRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<ReviewAdoptionRequestUseCase>(
      ReviewAdoptionRequestUseCase,
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

  it('should throw AdoptionRequestNotFoundException if request does not exist', async () => {
    mockAdoptionRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-req', 'shelter-1', {
        status: AdoptionStatus.UNDER_REVIEW,
      }),
    ).rejects.toThrow(AdoptionRequestNotFoundException);
  });

  it('should throw UnauthorizedShelterActionForbiddenException if shelter does not own adoption', async () => {
    mockAdoptionRepo.findById.mockResolvedValue(baseAdoption);

    await expect(
      useCase.execute('req-1', 'other-shelter', {
        status: AdoptionStatus.UNDER_REVIEW,
      }),
    ).rejects.toThrow(UnauthorizedShelterActionForbiddenException);
  });

  it('should throw AdoptionActionNotAllowedException if request is already finalized', async () => {
    mockAdoptionRepo.findById.mockResolvedValue({
      ...baseAdoption,
      status: AdoptionStatus.REJECTED,
    });

    await expect(
      useCase.execute('req-1', 'shelter-1', {
        status: AdoptionStatus.APPROVED,
      }),
    ).rejects.toThrow(AdoptionActionNotAllowedException);
  });

  it('should update request to UNDER_REVIEW successfully', async () => {
    const underReviewAdoption = {
      ...baseAdoption,
      status: AdoptionStatus.UNDER_REVIEW,
    };

    mockAdoptionRepo.findById
      .mockResolvedValueOnce(baseAdoption)
      .mockResolvedValueOnce(underReviewAdoption);
    mockAdoptionRepo.save.mockResolvedValue(underReviewAdoption);

    const result = await useCase.execute('req-1', 'shelter-1', {
      status: AdoptionStatus.UNDER_REVIEW,
    });

    expect(result.status).toBe(AdoptionStatus.UNDER_REVIEW);
    expect(mockAdoptionRepo.save).toHaveBeenCalled();
  });

  it('should reject request with valid reason and feedback note', async () => {
    const rejectedAdoption = {
      ...baseAdoption,
      status: AdoptionStatus.REJECTED,
      rejectionReason: AdoptionRejectionReason.INCOMPATIBLE_HOUSING,
      rejectionNotes: 'El departamento no cuenta con mallas de seguridad.',
    };

    mockAdoptionRepo.findById
      .mockResolvedValueOnce(baseAdoption)
      .mockResolvedValueOnce(rejectedAdoption);
    mockAdoptionRepo.save.mockResolvedValue(rejectedAdoption);

    const result = await useCase.execute('req-1', 'shelter-1', {
      status: AdoptionStatus.REJECTED,
      rejectionReason: AdoptionRejectionReason.INCOMPATIBLE_HOUSING,
      rejectionNotes: 'El departamento no cuenta con mallas de seguridad.',
    });

    expect(result.status).toBe(AdoptionStatus.REJECTED);
    expect(result.rejectionReason).toBe(
      AdoptionRejectionReason.INCOMPATIBLE_HOUSING,
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      AdoptionStatusChangedEvent.EVENT_NAME,
      expect.any(AdoptionStatusChangedEvent),
    );
  });

  it('should execute atomic transaction when approving application and close competing requests', async () => {
    mockAdoptionRepo.findById.mockResolvedValue(baseAdoption);

    const mockTransactionalManager = {
      save: jest.fn().mockImplementation((_entityClass, entity) => Promise.resolve(entity)),
      update: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([
        {
          id: 'competitor-req-2',
          petId: 'pet-1',
          adopterId: 'competitor-adopter',
          shelterId: 'shelter-1',
          status: AdoptionStatus.PENDING,
          pet: { id: 'pet-1', name: 'Max' },
          adopter: { id: 'competitor-adopter', fullName: 'Competitor', email: 'comp@test.com' },
        },
      ]),
    };

    mockDataSource.transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTransactionalManager);
    });

    const approvedAdoption = {
      ...baseAdoption,
      status: AdoptionStatus.APPROVED,
    };
    mockAdoptionRepo.findById.mockResolvedValueOnce(baseAdoption).mockResolvedValueOnce(approvedAdoption);

    const result = await useCase.execute('req-1', 'shelter-1', {
      status: AdoptionStatus.APPROVED,
      reviewNotes: 'Adoptante excelente, cumple con todos los requisitos.',
    });

    expect(result.status).toBe(AdoptionStatus.APPROVED);
    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      AdoptionStatusChangedEvent.EVENT_NAME,
      expect.objectContaining({
        adoptionId: 'req-1',
        newStatus: AdoptionStatus.APPROVED,
      }),
    );
  });
});
