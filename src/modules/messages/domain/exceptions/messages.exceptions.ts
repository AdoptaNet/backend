import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ChatRoomNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`No se encontró la sala de conversación identificada con "${identifier}".`);
  }
}

export class UnauthorizedChatAccessForbiddenException extends DomainException {
  constructor() {
    super(
      'No tienes autorización para acceder a esta sala de chat privada ni a sus mensajes.',
    );
  }
}

export class ChatRoomInactiveException extends DomainException {
  constructor() {
    super(
      'Esta conversación ha finalizado porque la postulación de adopción ha sido concluida. El chat se encuentra en modo solo lectura.',
    );
  }
}

export class InvalidMessageContentException extends DomainException {
  constructor(reason?: string) {
    super(
      reason ||
        'El contenido del mensaje debe tener entre 1 y 1000 caracteres, o contener una imagen válida adjunta.',
    );
  }
}
