import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PasswordNotSetException extends DomainException {
  constructor() {
    super(
      'La cuenta fue creada mediante un proveedor externo (Google) y no tiene una contraseña establecida',
    );
  }
}
