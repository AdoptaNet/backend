import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class MaxActiveAdoptionsConflictException extends DomainException {
  constructor() {
    super(
      'Has alcanzado el límite máximo de 3 solicitudes simultáneas en evaluación. Espera la respuesta de un albergue o cancela una postulación activa para continuar.',
    );
  }
}

export class DuplicateAdoptionRequestConflictException extends DomainException {
  constructor() {
    super('Ya cuentas con una postulación activa en evaluación para esta mascota.');
  }
}

export class PetNotAvailableConflictException extends DomainException {
  constructor(status: string) {
    super(
      `La mascota no está disponible para adopción (estado actual: "${status}").`,
    );
  }
}

export class IncompleteAdopterSurveyException extends DomainException {
  constructor() {
    super(
      'Debes completar tu cuestionario de compatibilidad de estilo de vida antes de poder postular a una mascota.',
    );
  }
}

export class AdoptionRequestNotFoundException extends DomainException {
  constructor(id: string) {
    super(`No se encontró la solicitud de adopción con ID "${id}".`);
  }
}

export class UnauthorizedShelterActionForbiddenException extends DomainException {
  constructor() {
    super('No estás autorizado para gestionar solicitudes de esta mascota.');
  }
}

export class AdoptionActionNotAllowedException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class ShelterCannotAdoptOwnPetException extends DomainException {
  constructor() {
    super('Un albergue no puede postular a la adopción de sus propias mascotas.');
  }
}
