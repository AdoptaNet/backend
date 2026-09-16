import { PetAgeCategory } from '../value-objects/pet-age-category.enum';

export function calculateAgeCategory(ageMonths: number): PetAgeCategory {
  if (ageMonths < 12) {
    return PetAgeCategory.PUPPY;
  }
  if (ageMonths < 36) {
    return PetAgeCategory.YOUNG;
  }
  if (ageMonths < 96) {
    return PetAgeCategory.ADULT;
  }
  return PetAgeCategory.SENIOR;
}
