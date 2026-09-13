import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidFileTypeException extends DomainException {
  constructor(mimetype: string, allowedTypes: string[]) {
    super(
      `Tipo de archivo no permitido: "${mimetype}". Tipos permitidos: ${allowedTypes.join(', ')}`,
    );
  }
}
