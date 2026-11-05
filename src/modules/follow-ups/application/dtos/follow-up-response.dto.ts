import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { PetReturnReason } from '../../domain/value-objects/pet-return-reason.enum';
import { PetReturnStatus } from '../../domain/value-objects/pet-return-status.enum';

export interface EvidenceResponseDto {
  id: string;
  evidenceType: string;
  mediaUrl: string;
  photoUrl?: string;
  caption?: string | null;
  createdAt: string;
}

export interface MilestoneResponseDto {
  id: string;
  milestoneType: MilestoneType;
  daysTarget: number;
  dueDate: string;
  status: MilestoneStatus;
  reminderSentAt?: string | null;
  overdueNotifiedAt?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewerId?: string | null;
  reviewNotes?: string | null;
  healthStatusReported?: string | null;
  adaptationNotes?: string | null;
  evidences: EvidenceResponseDto[];
}

export interface PetReturnResponseDto {
  id: string;
  followUpRecordId: string;
  petId: string;
  adopterId: string;
  shelterId: string;
  reason: PetReturnReason;
  explanation: string;
  emergencyContactPhone?: string | null;
  supportingDocumentUrl?: string | null;
  status: PetReturnStatus;
  requestedAt: string;
  coordinationNotes?: string | null;
  scheduledReturnDate?: string | null;
  completedAt?: string | null;
  shelterObservations?: string | null;
}

export interface FollowUpRecordResponseDto {
  id: string;
  adoptionId: string;
  petId: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    primaryPhotoUrl?: string | null;
  };
  adopterId: string;
  adopter: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  shelterId: string;
  shelter: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  status: FollowUpProcessStatus;
  startDate: string;
  completionDate?: string | null;
  certificateCode?: string | null;
  notes?: string | null;
  milestones: MilestoneResponseDto[];
  activeReturn?: PetReturnResponseDto | null;
  returns?: PetReturnResponseDto[];
}
