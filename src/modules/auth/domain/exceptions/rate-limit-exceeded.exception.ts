import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class RateLimitExceededException extends DomainException {
  constructor(
    message = 'Debe esperar al menos 2 minutos antes de solicitar un nuevo enlace',
  ) {
    super(message);
  }
}
