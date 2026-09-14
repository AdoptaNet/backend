import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import {
  ActivityLevel,
  AdopterAgeRange,
  AdoptionMotivation,
  AllergyType,
  ChildrenAgeRange,
  CurrentPets,
  ExperienceLevel,
  FollowUpAcceptance,
  FurPreference,
  HoursAlone,
  HouseholdSize,
  HousingType,
  MonthlyBudget,
  NoiseTolerance,
  OutdoorSpace,
  PetSociability,
  PreferredAge,
  PreferredSex,
  PreferredSize,
  PreferredSpecies,
  PreferredTemperament,
  SpecialNeedsAcceptance,
  TenureType,
  VetBudget,
  WalkTime,
  WorkSchedule,
  ZoneType,
} from '../value-objects/adopter-profile.enums';
import { User } from './user.entity';

@Entity()
export class AdopterProfile extends AuditableEntity {
  @OneToOne(() => User, (user) => user.adopterProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  // Section 1 — Housing & Location
  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'enum', enum: ZoneType, nullable: true })
  zoneType: ZoneType | null;

  @Column({ type: 'enum', enum: HousingType, nullable: true })
  housingType: HousingType | null;

  @Column({ type: 'enum', enum: OutdoorSpace, nullable: true })
  outdoorSpace: OutdoorSpace | null;

  @Column({ type: 'boolean', nullable: true })
  isFenced: boolean | null;

  @Column({ type: 'enum', enum: TenureType, nullable: true })
  tenureType: TenureType | null;

  // Section 2 — Household
  @Column({ type: 'enum', enum: HouseholdSize, nullable: true })
  householdSize: HouseholdSize | null;

  @Column({ type: 'enum', enum: ChildrenAgeRange, nullable: true })
  childrenAgeRange: ChildrenAgeRange | null;

  @Column({ type: 'boolean', nullable: true })
  hasElderly: boolean | null;

  @Column({ type: 'enum', enum: AllergyType, nullable: true })
  allergyType: AllergyType | null;

  @Column({ type: 'enum', enum: CurrentPets, nullable: true })
  currentPets: CurrentPets | null;

  @Column({ type: 'enum', enum: PetSociability, nullable: true })
  currentPetsSociability: PetSociability | null;

  // Section 3 — Routine & Resources
  @Column({ type: 'enum', enum: HoursAlone, nullable: true })
  hoursAlone: HoursAlone | null;

  @Column({ type: 'enum', enum: WorkSchedule, nullable: true })
  workSchedule: WorkSchedule | null;

  @Column({ type: 'enum', enum: ActivityLevel, nullable: true })
  activityLevel: ActivityLevel | null;

  @Column({ type: 'enum', enum: WalkTime, nullable: true })
  walkTime: WalkTime | null;

  @Column({ type: 'enum', enum: MonthlyBudget, nullable: true })
  monthlyBudget: MonthlyBudget | null;

  @Column({ type: 'enum', enum: VetBudget, nullable: true })
  vetBudget: VetBudget | null;

  @Column({ type: 'enum', enum: ExperienceLevel, nullable: true })
  experienceLevel: ExperienceLevel | null;

  // Section 4 — Preferences
  @Column({ type: 'enum', enum: PreferredSpecies, nullable: true })
  preferredSpecies: PreferredSpecies | null;

  @Column({ type: 'enum', enum: PreferredSize, nullable: true })
  preferredSize: PreferredSize | null;

  @Column({ type: 'enum', enum: PreferredAge, nullable: true })
  preferredAge: PreferredAge | null;

  @Column({ type: 'enum', enum: PreferredSex, nullable: true })
  preferredSex: PreferredSex | null;

  @Column({ type: 'enum', enum: PreferredTemperament, nullable: true })
  preferredTemperament: PreferredTemperament | null;

  @Column({ type: 'enum', enum: FurPreference, nullable: true })
  furPreference: FurPreference | null;

  @Column({ type: 'enum', enum: NoiseTolerance, nullable: true })
  noiseTolerance: NoiseTolerance | null;

  @Column({ type: 'enum', enum: SpecialNeedsAcceptance, nullable: true })
  specialNeedsAcceptance: SpecialNeedsAcceptance | null;

  @Column({ type: 'boolean', nullable: true })
  sterilizationCommitment: boolean | null;

  @Column({ type: 'enum', enum: AdoptionMotivation, nullable: true })
  adoptionMotivation: AdoptionMotivation | null;

  @Column({ type: 'enum', enum: FollowUpAcceptance, nullable: true })
  followUpAcceptance: FollowUpAcceptance | null;

  @Column({ type: 'enum', enum: AdopterAgeRange, nullable: true })
  adopterAgeRange: AdopterAgeRange | null;

  // Contact
  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;
}
