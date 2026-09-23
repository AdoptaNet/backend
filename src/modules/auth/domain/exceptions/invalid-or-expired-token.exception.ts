import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidOrExpiredTokenException extends DomainException {
  constructor(message = 'El enlace es inválido o ha expirado') {
    super(message);
  }
}
