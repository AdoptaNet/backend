import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';

@Injectable()
export class ShelterProfileTypeOrmRepository extends ShelterProfileRepository {
  constructor(
    @InjectRepository(ShelterProfile)
    private readonly ormRepo: Repository<ShelterProfile>,
  ) {
    super();
  }

  async findByUserId(userId: string): Promise<ShelterProfile | null> {
    return this.ormRepo.findOne({ where: { userId } });
  }

  async save(profile: ShelterProfile): Promise<ShelterProfile> {
    return this.ormRepo.save(profile);
  }

  create(data: Partial<ShelterProfile>): ShelterProfile {
    return this.ormRepo.create(data);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.ormRepo.delete({ userId });
  }
}
