import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PetPhoto } from '../../domain/entities/pet-photo.entity';
import { Pet } from '../../domain/entities/pet.entity';
import {
  FindPublicPetsOptions,
  FindShelterPetsOptions,
  PetRepository,
} from '../../domain/repositories/pet.repository';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';

@Injectable()
export class PetTypeOrmRepository implements PetRepository {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepo: Repository<Pet>,
    @InjectRepository(PetPhoto)
    private readonly photoRepo: Repository<PetPhoto>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<Pet | null> {
    return this.petRepo.findOne({ where: { id } });
  }

  async findByIdWithPhotos(id: string): Promise<Pet | null> {
    return this.petRepo.findOne({
      where: { id },
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
  }

  async findByShelter(
    shelterId: string,
    options: FindShelterPetsOptions,
  ): Promise<[Pet[], number]> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit =
      options.limit && options.limit > 0 ? Math.min(options.limit, 50) : 10;
    const skip = (page - 1) * limit;

    const qb = this.petRepo
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .where('pet.shelterId = :shelterId', { shelterId });

    if (options.status) {
      qb.andWhere('pet.status = :status', { status: options.status });
    }

    if (options.search) {
      qb.andWhere('LOWER(pet.name) LIKE LOWER(:search)', {
        search: `%${options.search.trim()}%`,
      });
    }

    qb.orderBy('pet.createdAt', 'DESC')
      .addOrderBy('photos.order', 'ASC')
      .skip(skip)
      .take(limit);

    return qb.getManyAndCount();
  }

  async findPublic(options: FindPublicPetsOptions): Promise<[Pet[], number]> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit =
      options.limit && options.limit > 0 ? Math.min(options.limit, 50) : 10;
    const skip = (page - 1) * limit;

    const qb = this.petRepo
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('pet.shelter', 'shelter')
      .leftJoinAndSelect('shelter.shelterProfile', 'shelterProfile')
      .where('pet.status = :status', { status: PetStatus.AVAILABLE });

    if (options.species) {
      qb.andWhere('pet.species = :species', { species: options.species });
    }

    if (options.size) {
      qb.andWhere('pet.size = :size', { size: options.size });
    }

    if (options.ageCategory) {
      qb.andWhere('pet.ageCategory = :ageCategory', {
        ageCategory: options.ageCategory,
      });
    }

    if (options.gender) {
      qb.andWhere('pet.gender = :gender', { gender: options.gender });
    }

    if (options.city) {
      qb.andWhere('LOWER(shelterProfile.city) LIKE LOWER(:city)', {
        city: `%${options.city.trim()}%`,
      });
    }

    if (options.department) {
      qb.andWhere('LOWER(shelterProfile.department) LIKE LOWER(:department)', {
        department: `%${options.department.trim()}%`,
      });
    }

    if (options.search) {
      qb.andWhere('LOWER(pet.name) LIKE LOWER(:search)', {
        search: `%${options.search.trim()}%`,
      });
    }

    qb.orderBy('pet.createdAt', 'DESC')
      .addOrderBy('photos.order', 'ASC')
      .skip(skip)
      .take(limit);

    return qb.getManyAndCount();
  }

  async save(pet: Pet): Promise<Pet> {
    return this.dataSource.transaction(async (manager) => {
      if (pet.id && pet.photos) {
        // Remove existing photos before inserting updated set
        await manager.delete(PetPhoto, { petId: pet.id });
        const photosToSave = pet.photos.map((p, idx) =>
          manager.create(PetPhoto, {
            petId: pet.id,
            url: p.url,
            publicId: p.publicId,
            isPrimary: p.isPrimary,
            order: p.order !== undefined ? p.order : idx,
          }),
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { photos, ...petScalarData } = pet;
        await manager.update(Pet, pet.id, petScalarData);
        const savedPhotos = await manager.save(PetPhoto, photosToSave);
        const reloaded = await manager.findOne(Pet, {
          where: { id: pet.id },
          relations: { photos: true },
        });
        if (reloaded) {
          reloaded.photos = savedPhotos;
          return reloaded;
        }
      }

      return manager.save(Pet, pet);
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.petRepo.softDelete(id);
  }
}
