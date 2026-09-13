import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class MediaUploadFailedException extends DomainException {
  constructor(reason?: string) {
    super(
      `Error al subir la imagen al servidor de almacenamiento${reason ? `: ${reason}` : ''}`,
    );
  }
}
