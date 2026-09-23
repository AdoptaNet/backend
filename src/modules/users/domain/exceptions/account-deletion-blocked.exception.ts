import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class AccountDeletionBlockedException extends DomainException {
  constructor(
    message = 'No se puede dar de baja la cuenta mientras existan procesos activos o animales a cargo',
  ) {
    super(message);
  }
}
