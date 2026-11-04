import { MilestoneType } from '../value-objects/milestone-type.enum';

export class MilestoneSubmittedEvent {
  static readonly EVENT_NAME = 'follow_up.milestone_submitted';

  constructor(
    public readonly followUpId: string,
    public readonly milestoneId: string,
    public readonly milestoneType: MilestoneType,
    public readonly petName: string,
    public readonly adopterName: string,
    public readonly shelterId: string,
    public readonly shelterEmail: string,
  ) {}
}
