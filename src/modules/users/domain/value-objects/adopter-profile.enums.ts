export enum ZoneType {
  URBAN_TRAFFIC = 'urban_traffic',
  URBAN_QUIET = 'urban_quiet',
  PERIURBAN = 'periurban',
  RURAL = 'rural',
}

export enum HousingType {
  APARTMENT = 'apartment',
  HOUSE_NO_YARD = 'house_no_yard',
  HOUSE_WITH_YARD = 'house_with_yard',
  QUINTA = 'quinta',
}

export enum OutdoorSpace {
  NONE = 'none',
  BALCONY = 'balcony',
  SMALL_YARD = 'small_yard',
  LARGE_GARDEN = 'large_garden',
}

export enum TenureType {
  OWNED = 'owned',
  RENTED_WITH_PERMISSION = 'rented_with_permission',
  RENTED_UNCERTAIN = 'rented_uncertain',
  RENTED_NO_PERMISSION = 'rented_no_permission',
}

export enum HouseholdSize {
  ALONE = 'alone',
  TWO_THREE = 'two_three',
  FOUR_FIVE = 'four_five',
  SIX_PLUS = 'six_plus',
}

export enum ChildrenAgeRange {
  NONE = 'none',
  UNDER_5 = 'under_5',
  FIVE_TO_12 = 'five_to_12',
  TEENAGERS = 'teenagers',
}

export enum AllergyType {
  NONE = 'none',
  CATS = 'cats',
  DOGS = 'dogs',
  UNCERTAIN = 'uncertain',
}

export enum CurrentPets {
  NONE = 'none',
  DOGS = 'dogs',
  CATS = 'cats',
  BOTH = 'both',
}

export enum PetSociability {
  NOT_APPLICABLE = 'not_applicable',
  VERY_SOCIABLE = 'very_sociable',
  SELECTIVE = 'selective',
  NOT_SOCIABLE = 'not_sociable',
}

export enum HoursAlone {
  LESS_THAN_2 = 'less_than_2',
  TWO_TO_4 = 'two_to_4',
  FIVE_TO_8 = 'five_to_8',
  MORE_THAN_8 = 'more_than_8',
}

export enum WorkSchedule {
  FROM_HOME = 'from_home',
  HYBRID = 'hybrid',
  OUT_ALL_DAY = 'out_all_day',
  ROTATING = 'rotating',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LOW = 'low',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active',
}

export enum WalkTime {
  LESS_THAN_15 = 'less_than_15',
  FIFTEEN_TO_30 = 'fifteen_to_30',
  THIRTY_TO_60 = 'thirty_to_60',
  MORE_THAN_60 = 'more_than_60',
}

export enum MonthlyBudget {
  UNDER_50 = 'under_50',
  FIFTY_TO_100 = 'fifty_to_100',
  HUNDRED_TO_200 = 'hundred_to_200',
  TWO_HUNDRED_TO_300 = 'two_hundred_to_300',
  OVER_300 = 'over_300',
}

export enum VetBudget {
  BASIC = 'basic',
  EMERGENCIES = 'emergencies',
  CHRONIC_TREATMENT = 'chronic_treatment',
}

export enum ExperienceLevel {
  NONE = 'none',
  LITTLE = 'little',
  MODERATE = 'moderate',
  EXPERIENCED = 'experienced',
}

export enum PreferredSpecies {
  DOG = 'dog',
  CAT = 'cat',
  ANY = 'any',
}

export enum PreferredSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ANY = 'any',
}

export enum PreferredAge {
  PUPPY = 'puppy',
  YOUNG = 'young',
  ADULT = 'adult',
  SENIOR = 'senior',
  ANY = 'any',
}

export enum PreferredSex {
  MALE = 'male',
  FEMALE = 'female',
  ANY = 'any',
}

export enum PreferredTemperament {
  CALM = 'calm',
  BALANCED = 'balanced',
  ACTIVE = 'active',
}

export enum FurPreference {
  SHORT = 'short',
  LONG = 'long',
  HAIRLESS = 'hairless',
  ANY = 'any',
}

export enum NoiseTolerance {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export enum SpecialNeedsAcceptance {
  NO = 'no',
  CHRONIC = 'chronic',
  DISABILITY = 'disability',
  ANY = 'any',
}

export enum AdoptionMotivation {
  COMPANIONSHIP = 'companionship',
  RESCUE = 'rescue',
  FAMILY = 'family',
  THERAPY = 'therapy',
  OTHER = 'other',
}

export enum FollowUpAcceptance {
  FULLY_ACCEPT = 'fully_accept',
  PARTIALLY = 'partially',
  PREFER_NOT = 'prefer_not',
}

export enum AdopterAgeRange {
  EIGHTEEN_TO_25 = '18_to_25',
  TWENTY_SIX_TO_35 = '26_to_35',
  THIRTY_SIX_TO_45 = '36_to_45',
  FORTY_SIX_TO_55 = '46_to_55',
  FIFTY_SIX_PLUS = '56_plus',
}
