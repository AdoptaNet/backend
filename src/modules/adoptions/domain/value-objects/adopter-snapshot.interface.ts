export interface AdopterSnapshot {
  applicant: {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber?: string | null;
    department?: string | null;
    city?: string | null;
  };
  housing: {
    housingType?: string | null;
    ownership?: string | null;
    landlordAllowsPets?: boolean | null;
    hasYard?: boolean | null;
    yardFenced?: boolean | null;
    zoneType?: string | null;
  };
  household: {
    householdSize?: number | null;
    adultsInHome?: number | null;
    hasChildren?: boolean | null;
    childrenAges?: string[] | null;
    hasOtherPets?: boolean | null;
    allMembersAgree?: boolean | null;
  };
  routine: {
    hoursAlonePerDay?: number | null;
    exerciseTimeMinutes?: number | null;
    budgetMonthlyPen?: number | null;
    petCareTravel?: string | null;
    experienceLevel?: string | null;
  };
  preferences: {
    preferredSpecies?: string | null;
    preferredSize?: string[] | null;
    preferredEnergy?: string[] | null;
    preferredAge?: string[] | null;
    preferredSex?: string | null;
  };
  snapshotTimestamp: string;
}
