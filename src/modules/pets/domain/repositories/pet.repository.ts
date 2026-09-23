import { Pet } from '../entities/pet.entity';
import { PetAgeCategory } from '../value-objects/pet-age-category.enum';
import { PetGender } from '../value-objects/pet-gender.enum';
import { PetSize } from '../value-objects/pet-size.enum';
import { PetSpecies } from '../value-objects/pet-species.enum';
import { PetStatus } from '../value-objects/pet-status.enum';

export interface FindShelterPetsOptions {
  status?: PetStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FindPublicPetsOptions {
  species?: PetSpecies;
  size?: PetSize;
  ageCategory?: PetAgeCategory;
  gender?: PetGender;
  city?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export abstract class PetRepository {
  abstract findById(id: string): Promise<Pet | null>;
  abstract findByIdWithPhotos(id: string): Promise<Pet | null>;
  abstract findByShelter(
    shelterId: string,
    options: FindShelterPetsOptions,
  ): Promise<[Pet[], number]>;
  abstract findPublic(options: FindPublicPetsOptions): Promise<[Pet[], number]>;
  abstract save(pet: Pet): Promise<Pet>;
  abstract softDelete(id: string): Promise<void>;
}
