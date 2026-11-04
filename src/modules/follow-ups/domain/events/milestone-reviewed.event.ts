import { MilestoneType } from '../value-objects/milestone-type.enum';

export class MilestoneReviewedEvent {
  static readonly EVENT_NAME = 'follow_up.milestone_reviewed';

  constructor(
    public readonly followUpId: string,
    public readonly milestoneId: string,
    public readonly milestoneType: MilestoneType,
    public readonly isApproved: boolean,
    public readonly reviewNotes: string | null,
    public readonly petName: string,
    public readonly adopterId: string,
    public readonly adopterEmail: string,
    public readonly adopterName: string,
    public readonly shelterName: string,
  ) {}
}
