import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { CreatePetDto } from '../../application/dtos/create-pet.dto';
import { PetResponseDto } from '../../application/dtos/pet-response.dto';
import { CreatePetUseCase } from '../../application/use-cases/create-pet.use-case';
import { DeletePetUseCase } from '../../application/use-cases/delete-pet.use-case';
import { GetMyPetsUseCase } from '../../application/use-cases/get-my-pets.use-case';
import { GetPetByIdUseCase } from '../../application/use-cases/get-pet-by-id.use-case';
import { ListPublicPetsUseCase } from '../../application/use-cases/list-public-pets.use-case';
import { UpdatePetStatusUseCase } from '../../application/use-cases/update-pet-status.use-case';
import { UpdatePetUseCase } from '../../application/use-cases/update-pet.use-case';
import { PetGender } from '../../domain/value-objects/pet-gender.enum';
import { PetSize } from '../../domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { PetsController } from './pets.controller';

describe('PetsController', () => {
  let controller: PetsController;

  const mockCreatePetUseCase = { execute: jest.fn() };
  const mockGetMyPetsUseCase = { execute: jest.fn() };
  const mockGetPetByIdUseCase = { execute: jest.fn() };
  const mockListPublicPetsUseCase = { execute: jest.fn() };
  const mockUpdatePetUseCase = { execute: jest.fn() };
  const mockUpdatePetStatusUseCase = { execute: jest.fn() };
  const mockDeletePetUseCase = { execute: jest.fn() };

  const shelterUser: User = {
    id: 'shelter-1',
    role: UserRole.SHELTER,
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        { provide: CreatePetUseCase, useValue: mockCreatePetUseCase },
        { provide: GetMyPetsUseCase, useValue: mockGetMyPetsUseCase },
        { provide: GetPetByIdUseCase, useValue: mockGetPetByIdUseCase },
        { provide: ListPublicPetsUseCase, useValue: mockListPublicPetsUseCase },
        { provide: UpdatePetUseCase, useValue: mockUpdatePetUseCase },
        {
          provide: UpdatePetStatusUseCase,
          useValue: mockUpdatePetStatusUseCase,
        },
        { provide: DeletePetUseCase, useValue: mockDeletePetUseCase },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);
  });

  it('should call CreatePetUseCase on create', async () => {
    const dto: CreatePetDto = {
      name: 'Firulais',
      species: PetSpecies.DOG,
      gender: PetGender.MALE,
      ageMonths: 12,
      size: PetSize.MEDIUM,
      energyLevel: 3,
      vocalizationLevel: 2,
      description: 'Lindo perrito',
      photos: [
        {
          url: 'http://pic.jpg',
          publicId: 'pic1',
          isPrimary: true,
        },
      ],
    };

    const expectedResponse = {
      id: 'pet-1',
      name: 'Firulais',
    } as PetResponseDto;
    mockCreatePetUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.create(shelterUser, dto);

    expect(result).toBe(expectedResponse);
    expect(mockCreatePetUseCase.execute).toHaveBeenCalledWith(shelterUser, dto);
  });

  it('should call GetMyPetsUseCase on getMyPets', async () => {
    const query = { page: 1, limit: 10 };
    const expected = { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    mockGetMyPetsUseCase.execute.mockResolvedValue(expected);

    const result = await controller.getMyPets(shelterUser, query);

    expect(result).toBe(expected);
    expect(mockGetMyPetsUseCase.execute).toHaveBeenCalledWith(
      shelterUser,
      query,
    );
  });

  it('should call GetPetByIdUseCase on getById', async () => {
    const expected = { id: 'pet-1' } as PetResponseDto;
    mockGetPetByIdUseCase.execute.mockResolvedValue(expected);

    const result = await controller.getById('pet-1', shelterUser);

    expect(result).toBe(expected);
    expect(mockGetPetByIdUseCase.execute).toHaveBeenCalledWith(
      'pet-1',
      shelterUser,
    );
  });

  it('should call ListPublicPetsUseCase on listPublic', async () => {
    const query = { species: PetSpecies.CAT };
    const expected = { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    mockListPublicPetsUseCase.execute.mockResolvedValue(expected);

    const result = await controller.listPublic(query);

    expect(result).toBe(expected);
    expect(mockListPublicPetsUseCase.execute).toHaveBeenCalledWith(query);
  });

  it('should call UpdatePetUseCase on update', async () => {
    const dto = { name: 'New Name' };
    const expected = { id: 'pet-1', name: 'New Name' } as PetResponseDto;
    mockUpdatePetUseCase.execute.mockResolvedValue(expected);

    const result = await controller.update('pet-1', shelterUser, dto);

    expect(result).toBe(expected);
    expect(mockUpdatePetUseCase.execute).toHaveBeenCalledWith(
      'pet-1',
      shelterUser,
      dto,
    );
  });

  it('should call UpdatePetStatusUseCase on updateStatus', async () => {
    const dto = { status: PetStatus.ADOPTED };
    const expected = {
      id: 'pet-1',
      status: PetStatus.ADOPTED,
    } as PetResponseDto;
    mockUpdatePetStatusUseCase.execute.mockResolvedValue(expected);

    const result = await controller.updateStatus('pet-1', shelterUser, dto);

    expect(result).toBe(expected);
    expect(mockUpdatePetStatusUseCase.execute).toHaveBeenCalledWith(
      'pet-1',
      shelterUser,
      dto,
    );
  });

  it('should call DeletePetUseCase on delete', async () => {
    mockDeletePetUseCase.execute.mockResolvedValue(undefined);

    await controller.delete('pet-1', shelterUser);

    expect(mockDeletePetUseCase.execute).toHaveBeenCalledWith(
      'pet-1',
      shelterUser,
    );
  });
});
