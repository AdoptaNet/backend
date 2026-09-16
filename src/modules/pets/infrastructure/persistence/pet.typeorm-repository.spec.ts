jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

import { DataSource, Repository } from 'typeorm';
import { PetPhoto } from '../../domain/entities/pet-photo.entity';
import { Pet } from '../../domain/entities/pet.entity';
import { PetAgeCategory } from '../../domain/value-objects/pet-age-category.enum';
import { PetGender } from '../../domain/value-objects/pet-gender.enum';
import { PetSize } from '../../domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { PetTypeOrmRepository } from './pet.typeorm-repository';

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
describe('PetTypeOrmRepository', () => {
  let repository: PetTypeOrmRepository;
  let petRepo: jest.Mocked<Partial<Repository<Pet>>>;
  let photoRepo: jest.Mocked<Partial<Repository<PetPhoto>>>;
  let dataSource: jest.Mocked<Partial<DataSource>>;

  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    petRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      softDelete: jest.fn(),
    };

    photoRepo = {};

    dataSource = {
      transaction: jest.fn(),
    };

    repository = new PetTypeOrmRepository(
      petRepo as Repository<Pet>,
      photoRepo as Repository<PetPhoto>,
      dataSource as DataSource,
    );
  });

  it('should find by id', async () => {
    const pet = new Pet();
    pet.id = 'pet-1';
    (petRepo.findOne as jest.Mock).mockResolvedValue(pet);

    const result = await repository.findById('pet-1');
    expect(result).toBe(pet);
    expect(petRepo.findOne).toHaveBeenCalledWith({ where: { id: 'pet-1' } });
  });

  it('should find by id with photos and shelter profile', async () => {
    const pet = new Pet();
    pet.id = 'pet-1';
    (petRepo.findOne as jest.Mock).mockResolvedValue(pet);

    const result = await repository.findByIdWithPhotos('pet-1');
    expect(result).toBe(pet);
    expect(petRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'pet-1' },
      relations: {
        photos: true,
        shelter: {
          shelterProfile: true,
        },
      },
      order: {
        photos: {
          order: 'ASC',
        },
      },
    });
  });

  it('should find shelter pets with filters', async () => {
    const pets = [new Pet()];
    mockQueryBuilder.getManyAndCount.mockResolvedValue([pets, 1]);

    const result = await repository.findByShelter('shelter-1', {
      status: PetStatus.AVAILABLE,
      search: 'Luna',
      page: 2,
      limit: 5,
    });

    expect(result).toEqual([pets, 1]);
    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'pet.shelterId = :shelterId',
      { shelterId: 'shelter-1' },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'pet.status = :status',
      { status: PetStatus.AVAILABLE },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(pet.name) LIKE LOWER(:search)',
      { search: '%Luna%' },
    );
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
  });

  it('should find public pets with filters', async () => {
    const pets = [new Pet()];
    mockQueryBuilder.getManyAndCount.mockResolvedValue([pets, 1]);

    const result = await repository.findPublic({
      species: PetSpecies.DOG,
      size: PetSize.LARGE,
      ageCategory: PetAgeCategory.ADULT,
      gender: PetGender.MALE,
      city: 'Lima',
      department: 'Lima',
      page: 1,
      limit: 10,
    });

    expect(result).toEqual([pets, 1]);
    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'pet.status = :status',
      { status: PetStatus.AVAILABLE },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'pet.species = :species',
      { species: PetSpecies.DOG },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pet.size = :size', {
      size: PetSize.LARGE,
    });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'pet.ageCategory = :ageCategory',
      { ageCategory: PetAgeCategory.ADULT },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'pet.gender = :gender',
      { gender: PetGender.MALE },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(shelterProfile.city) LIKE LOWER(:city)',
      { city: '%Lima%' },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(shelterProfile.department) LIKE LOWER(:department)',
      { department: '%Lima%' },
    );
  });

  it('should save a new pet using transaction manager', async () => {
    const newPet = new Pet();
    newPet.name = 'Rex';

    const mockManager = {
      save: jest.fn().mockResolvedValue(newPet),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    };

    (dataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: any) => Promise<any>) => cb(mockManager),
    );

    const result = await repository.save(newPet);
    expect(result).toBe(newPet);
    expect(mockManager.save).toHaveBeenCalledWith(Pet, newPet);
  });

  it('should update pet and photos within transaction', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.name = 'Rex Updated';
    existingPet.photos = [
      {
        url: 'http://pic.jpg',
        publicId: 'pic1',
        isPrimary: true,
        order: 0,
      } as PetPhoto,
    ];

    const mockSavedPhoto = { ...existingPet.photos[0], id: 'photo-1' };
    const mockManager = {
      delete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockReturnValue(mockSavedPhoto),
      update: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue([mockSavedPhoto]),
      findOne: jest.fn().mockResolvedValue({
        id: 'pet-1',
        name: 'Rex Updated',
      }),
    };

    (dataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: any) => Promise<any>) => cb(mockManager),
    );

    const result = await repository.save(existingPet);
    expect(mockManager.delete).toHaveBeenCalledWith(PetPhoto, {
      petId: 'pet-1',
    });
    expect(result.photos).toEqual([mockSavedPhoto]);
  });

  it('should soft delete pet by id', async () => {
    (petRepo.softDelete as jest.Mock).mockResolvedValue(undefined);
    await repository.softDelete('pet-1');
    expect(petRepo.softDelete).toHaveBeenCalledWith('pet-1');
  });
});
