import { ApiProperty } from '@nestjs/swagger';
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

export class AdopterProfileResponseDto {
  @ApiProperty({ description: 'ID del perfil de adoptante' })
  id: string;

  @ApiProperty({ description: 'ID del usuario asociado' })
  userId: string;

  // Sección 1 — Vivienda y Ubicación
  @ApiProperty({ description: 'Departamento del Perú', nullable: true })
  department: string | null;

  @ApiProperty({ description: 'Ciudad o distrito del adoptante', nullable: true })
  city: string | null;

  @ApiProperty({ enum: ZoneType, description: 'Tipo de zona', nullable: true })
  zoneType: ZoneType | null;

  @ApiProperty({
    enum: HousingType,
    description: 'Tipo de vivienda',
    nullable: true,
  })
  housingType: HousingType | null;

  @ApiProperty({
    enum: OutdoorSpace,
    description: 'Espacio exterior',
    nullable: true,
  })
  outdoorSpace: OutdoorSpace | null;

  @ApiProperty({
    description: '¿Exterior cercado de forma segura?',
    nullable: true,
  })
  isFenced: boolean | null;

  @ApiProperty({
    enum: TenureType,
    description: 'Régimen de tenencia',
    nullable: true,
  })
  tenureType: TenureType | null;

  // Sección 2 — Hogar y Convivencia
  @ApiProperty({
    enum: HouseholdSize,
    description: 'Personas en casa',
    nullable: true,
  })
  householdSize: HouseholdSize | null;

  @ApiProperty({
    enum: ChildrenAgeRange,
    description: 'Presencia de niños',
    nullable: true,
  })
  childrenAgeRange: ChildrenAgeRange | null;

  @ApiProperty({ description: '¿Viven adultos mayores?', nullable: true })
  hasElderly: boolean | null;

  @ApiProperty({
    enum: AllergyType,
    description: 'Alergias a animales',
    nullable: true,
  })
  allergyType: AllergyType | null;

  @ApiProperty({
    enum: CurrentPets,
    description: 'Mascotas actuales',
    nullable: true,
  })
  currentPets: CurrentPets | null;

  @ApiProperty({
    enum: PetSociability,
    description: 'Sociabilidad de mascotas actuales',
    nullable: true,
  })
  currentPetsSociability: PetSociability | null;

  // Sección 3 — Rutina y Recursos
  @ApiProperty({
    enum: HoursAlone,
    description: 'Horas que la mascota estaría sola',
    nullable: true,
  })
  hoursAlone: HoursAlone | null;

  @ApiProperty({
    enum: WorkSchedule,
    description: 'Jornada laboral',
    nullable: true,
  })
  workSchedule: WorkSchedule | null;

  @ApiProperty({
    enum: ActivityLevel,
    description: 'Nivel de actividad física',
    nullable: true,
  })
  activityLevel: ActivityLevel | null;

  @ApiProperty({
    enum: WalkTime,
    description: 'Tiempo diario de paseo',
    nullable: true,
  })
  walkTime: WalkTime | null;

  @ApiProperty({
    enum: MonthlyBudget,
    description: 'Presupuesto mensual estimado',
    nullable: true,
  })
  monthlyBudget: MonthlyBudget | null;

  @ApiProperty({
    enum: VetBudget,
    description: 'Disposición para gastos veterinarios',
    nullable: true,
  })
  vetBudget: VetBudget | null;

  @ApiProperty({
    enum: ExperienceLevel,
    description: 'Nivel de experiencia con mascotas',
    nullable: true,
  })
  experienceLevel: ExperienceLevel | null;

  // Sección 4 — Preferencias para el ML
  @ApiProperty({
    enum: PreferredSpecies,
    description: 'Especie preferida',
    nullable: true,
  })
  preferredSpecies: PreferredSpecies | null;

  @ApiProperty({
    enum: PreferredSize,
    description: 'Tamaño preferido',
    nullable: true,
  })
  preferredSize: PreferredSize | null;

  @ApiProperty({
    enum: PreferredAge,
    description: 'Edad preferida',
    nullable: true,
  })
  preferredAge: PreferredAge | null;

  @ApiProperty({
    enum: PreferredSex,
    description: 'Sexo preferido',
    nullable: true,
  })
  preferredSex: PreferredSex | null;

  @ApiProperty({
    enum: PreferredTemperament,
    description: 'Temperamento buscado',
    nullable: true,
  })
  preferredTemperament: PreferredTemperament | null;

  @ApiProperty({
    enum: FurPreference,
    description: 'Preferencia de pelaje',
    nullable: true,
  })
  furPreference: FurPreference | null;

  @ApiProperty({
    enum: NoiseTolerance,
    description: 'Tolerancia al ruido/ladridos',
    nullable: true,
  })
  noiseTolerance: NoiseTolerance | null;

  @ApiProperty({
    enum: SpecialNeedsAcceptance,
    description: 'Aceptación de necesidades especiales',
    nullable: true,
  })
  specialNeedsAcceptance: SpecialNeedsAcceptance | null;

  @ApiProperty({ description: 'Compromiso de esterilización', nullable: true })
  sterilizationCommitment: boolean | null;

  @ApiProperty({
    enum: AdoptionMotivation,
    description: 'Motivación para adoptar',
    nullable: true,
  })
  adoptionMotivation: AdoptionMotivation | null;

  @ApiProperty({
    enum: FollowUpAcceptance,
    description: 'Aceptación de seguimiento post-adopción',
    nullable: true,
  })
  followUpAcceptance: FollowUpAcceptance | null;

  @ApiProperty({
    enum: AdopterAgeRange,
    description: 'Rango de edad del adoptante',
    nullable: true,
  })
  adopterAgeRange: AdopterAgeRange | null;

  @ApiProperty({ description: 'Teléfono de contacto', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Indica si completó el cuestionario de compatibilidad ML',
    example: true,
  })
  isSurveyCompleted: boolean;

  @ApiProperty({
    description: 'Documento JSONB con las variables estructuradas para el motor ML',
    nullable: true,
  })
  compatibilityData?: Record<string, any> | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
