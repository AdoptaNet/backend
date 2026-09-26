export class PetUpdatedEvent {
  constructor(
    public readonly petId: string,
    public readonly shelterId: string,
    public readonly status: string,
  ) {}
}
