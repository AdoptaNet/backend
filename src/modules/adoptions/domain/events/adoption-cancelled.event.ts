export class AdoptionCancelledEvent {
  static readonly EVENT_NAME = 'adoption.cancelled';

  constructor(
    public readonly adoptionId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly adopterId: string,
    public readonly shelterId: string,
  ) {}
}
