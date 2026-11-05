import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpRecord } from './domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from './domain/entities/follow-up-milestone.entity';
import { FollowUpEvidence } from './domain/entities/follow-up-evidence.entity';
import { PetReturn } from './domain/entities/pet-return.entity';
import { AdoptionRequest } from '../adoptions/domain/entities/adoption-request.entity';
import { Pet } from '../pets/domain/entities/pet.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { InitializeFollowUpUseCase } from './application/use-cases/initialize-follow-up.use-case';
import { GetFollowUpsUseCase } from './application/use-cases/get-follow-ups.use-case';
import { GetFollowUpDetailUseCase } from './application/use-cases/get-follow-up-detail.use-case';
import { SubmitMilestoneEvidenceUseCase } from './application/use-cases/submit-milestone-evidence.use-case';
import { ReviewMilestoneUseCase } from './application/use-cases/review-milestone.use-case';
import { RequestPetReturnUseCase } from './application/use-cases/request-pet-return.use-case';
import { CoordinatePetReturnUseCase } from './application/use-cases/coordinate-pet-return.use-case';
import { CompletePetReturnUseCase } from './application/use-cases/complete-pet-return.use-case';
import { SimulateMilestoneTimeUseCase } from './application/use-cases/simulate-milestone-time.use-case';
import { RunFollowUpCronUseCase } from './application/use-cases/run-follow-up-cron.use-case';
import { FollowUpCronService } from './infrastructure/services/follow-up-cron.service';
import { FollowUpAdoptionEventListener } from './application/listeners/follow-up-adoption-event.listener';
import { FollowUpNotificationListener } from './application/listeners/follow-up-notification.listener';
import { FollowUpsController } from './presentation/controllers/follow-ups.controller';
import { PetReturnsController } from './presentation/controllers/pet-returns.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FollowUpRecord,
      FollowUpMilestone,
      FollowUpEvidence,
      PetReturn,
      AdoptionRequest,
      Pet,
    ]),
    NotificationsModule,
  ],
  controllers: [FollowUpsController, PetReturnsController],
  providers: [
    InitializeFollowUpUseCase,
    GetFollowUpsUseCase,
    GetFollowUpDetailUseCase,
    SubmitMilestoneEvidenceUseCase,
    ReviewMilestoneUseCase,
    RequestPetReturnUseCase,
    CoordinatePetReturnUseCase,
    CompletePetReturnUseCase,
    SimulateMilestoneTimeUseCase,
    RunFollowUpCronUseCase,
    FollowUpCronService,
    FollowUpAdoptionEventListener,
    FollowUpNotificationListener,
  ],
  exports: [
    InitializeFollowUpUseCase,
    GetFollowUpsUseCase,
    GetFollowUpDetailUseCase,
    SubmitMilestoneEvidenceUseCase,
    ReviewMilestoneUseCase,
    RequestPetReturnUseCase,
    CoordinatePetReturnUseCase,
    CompletePetReturnUseCase,
    RunFollowUpCronUseCase,
  ],
})
export class FollowUpsModule {}
