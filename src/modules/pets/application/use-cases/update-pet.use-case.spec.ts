import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MediaService } from '../../../media/application/interfaces/media.service';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetPhoto } from '../../domain/entities/pet-photo.entity';
import { Pet } from '../../domain/entities/pet.entity';
import { InvalidPhotoCountException } from '../../domain/exceptions/invalid-photo-count.exception';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { UpdatePetUseCase } from './update-pet.use-case';

describe('UpdatePetUseCase', () => {
  let useCase: UpdatePetUseCase;
  const mockPetRepository = {
    findByIdWithPhotos: jest.fn(),
    save: jest.fn(),
  };
  const mockMediaService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn().mockResolvedValue(true),
  };
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePetUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
        { provide: MediaService, useValue: mockMediaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<UpdatePetUseCase>(UpdatePetUseCase);
  });

  const shelterUser: User = {
    id: 'shelter-1',
    role: UserRole.SHELTER,
  } as User;

  it('should throw PetNotFoundException if pet not found', async () => {
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(null);
    await expect(
      useCase.execute('invalid-id', shelterUser, { name: 'New Name' }),
    ).rejects.toThrow(PetNotFoundException);
  });

  it('should throw PetAccessForbiddenException if pet does not belong to user', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'other-shelter';
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);

    await expect(
      useCase.execute('pet-1', shelterUser, { name: 'New Name' }),
    ).rejects.toThrow(PetAccessForbiddenException);
  });

  it('should throw InvalidPhotoCountException if updated photos array has fewer than 3 or lacks primary', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);

    await expect(
      useCase.execute('pet-1', shelterUser, { photos: [] }),
    ).rejects.toThrow(InvalidPhotoCountException);

    await expect(
      useCase.execute('pet-1', shelterUser, {
        photos: [
          {
            url: 'https://cloudinary.com/pic1.webp',
            publicId: 'pic1',
            isPrimary: true,
          },
          {
            url: 'https://cloudinary.com/pic2.webp',
            publicId: 'pic2',
            isPrimary: false,
          },
        ],
      }),
    ).rejects.toThrow(InvalidPhotoCountException);

    await expect(
      useCase.execute('pet-1', shelterUser, {
        photos: [
          {
            url: 'https://cloudinary.com/pic1.webp',
            publicId: 'pic1',
            isPrimary: false,
          },
          {
            url: 'https://cloudinary.com/pic2.webp',
            publicId: 'pic2',
            isPrimary: false,
          },
          {
            url: 'https://cloudinary.com/pic3.webp',
            publicId: 'pic3',
            isPrimary: false,
          },
        ],
      }),
    ).rejects.toThrow(InvalidPhotoCountException);
  });

  it('should delete orphaned photos from Cloudinary when photos are replaced', async () => {
    const oldPhoto1 = new PetPhoto();
    oldPhoto1.id = 'photo-1';
    oldPhoto1.publicId = 'firu/old-photo-1';
    oldPhoto1.url = 'https://cloudinary.com/firu/old-photo-1.webp';
    oldPhoto1.isPrimary = true;

    const oldPhoto2 = new PetPhoto();
    oldPhoto2.id = 'photo-2';
    oldPhoto2.publicId = 'firu/old-photo-2';
    oldPhoto2.url = 'https://cloudinary.com/firu/old-photo-2.webp';
    oldPhoto2.isPrimary = false;

    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.photos = [oldPhoto1, oldPhoto2];
    existingPet.createdAt = new Date();
    existingPet.updatedAt = new Date();

    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);
    mockPetRepository.save.mockImplementation((pet: Pet) => Promise.resolve(pet));

    const newPhotos = [
      {
        url: 'https://cloudinary.com/firu/old-photo-1.webp',
        publicId: 'firu/old-photo-1',
        isPrimary: true,
      },
      {
        url: 'https://cloudinary.com/firu/new-photo-3.webp',
        publicId: 'firu/new-photo-3',
        isPrimary: false,
      },
      {
        url: 'https://cloudinary.com/firu/new-photo-4.webp',
        publicId: 'firu/new-photo-4',
        isPrimary: false,
      },
    ];

    await useCase.execute('pet-1', shelterUser, { photos: newPhotos });

    expect(mockMediaService.deleteImage).toHaveBeenCalledWith('firu/old-photo-2');
    expect(mockMediaService.deleteImage).not.toHaveBeenCalledWith('firu/old-photo-1');
  });

  it('should update pet successfully when owner updates it and emit event', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.name = 'Old Name';
    existingPet.photos = [];
    existingPet.createdAt = new Date();
    existingPet.updatedAt = new Date();
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);
    mockPetRepository.save.mockImplementation((pet: Pet) => Promise.resolve(pet));

    const result = await useCase.execute('pet-1', shelterUser, {
      name: 'New Name',
      energyLevel: 4,
    });

    expect(result.name).toBe('New Name');
    expect(result.energyLevel).toBe(4);
    expect(mockPetRepository.save).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'pet.updated',
      expect.objectContaining({ petId: 'pet-1' }),
    );
  });
});
