import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdopterProfile } from '../../domain/entities/adopter-profile.entity';
import { AdopterProfileRepository } from '../../domain/repositories/adopter-profile.repository';

@Injectable()
export class AdopterProfileTypeOrmRepository extends AdopterProfileRepository {
  constructor(
    @InjectRepository(AdopterProfile)
    private readonly ormRepo: Repository<AdopterProfile>,
  ) {
    super();
  }

  async findByUserId(userId: string): Promise<AdopterProfile | null> {
    return this.ormRepo.findOne({ where: { userId } });
  }

  async save(profile: AdopterProfile): Promise<AdopterProfile> {
    return this.ormRepo.save(profile);
  }

  create(data: Partial<AdopterProfile>): AdopterProfile {
    return this.ormRepo.create(data);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.ormRepo.delete({ userId });
  }
}
