import { ShelterProfile } from '../entities/shelter-profile.entity';

export abstract class ShelterProfileRepository {
  abstract findByUserId(userId: string): Promise<ShelterProfile | null>;
  abstract save(profile: ShelterProfile): Promise<ShelterProfile>;
  abstract create(data: Partial<ShelterProfile>): ShelterProfile;
  abstract deleteByUserId(userId: string): Promise<void>;
}
