import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
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
} from '../../domain/value-objects/adopter-profile.enums';

export class UpdateAdopterProfileDto {
  // Sección 1 — Vivienda y Ubicación
  @ApiProperty({
    example: 'Lima',
    description: 'Departamento del Perú',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 'Miraflores',
    description: 'Ciudad o distrito del adoptante',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ enum: ZoneType, required: false })
  @IsEnum(ZoneType)
  @IsOptional()
  zoneType?: ZoneType;

  @ApiProperty({ enum: HousingType, required: false })
  @IsEnum(HousingType)
  @IsOptional()
  housingType?: HousingType;

  @ApiProperty({ enum: OutdoorSpace, required: false })
  @IsEnum(OutdoorSpace)
  @IsOptional()
  outdoorSpace?: OutdoorSpace;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isFenced?: boolean;

  @ApiProperty({ enum: TenureType, required: false })
  @IsEnum(TenureType)
  @IsOptional()
  tenureType?: TenureType;

  // Sección 2 — Hogar y Convivencia
  @ApiProperty({ enum: HouseholdSize, required: false })
  @IsEnum(HouseholdSize)
  @IsOptional()
  householdSize?: HouseholdSize;

  @ApiProperty({ enum: ChildrenAgeRange, required: false })
  @IsEnum(ChildrenAgeRange)
  @IsOptional()
  childrenAgeRange?: ChildrenAgeRange;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  hasElderly?: boolean;

  @ApiProperty({ enum: AllergyType, required: false })
  @IsEnum(AllergyType)
  @IsOptional()
  allergyType?: AllergyType;

  @ApiProperty({ enum: CurrentPets, required: false })
  @IsEnum(CurrentPets)
  @IsOptional()
  currentPets?: CurrentPets;

  @ApiProperty({ enum: PetSociability, required: false })
  @IsEnum(PetSociability)
  @IsOptional()
  currentPetsSociability?: PetSociability;

  // Sección 3 — Rutina y Recursos
  @ApiProperty({ enum: HoursAlone, required: false })
  @IsEnum(HoursAlone)
  @IsOptional()
  hoursAlone?: HoursAlone;

  @ApiProperty({ enum: WorkSchedule, required: false })
  @IsEnum(WorkSchedule)
  @IsOptional()
  workSchedule?: WorkSchedule;

  @ApiProperty({ enum: ActivityLevel, required: false })
  @IsEnum(ActivityLevel)
  @IsOptional()
  activityLevel?: ActivityLevel;

  @ApiProperty({ enum: WalkTime, required: false })
  @IsEnum(WalkTime)
  @IsOptional()
  walkTime?: WalkTime;

  @ApiProperty({ enum: MonthlyBudget, required: false })
  @IsEnum(MonthlyBudget)
  @IsOptional()
  monthlyBudget?: MonthlyBudget;

  @ApiProperty({ enum: VetBudget, required: false })
  @IsEnum(VetBudget)
  @IsOptional()
  vetBudget?: VetBudget;

  @ApiProperty({ enum: ExperienceLevel, required: false })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  // Sección 4 — Preferencias
  @ApiProperty({ enum: PreferredSpecies, required: false })
  @IsEnum(PreferredSpecies)
  @IsOptional()
  preferredSpecies?: PreferredSpecies;

  @ApiProperty({ enum: PreferredSize, required: false })
  @IsEnum(PreferredSize)
  @IsOptional()
  preferredSize?: PreferredSize;

  @ApiProperty({ enum: PreferredAge, required: false })
  @IsEnum(PreferredAge)
  @IsOptional()
  preferredAge?: PreferredAge;

  @ApiProperty({ enum: PreferredSex, required: false })
  @IsEnum(PreferredSex)
  @IsOptional()
  preferredSex?: PreferredSex;

  @ApiProperty({ enum: PreferredTemperament, required: false })
  @IsEnum(PreferredTemperament)
  @IsOptional()
  preferredTemperament?: PreferredTemperament;

  @ApiProperty({ enum: FurPreference, required: false })
  @IsEnum(FurPreference)
  @IsOptional()
  furPreference?: FurPreference;

  @ApiProperty({ enum: NoiseTolerance, required: false })
  @IsEnum(NoiseTolerance)
  @IsOptional()
  noiseTolerance?: NoiseTolerance;

  @ApiProperty({ enum: SpecialNeedsAcceptance, required: false })
  @IsEnum(SpecialNeedsAcceptance)
  @IsOptional()
  specialNeedsAcceptance?: SpecialNeedsAcceptance;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  sterilizationCommitment?: boolean;

  @ApiProperty({ enum: AdoptionMotivation, required: false })
  @IsEnum(AdoptionMotivation)
  @IsOptional()
  adoptionMotivation?: AdoptionMotivation;

  @ApiProperty({ enum: FollowUpAcceptance, required: false })
  @IsEnum(FollowUpAcceptance)
  @IsOptional()
  followUpAcceptance?: FollowUpAcceptance;

  @ApiProperty({ enum: AdopterAgeRange, required: false })
  @IsEnum(AdopterAgeRange)
  @IsOptional()
  adopterAgeRange?: AdopterAgeRange;

  @ApiProperty({ example: '+51987654321', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^(\+?51)?9\d{8}$/, {
    message:
      'El número telefónico debe ser un celular válido de Perú (9 dígitos, ej: 987654321 o +51987654321)',
  })
  phoneNumber?: string;
}
