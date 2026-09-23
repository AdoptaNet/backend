import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidCurrentPasswordException extends DomainException {
  constructor(message = 'La contraseña actual ingresada es incorrecta') {
    super(message);
  }
}
