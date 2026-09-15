import { AdopterProfile } from '../entities/adopter-profile.entity';

export abstract class AdopterProfileRepository {
  abstract findByUserId(userId: string): Promise<AdopterProfile | null>;
  abstract save(profile: AdopterProfile): Promise<AdopterProfile>;
  abstract create(data: Partial<AdopterProfile>): AdopterProfile;
  abstract deleteByUserId(userId: string): Promise<void>;
}
