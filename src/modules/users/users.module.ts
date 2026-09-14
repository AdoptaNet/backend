import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { UpdateAdopterProfileUseCase } from './application/use-cases/update-adopter-profile.use-case';
import { UpdateAvatarUseCase } from './application/use-cases/update-avatar.use-case';
import { UpdateShelterProfileUseCase } from './application/use-cases/update-shelter-profile.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { AdopterProfile } from './domain/entities/adopter-profile.entity';
import { ShelterProfile } from './domain/entities/shelter-profile.entity';
import { User } from './domain/entities/user.entity';
import { AdopterProfileRepository } from './domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from './domain/repositories/shelter-profile.repository';
import { UserRepository } from './domain/repositories/user.repository';
import { AdopterProfileTypeOrmRepository } from './infrastructure/persistence/adopter-profile.typeorm-repository';
import { ShelterProfileTypeOrmRepository } from './infrastructure/persistence/shelter-profile.typeorm-repository';
import { UserTypeOrmRepository } from './infrastructure/persistence/user.typeorm-repository';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AdopterProfile, ShelterProfile]),
    forwardRef(() => AuthModule),
    MediaModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserTypeOrmRepository,
    },
    {
      provide: AdopterProfileRepository,
      useClass: AdopterProfileTypeOrmRepository,
    },
    {
      provide: ShelterProfileRepository,
      useClass: ShelterProfileTypeOrmRepository,
    },
    GetMyProfileUseCase,
    UpdateUserUseCase,
    UpdateAvatarUseCase,
    ChangePasswordUseCase,
    UpdateAdopterProfileUseCase,
    UpdateShelterProfileUseCase,
  ],
  exports: [
    UserRepository,
    AdopterProfileRepository,
    ShelterProfileRepository,
    GetMyProfileUseCase,
  ],
})
export class UsersModule {}
