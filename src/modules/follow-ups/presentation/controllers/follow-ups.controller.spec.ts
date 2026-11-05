jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { FollowUpsController } from './follow-ups.controller';
import { GetFollowUpsUseCase } from '../../application/use-cases/get-follow-ups.use-case';
import { GetFollowUpDetailUseCase } from '../../application/use-cases/get-follow-up-detail.use-case';
import { SubmitMilestoneEvidenceUseCase } from '../../application/use-cases/submit-milestone-evidence.use-case';
import { ReviewMilestoneUseCase } from '../../application/use-cases/review-milestone.use-case';
import { RequestPetReturnUseCase } from '../../application/use-cases/request-pet-return.use-case';
import { SimulateMilestoneTimeUseCase } from '../../application/use-cases/simulate-milestone-time.use-case';
import { RunFollowUpCronUseCase } from '../../application/use-cases/run-follow-up-cron.use-case';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetReturnReason } from '../../domain/value-objects/pet-return-reason.enum';

describe('FollowUpsController', () => {
  let controller: FollowUpsController;
  let getFollowUpsUseCase: any;
  let getFollowUpDetailUseCase: any;
  let submitMilestoneEvidenceUseCase: any;
  let reviewMilestoneUseCase: any;
  let requestPetReturnUseCase: any;
  let simulateMilestoneTimeUseCase: any;
  let runFollowUpCronUseCase: any;

  beforeEach(() => {
    getFollowUpsUseCase = { execute: jest.fn().mockResolvedValue([]) };
    getFollowUpDetailUseCase = { execute: jest.fn().mockResolvedValue({ id: 'f-1' }) };
    submitMilestoneEvidenceUseCase = { execute: jest.fn().mockResolvedValue({ id: 'm-1' }) };
    reviewMilestoneUseCase = { execute: jest.fn().mockResolvedValue({ milestone: {}, record: {} }) };
    requestPetReturnUseCase = { execute: jest.fn().mockResolvedValue({ id: 'ret-1' }) };
    simulateMilestoneTimeUseCase = { execute: jest.fn().mockResolvedValue({ message: 'OK' }) };
    runFollowUpCronUseCase = { execute: jest.fn().mockResolvedValue({ scanned: 0 }) };

    controller = new FollowUpsController(
      getFollowUpsUseCase,
      getFollowUpDetailUseCase,
      submitMilestoneEvidenceUseCase,
      reviewMilestoneUseCase,
      requestPetReturnUseCase,
      simulateMilestoneTimeUseCase,
      runFollowUpCronUseCase,
    );
  });

  it('should list follow ups for user', async () => {
    const user: any = { id: 'u-1', role: UserRole.ADOPTER };
    const result = await controller.getFollowUps(user);
    expect(result).toEqual([]);
    expect(getFollowUpsUseCase.execute).toHaveBeenCalledWith('u-1', UserRole.ADOPTER);
  });

  it('should get follow up detail', async () => {
    const user: any = { id: 'u-1', role: UserRole.ADOPTER };
    const result = await controller.getFollowUpDetail('f-1', user);
    expect(result).toEqual({ id: 'f-1' });
    expect(getFollowUpDetailUseCase.execute).toHaveBeenCalledWith('f-1', 'u-1', UserRole.ADOPTER);
  });

  it('should submit milestone evidence', async () => {
    const user: any = { id: 'u-1', role: UserRole.ADOPTER };
    const dto = { adaptationNotes: 'Bien', evidences: [] };
    const result = await controller.submitMilestone('rec-1', 'm-1', dto, user);
    expect(result).toEqual({ id: 'm-1' });
    expect(submitMilestoneEvidenceUseCase.execute).toHaveBeenCalledWith('rec-1', 'm-1', dto, 'u-1');
  });

  it('should request pet return', async () => {
    const user: any = { id: 'u-1', role: UserRole.ADOPTER };
    const dto = {
      reason: PetReturnReason.SEVERE_ALLERGY,
      explanation: 'Alergia severa',
      emergencyContactPhone: '951667124',
    };
    const result = await controller.requestReturn('rec-1', dto, user);
    expect(result).toEqual({ id: 'ret-1' });
    expect(requestPetReturnUseCase.execute).toHaveBeenCalledWith('rec-1', dto, 'u-1');
  });
});
