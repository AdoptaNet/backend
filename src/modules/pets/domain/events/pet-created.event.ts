export class PetCreatedEvent {
  constructor(
    public readonly petId: string,
    public readonly shelterId: string,
    public readonly species: string,
    public readonly status: string,
  ) {}
}
