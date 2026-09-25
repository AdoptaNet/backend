import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PetDeletionBlockedException extends DomainException {
  constructor(
    message = 'La mascota posee procesos de adopción o historial activo y no puede ser eliminada para garantizar la trazabilidad legal. Se recomienda cambiar su estado a oculto (hidden).',
  ) {
    super(message);
  }
}
