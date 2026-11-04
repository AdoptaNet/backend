import { PetReturnReason } from '../value-objects/pet-return-reason.enum';

export class PetReturnRequestedEvent {
  static readonly EVENT_NAME = 'pet_return.requested';

  constructor(
    public readonly returnId: string,
    public readonly followUpId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly reason: PetReturnReason,
    public readonly explanation: string,
    public readonly adopterName: string,
    public readonly shelterId: string,
    public readonly shelterEmail: string,
  ) {}
}
