export class PetReturnCompletedEvent {
  static readonly EVENT_NAME = 'pet_return.completed';

  constructor(
    public readonly returnId: string,
    public readonly followUpId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly isAccepted: boolean,
    public readonly adopterId: string,
    public readonly adopterEmail: string,
    public readonly adopterName: string,
    public readonly shelterName: string,
  ) {}
}
