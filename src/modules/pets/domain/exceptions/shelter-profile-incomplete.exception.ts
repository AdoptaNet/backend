import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ShelterProfileIncompleteException extends DomainException {
  constructor(
    message = 'El perfil del albergue debe tener al menos nombre de organización, teléfono y ciudad para poder publicar mascotas',
  ) {
    super(message);
  }
}
