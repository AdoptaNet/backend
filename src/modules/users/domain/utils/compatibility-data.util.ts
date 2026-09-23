import { AdopterProfile } from '../entities/adopter-profile.entity';

export function buildCompatibilityData(profile: AdopterProfile): Record<string, any> {
  return {
    housing: {
      zone_type: profile.zoneType ?? null,
      housing_type: profile.housingType ?? null,
      outdoor_space: profile.outdoorSpace ?? null,
      is_fenced: profile.isFenced ?? null,
      tenure_type: profile.tenureType ?? null,
    },
    household: {
      household_size: profile.householdSize ?? null,
      children_age_range: profile.childrenAgeRange ?? null,
      has_elderly: profile.hasElderly ?? null,
      allergy_type: profile.allergyType ?? null,
      current_pets: profile.currentPets ?? null,
      current_pets_sociability: profile.currentPetsSociability ?? null,
    },
    routine: {
      hours_alone: profile.hoursAlone ?? null,
      work_schedule: profile.workSchedule ?? null,
      activity_level: profile.activityLevel ?? null,
      walk_time: profile.walkTime ?? null,
      monthly_budget: profile.monthlyBudget ?? null,
      vet_budget: profile.vetBudget ?? null,
      experience_level: profile.experienceLevel ?? null,
    },
    preferences: {
      preferred_species: profile.preferredSpecies ?? null,
      preferred_size: profile.preferredSize ?? null,
      preferred_age: profile.preferredAge ?? null,
      preferred_sex: profile.preferredSex ?? null,
      preferred_temperament: profile.preferredTemperament ?? null,
      fur_preference: profile.furPreference ?? null,
      noise_tolerance: profile.noiseTolerance ?? null,
      special_needs_acceptance: profile.specialNeedsAcceptance ?? null,
      sterilization_commitment: profile.sterilizationCommitment ?? null,
      adoption_motivation: profile.adoptionMotivation ?? null,
      follow_up_acceptance: profile.followUpAcceptance ?? null,
      adopter_age_range: profile.adopterAgeRange ?? null,
    },
  };
}

export function checkIsSurveyCompleted(profile: AdopterProfile): boolean {
  const requiredFields: (keyof AdopterProfile)[] = [
    'department',
    'zoneType',
    'housingType',
    'outdoorSpace',
    'isFenced',
    'tenureType',
    'householdSize',
    'childrenAgeRange',
    'hasElderly',
    'allergyType',
    'currentPets',
    'currentPetsSociability',
    'hoursAlone',
    'workSchedule',
    'activityLevel',
    'walkTime',
    'monthlyBudget',
    'vetBudget',
    'experienceLevel',
    'preferredSpecies',
    'preferredSize',
    'preferredAge',
    'preferredSex',
    'preferredTemperament',
    'furPreference',
    'noiseTolerance',
    'specialNeedsAcceptance',
    'sterilizationCommitment',
    'adoptionMotivation',
    'followUpAcceptance',
    'adopterAgeRange',
  ];

  return requiredFields.every((field) => {
    const val = profile[field];
    return val !== null && val !== undefined;
  });
}
