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

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.ormRepo.findOne({ where: { googleId } });
  }

  async save(user: User): Promise<User> {
    return this.ormRepo.save(user);
  }

  create(userData: Partial<User>): User {
    return this.ormRepo.create(userData);
  }
}
