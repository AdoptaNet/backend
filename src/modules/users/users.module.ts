import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { PetsModule } from '../pets/pets.module';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';
import { DeleteAvatarUseCase } from './application/use-cases/delete-avatar.use-case';
import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { SelectUserRoleUseCase } from './application/use-cases/select-user-role.use-case';
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
    forwardRef(() => PetsModule),
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
    DeleteAvatarUseCase,
    ChangePasswordUseCase,
    UpdateAdopterProfileUseCase,
    UpdateShelterProfileUseCase,
    SelectUserRoleUseCase,
    DeleteAccountUseCase,
  ],
  exports: [
    UserRepository,
    AdopterProfileRepository,
    ShelterProfileRepository,
    GetMyProfileUseCase,
    SelectUserRoleUseCase,
    DeleteAccountUseCase,
  ],
})
export class UsersModule {}
