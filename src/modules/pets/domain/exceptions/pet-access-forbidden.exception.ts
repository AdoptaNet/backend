import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PetAccessForbiddenException extends DomainException {
  constructor(
    message = 'No tienes permisos para realizar esta acción sobre esta mascota',
  ) {
    super(message);
  }
}
