export class AdoptionSubmittedEvent {
  static readonly EVENT_NAME = 'adoption.submitted';

  constructor(
    public readonly adoptionId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly adopterId: string,
    public readonly adopterName: string,
    public readonly adopterEmail: string,
    public readonly shelterId: string,
    public readonly shelterEmail: string,
  ) {}
}
