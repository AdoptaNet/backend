export class FollowUpInitializedEvent {
  static readonly EVENT_NAME = 'follow_up.initialized';

  constructor(
    public readonly followUpId: string,
    public readonly adoptionId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly adopterId: string,
    public readonly adopterEmail: string,
    public readonly shelterId: string,
    public readonly shelterEmail: string,
  ) {}
}
