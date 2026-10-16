import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { UsersModule } from '../users/users.module';
import { AnalyzePetPhotosUseCase } from './application/use-cases/analyze-pet-photos.use-case';
import { CreatePetUseCase } from './application/use-cases/create-pet.use-case';
import { DeletePetUseCase } from './application/use-cases/delete-pet.use-case';
import { GetMyPetsUseCase } from './application/use-cases/get-my-pets.use-case';
import { GetPetByIdUseCase } from './application/use-cases/get-pet-by-id.use-case';
import { ListPublicPetsUseCase } from './application/use-cases/list-public-pets.use-case';
import { SearchSimilarPetsUseCase } from './application/use-cases/search-similar-pets.use-case';
import { UpdatePetStatusUseCase } from './application/use-cases/update-pet-status.use-case';
import { UpdatePetUseCase } from './application/use-cases/update-pet.use-case';
import { PetPhoto } from './domain/entities/pet-photo.entity';
import { Pet } from './domain/entities/pet.entity';
import { PetRepository } from './domain/repositories/pet.repository';
import { PetTypeOrmRepository } from './infrastructure/persistence/pet.typeorm-repository';
import { VisionMlService } from './infrastructure/services/vision-ml.service';
import { PetsController } from './presentation/controllers/pets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet, PetPhoto]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    MediaModule,
  ],
  controllers: [PetsController],
  providers: [
    {
      provide: PetRepository,
      useClass: PetTypeOrmRepository,
    },
    VisionMlService,
    AnalyzePetPhotosUseCase,
    SearchSimilarPetsUseCase,
    CreatePetUseCase,
    GetMyPetsUseCase,
    GetPetByIdUseCase,
    ListPublicPetsUseCase,
    UpdatePetUseCase,
    UpdatePetStatusUseCase,
    DeletePetUseCase,
  ],
  exports: [
    PetRepository,
    GetPetByIdUseCase,
    VisionMlService,
    AnalyzePetPhotosUseCase,
    SearchSimilarPetsUseCase,
  ],
})
export class PetsModule {}
