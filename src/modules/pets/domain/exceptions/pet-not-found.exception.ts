import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PetNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Pet with identifier "${identifier}" was not found`);
  }
}
