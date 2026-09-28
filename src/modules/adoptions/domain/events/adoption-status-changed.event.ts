import { AdoptionStatus } from '../value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../value-objects/adoption-rejection-reason.enum';

export class AdoptionStatusChangedEvent {
  static readonly EVENT_NAME = 'adoption.status_changed';

  constructor(
    public readonly adoptionId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly adopterId: string,
    public readonly adopterName: string,
    public readonly adopterEmail: string,
    public readonly shelterId: string,
    public readonly newStatus: AdoptionStatus,
    public readonly rejectionReason?: AdoptionRejectionReason | null,
    public readonly rejectionNotes?: string | null,
  ) {}
}
