import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class EmailNotVerifiedException extends DomainException {
  constructor(message = 'Debe verificar su correo electrónico antes de ingresar') {
    super(message);
  }
}
