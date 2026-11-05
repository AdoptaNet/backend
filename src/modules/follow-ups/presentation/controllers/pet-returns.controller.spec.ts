jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { PetReturnsController } from './pet-returns.controller';
import { CoordinatePetReturnUseCase } from '../../application/use-cases/coordinate-pet-return.use-case';
import { CompletePetReturnUseCase } from '../../application/use-cases/complete-pet-return.use-case';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';

describe('PetReturnsController', () => {
  let controller: PetReturnsController;
  let coordinateUseCase: any;
  let completeUseCase: any;

  beforeEach(() => {
    coordinateUseCase = { execute: jest.fn().mockResolvedValue({ id: 'ret-1' }) };
    completeUseCase = { execute: jest.fn().mockResolvedValue({ id: 'ret-1' }) };

    controller = new PetReturnsController(
      coordinateUseCase,
      completeUseCase,
    );
  });

  it('should coordinate return logistics', async () => {
    const user: any = { id: 'shelter-1', role: UserRole.SHELTER };
    const dto = { scheduledReturnDate: '2026-11-20T10:00:00Z', coordinationNotes: 'Traer jaula' };
    const result = await controller.coordinateReturn('ret-1', dto, user);
    expect(result).toEqual({ id: 'ret-1' });
    expect(coordinateUseCase.execute).toHaveBeenCalledWith('ret-1', dto, 'shelter-1', UserRole.SHELTER);
  });

  it('should complete return', async () => {
    const user: any = { id: 'shelter-1', role: UserRole.SHELTER };
    const dto = { decision: 'accept' as const, shelterObservations: 'Recibido ok' };
    const result = await controller.completeReturn('ret-1', dto, user);
    expect(result).toEqual({ id: 'ret-1' });
    expect(completeUseCase.execute).toHaveBeenCalledWith('ret-1', dto, 'shelter-1', UserRole.SHELTER);
  });
});
