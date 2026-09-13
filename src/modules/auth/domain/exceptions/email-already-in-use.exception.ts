import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class EmailAlreadyInUseException extends DomainException {
  constructor(email: string) {
    super(`El correo electrónico "${email}" ya se encuentra registrado`);
  }
}
