import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../../domain/value-objects/adoption-rejection-reason.enum';
import type { AdopterSnapshot } from '../../domain/value-objects/adopter-snapshot.interface';

export class AdoptionPetSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  species: string;

  @ApiProperty()
  breed: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  ageCategory: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  primaryPhotoUrl?: string | null;
}

export class AdoptionUserSummaryDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  fullName: string | null;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  organizationName?: string | null;

  @ApiPropertyOptional()
  city?: string | null;
}

export class AdoptionRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  petId: string;

  @ApiProperty()
  adopterId: string;

  @ApiProperty()
  shelterId: string;

  @ApiProperty({ enum: AdoptionStatus })
  status: AdoptionStatus;

  @ApiProperty()
  motivationLetter: string;

  @ApiProperty()
  responsibilityPledge: boolean;

  @ApiProperty()
  adopterSnapshot: AdopterSnapshot;

  @ApiPropertyOptional({ enum: AdoptionRejectionReason })
  rejectionReason?: AdoptionRejectionReason | null;

  @ApiPropertyOptional()
  rejectionNotes?: string | null;

  @ApiPropertyOptional()
  reviewNotes?: string | null;

  @ApiPropertyOptional()
  approvedAt?: Date | null;

  @ApiPropertyOptional()
  rejectedAt?: Date | null;

  @ApiPropertyOptional()
  cancelledAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: AdoptionPetSummaryDto })
  pet?: AdoptionPetSummaryDto;

  @ApiPropertyOptional({ type: AdoptionUserSummaryDto })
  adopter?: AdoptionUserSummaryDto;

  @ApiPropertyOptional({ type: AdoptionUserSummaryDto })
  shelter?: AdoptionUserSummaryDto;
}

export class PaginatedAdoptionRequestsResponseDto {
  @ApiProperty({ type: [AdoptionRequestResponseDto] })
  items: AdoptionRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
