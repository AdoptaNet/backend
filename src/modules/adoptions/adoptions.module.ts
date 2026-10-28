import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PetsModule } from '../pets/pets.module';
import { UsersModule } from '../users/users.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { AdoptionRequest } from './domain/entities/adoption-request.entity';
import { AdoptionRequestRepository } from './domain/repositories/adoption-request.repository';
import { AdoptionRequestTypeOrmRepository } from './infrastructure/persistence/adoption-request.typeorm-repository';
import { SubmitAdoptionRequestUseCase } from './application/use-cases/submit-adoption-request.use-case';
import { GetMyAdoptionsUseCase } from './application/use-cases/get-my-adoptions.use-case';
import { CancelAdoptionRequestUseCase } from './application/use-cases/cancel-adoption-request.use-case';
import { GetShelterAdoptionsUseCase } from './application/use-cases/get-shelter-adoptions.use-case';
import { GetAdoptionByIdUseCase } from './application/use-cases/get-adoption-by-id.use-case';
import { ReviewAdoptionRequestUseCase } from './application/use-cases/review-adoption-request.use-case';
import { GetAdoptionDossierUseCase } from './application/use-cases/get-adoption-dossier.use-case';
import { AdoptionsController } from './presentation/controllers/adoptions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdoptionRequest]),
    forwardRef(() => AuthModule),
    forwardRef(() => PetsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => RecommendationsModule),
  ],
  controllers: [AdoptionsController],
  providers: [
    {
      provide: AdoptionRequestRepository,
      useClass: AdoptionRequestTypeOrmRepository,
    },
    SubmitAdoptionRequestUseCase,
    GetMyAdoptionsUseCase,
    CancelAdoptionRequestUseCase,
    GetShelterAdoptionsUseCase,
    GetAdoptionByIdUseCase,
    ReviewAdoptionRequestUseCase,
    GetAdoptionDossierUseCase,
  ],
  exports: [
    AdoptionRequestRepository,
    SubmitAdoptionRequestUseCase,
    GetMyAdoptionsUseCase,
    CancelAdoptionRequestUseCase,
    GetShelterAdoptionsUseCase,
    GetAdoptionByIdUseCase,
    ReviewAdoptionRequestUseCase,
    GetAdoptionDossierUseCase,
  ],
})
export class AdoptionsModule {}
