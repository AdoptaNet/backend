import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User with identifier "${identifier}" was not found`);
  }
}
