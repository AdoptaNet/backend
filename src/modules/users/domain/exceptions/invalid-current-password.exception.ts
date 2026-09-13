import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidCurrentPasswordException extends DomainException {
  constructor() {
    super('La contraseña actual ingresada es incorrecta');
  }
}
