import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CreatePetUseCase } from './application/use-cases/create-pet.use-case';
import { DeletePetUseCase } from './application/use-cases/delete-pet.use-case';
import { GetMyPetsUseCase } from './application/use-cases/get-my-pets.use-case';
import { GetPetByIdUseCase } from './application/use-cases/get-pet-by-id.use-case';
import { ListPublicPetsUseCase } from './application/use-cases/list-public-pets.use-case';
import { UpdatePetStatusUseCase } from './application/use-cases/update-pet-status.use-case';
import { UpdatePetUseCase } from './application/use-cases/update-pet.use-case';
import { PetPhoto } from './domain/entities/pet-photo.entity';
import { Pet } from './domain/entities/pet.entity';
import { PetRepository } from './domain/repositories/pet.repository';
import { PetTypeOrmRepository } from './infrastructure/persistence/pet.typeorm-repository';
import { PetsController } from './presentation/controllers/pets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, PetPhoto]), UsersModule, AuthModule],
  controllers: [PetsController],
  providers: [
    {
      provide: PetRepository,
      useClass: PetTypeOrmRepository,
    },
    CreatePetUseCase,
    GetMyPetsUseCase,
    GetPetByIdUseCase,
    ListPublicPetsUseCase,
    UpdatePetUseCase,
    UpdatePetStatusUseCase,
    DeletePetUseCase,
  ],
  exports: [PetRepository, GetPetByIdUseCase],
})
export class PetsModule {}
