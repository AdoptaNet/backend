import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidPhotoCountException extends DomainException {
  constructor(
    message = 'Debe incluir entre 3 y 6 fotografías con exactamente una marcada como principal',
  ) {
    super(message);
  }
}
