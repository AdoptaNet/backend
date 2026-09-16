import { Test, TestingModule } from '@nestjs/testing';
import { Pet } from '../../domain/entities/pet.entity';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { ListPublicPetsUseCase } from './list-public-pets.use-case';

describe('ListPublicPetsUseCase', () => {
  let useCase: ListPublicPetsUseCase;
  const mockPetRepository = {
    findPublic: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPublicPetsUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<ListPublicPetsUseCase>(ListPublicPetsUseCase);
  });

  it('should return paginated available pets', async () => {
    const pet1 = new Pet();
    pet1.id = 'pet-1';
    pet1.name = 'Max';
    pet1.species = PetSpecies.DOG;
    pet1.status = PetStatus.AVAILABLE;
    pet1.photos = [];
    pet1.createdAt = new Date();
    pet1.updatedAt = new Date();

    mockPetRepository.findPublic.mockResolvedValue([[pet1], 1]);

    const result = await useCase.execute({
      species: PetSpecies.DOG,
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Max');
    expect(mockPetRepository.findPublic).toHaveBeenCalledWith({
      species: PetSpecies.DOG,
      size: undefined,
      ageCategory: undefined,
      gender: undefined,
      city: undefined,
      department: undefined,
      page: 1,
      limit: 10,
    });
  });
});
