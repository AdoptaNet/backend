export function buildPetCharacteristics(
  pet: {
    furLength?: any;
    isSterilized?: any;
    isVaccinated?: any;
    vaccinesApplied?: any;
    healthStatus?: any;
    healthNotes?: any;
    energyLevel?: any;
    vocalizationLevel?: any;
    trainingLevel?: any;
    goodWithChildren?: any;
    goodWithDogs?: any;
    goodWithCats?: any;
    timeAloneToleranceHours?: any;
    shelterStayMonths?: any;
    adoptionFee?: any;
    characteristics?: any;
  },
  colors?: string[],
): Record<string, any> {
  const prevCharacteristics = pet.characteristics || {};
  return {
    ...prevCharacteristics,
    colors: colors ?? prevCharacteristics.colors ?? [],
    medical: {
      ...(prevCharacteristics.medical || {}),
      fur_length:
        pet.furLength ?? prevCharacteristics.medical?.fur_length ?? 'short',
      is_sterilized:
        pet.isSterilized ??
        prevCharacteristics.medical?.is_sterilized ??
        false,
      is_vaccinated:
        pet.isVaccinated ??
        prevCharacteristics.medical?.is_vaccinated ??
        false,
      vaccines_applied:
        pet.vaccinesApplied !== undefined
          ? (Array.isArray(pet.vaccinesApplied)
              ? pet.vaccinesApplied.map((v: any) => String(v).trim()).filter(Boolean)
              : typeof pet.vaccinesApplied === 'string'
                ? pet.vaccinesApplied.split(',').map((v) => v.trim()).filter(Boolean)
                : pet.vaccinesApplied)
          : (prevCharacteristics.medical?.vaccines_applied ?? null),
      health_status:
        pet.healthStatus ??
        prevCharacteristics.medical?.health_status ??
        'healthy',
      health_notes:
        pet.healthNotes !== undefined
          ? pet.healthNotes
          : (prevCharacteristics.medical?.health_notes ?? null),
    },
    behavioral: {
      ...(prevCharacteristics.behavioral || {}),
      energy_level:
        pet.energyLevel ?? prevCharacteristics.behavioral?.energy_level ?? 3,
      vocalization_level:
        pet.vocalizationLevel ??
        prevCharacteristics.behavioral?.vocalization_level ??
        1,
      training_level:
        pet.trainingLevel ??
        prevCharacteristics.behavioral?.training_level ??
        'none',
      good_with_children:
        pet.goodWithChildren !== undefined
          ? pet.goodWithChildren
          : (prevCharacteristics.behavioral?.good_with_children ?? null),
      good_with_dogs:
        pet.goodWithDogs !== undefined
          ? pet.goodWithDogs
          : (prevCharacteristics.behavioral?.good_with_dogs ?? null),
      good_with_cats:
        pet.goodWithCats !== undefined
          ? pet.goodWithCats
          : (prevCharacteristics.behavioral?.good_with_cats ?? null),
      time_alone_tolerance_hours:
        pet.timeAloneToleranceHours !== undefined
          ? pet.timeAloneToleranceHours
          : (prevCharacteristics.behavioral?.time_alone_tolerance_hours ?? null),
      shelter_stay_months:
        pet.shelterStayMonths ??
        prevCharacteristics.behavioral?.shelter_stay_months ??
        0,
    },
    financial: {
      ...(prevCharacteristics.financial || {}),
      adoption_fee:
        pet.adoptionFee !== undefined && pet.adoptionFee !== null
          ? Number(pet.adoptionFee)
          : (prevCharacteristics.financial?.adoption_fee ?? 0),
    },
  };
}
