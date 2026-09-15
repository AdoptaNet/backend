import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ProfileNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`El perfil del usuario "${userId}" no fue encontrado`);
  }
}
