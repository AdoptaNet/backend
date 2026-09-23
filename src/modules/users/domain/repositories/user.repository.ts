import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByIdWithProfile(id: string): Promise<User | null>;
  abstract findByGoogleId(googleId: string): Promise<User | null>;
  abstract findByVerificationTokenHash(hash: string): Promise<User | null>;
  abstract findByPasswordResetTokenHash(hash: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract create(userData: Partial<User>): User;
}
