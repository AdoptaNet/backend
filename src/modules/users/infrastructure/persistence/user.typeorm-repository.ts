import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UserTypeOrmRepository extends UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormRepo: Repository<User>,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.ormRepo.findOne({ where: { id } });
  }

  async findByIdWithProfile(id: string): Promise<User | null> {
    return this.ormRepo.findOne({
      where: [{ id }, { shelterProfile: { id } }],
      relations: {
        adopterProfile: true,
        shelterProfile: true,
      },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.ormRepo.findOne({ where: { googleId } });
  }

  async findByVerificationTokenHash(hash: string): Promise<User | null> {
    return this.ormRepo.findOne({
      where: { emailVerificationTokenHash: hash },
    });
  }

  async findByPasswordResetTokenHash(hash: string): Promise<User | null> {
    return this.ormRepo.findOne({
      where: { passwordResetTokenHash: hash },
    });
  }

  async save(user: User): Promise<User> {
    return this.ormRepo.save(user);
  }

  create(userData: Partial<User>): User {
    return this.ormRepo.create(userData);
  }
}
