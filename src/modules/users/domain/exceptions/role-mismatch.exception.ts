import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class RoleMismatchException extends DomainException {
  constructor(expected: string, actual: string) {
    super(
      `Operación no permitida: se esperaba el rol "${expected}", pero el usuario tiene el rol "${actual}"`,
    );
  }
}
