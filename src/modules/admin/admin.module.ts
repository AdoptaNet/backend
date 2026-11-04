import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './presentation/controllers/admin.controller';
import { GetAdminMetricsUseCase } from './application/use-cases/get-admin-metrics.use-case';
import { CheckSystemHealthUseCase } from './application/use-cases/check-system-health.use-case';
import { GetAdminSheltersUseCase } from './application/use-cases/get-admin-shelters.use-case';
import { Pet } from '../pets/domain/entities/pet.entity';
import { AdoptionRequest } from '../adoptions/domain/entities/adoption-request.entity';
import { User } from '../users/domain/entities/user.entity';
import { ShelterProfile } from '../users/domain/entities/shelter-profile.entity';
import { RecommendationInteraction } from '../recommendations/domain/entities/recommendation-interaction.entity';
import { RecommendationCache } from '../recommendations/domain/entities/recommendation-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pet,
      AdoptionRequest,
      User,
      ShelterProfile,
      RecommendationInteraction,
      RecommendationCache,
    ]),
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [AdminController],
  providers: [
    GetAdminMetricsUseCase,
    CheckSystemHealthUseCase,
    GetAdminSheltersUseCase,
  ],
  exports: [
    GetAdminMetricsUseCase,
    CheckSystemHealthUseCase,
    GetAdminSheltersUseCase,
  ],
})
export class AdminModule {}
