import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class FileTooLargeException extends DomainException {
  constructor(sizeBytes: number, maxBytes: number) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
    super(
      `El archivo pesa ${sizeMb}MB, excediendo el límite máximo permitido de ${maxMb}MB`,
    );
  }
}
