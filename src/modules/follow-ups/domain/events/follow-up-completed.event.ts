export class FollowUpCompletedEvent {
  static readonly EVENT_NAME = 'follow_up.completed';

  constructor(
    public readonly followUpId: string,
    public readonly certificateCode: string,
    public readonly petName: string,
    public readonly adopterId: string,
    public readonly adopterEmail: string,
    public readonly adopterName: string,
    public readonly shelterName: string,
  ) {}
}
