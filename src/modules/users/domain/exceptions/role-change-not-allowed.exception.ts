import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class RoleChangeNotAllowedException extends DomainException {
  constructor(
    message: string = 'No es posible cambiar el rol una vez que el perfil ha sido configurado.',
  ) {
    super(message);
  }
}
