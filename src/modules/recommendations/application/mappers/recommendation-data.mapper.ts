import { AdopterProfile } from '../../../users/domain/entities/adopter-profile.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import {
  ActivityLevel,
  ChildrenAgeRange,
  CurrentPets,
  ExperienceLevel,
  HoursAlone,
  HouseholdSize,
  HousingType,
  MonthlyBudget,
  OutdoorSpace,
  PreferredAge,
  PreferredSex,
  PreferredSize,
  PreferredSpecies,
  SpecialNeedsAcceptance,
  TenureType,
  WalkTime,
} from '../../../users/domain/value-objects/adopter-profile.enums';
import { PetAgeCategory } from '../../../pets/domain/value-objects/pet-age-category.enum';
import { PetGender } from '../../../pets/domain/value-objects/pet-gender.enum';
import { PetSize } from '../../../pets/domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../../pets/domain/value-objects/pet-species.enum';

const COSTA_DEPTS = new Set([
  'lima',
  'callao',
  'piura',
  'tumbes',
  'lambayeque',
  'la libertad',
  'ancash',
  'ica',
  'arequipa',
  'moquegua',
  'tacna',
]);

const SELVA_DEPTS = new Set([
  'loreto',
  'san martin',
  'ucayali',
  'madre de dios',
  'amazonas',
]);

export function getClimaticZone(departmentName?: string | null): string {
  const norm = (departmentName || 'lima').toLowerCase().trim();
  if (SELVA_DEPTS.has(norm)) return 'selva';
  if (COSTA_DEPTS.has(norm)) return 'costa';
  return 'sierra';
}

export class RecommendationDataMapper {
  static toModelAdopter(profile: AdopterProfile): Record<string, any> {
    const dept = (profile.department || 'lima').toLowerCase().trim();
    const zonaClimatica = getClimaticZone(dept);

    // Tipo de vivienda
    let tipoVivienda = 'departamento';
    if (profile.housingType === HousingType.HOUSE_WITH_YARD) {
      tipoVivienda = 'casa_terreno';
    } else if (
      profile.housingType === HousingType.HOUSE_NO_YARD ||
      profile.housingType === HousingType.QUINTA
    ) {
      tipoVivienda = 'casa';
    }

    // Tenencia y permisos
    const tenenciaPropia = profile.tenureType === TenureType.OWNED ? 1 : 0;
    const permisoMascotas =
      profile.tenureType === TenureType.RENTED_NO_PERMISSION ? 0 : 1;

    // Área exterior
    const hasOutdoor =
      profile.outdoorSpace === OutdoorSpace.SMALL_YARD ||
      profile.outdoorSpace === OutdoorSpace.LARGE_GARDEN;
    const m2Exterior =
      profile.outdoorSpace === OutdoorSpace.LARGE_GARDEN
        ? 60
        : profile.outdoorSpace === OutdoorSpace.SMALL_YARD
          ? 25
          : 0;

    // Integrantes
    let nIntegrantes = 2;
    if (profile.householdSize === HouseholdSize.ALONE) nIntegrantes = 1;
    else if (profile.householdSize === HouseholdSize.FOUR_FIVE) nIntegrantes = 4;
    else if (profile.householdSize === HouseholdSize.SIX_PLUS) nIntegrantes = 6;

    // Niños
    const hayNinos =
      profile.childrenAgeRange !== undefined &&
      profile.childrenAgeRange !== null &&
      profile.childrenAgeRange !== ChildrenAgeRange.NONE;

    let edadMinNinos: number | null = null;
    if (hayNinos) {
      if (profile.childrenAgeRange === ChildrenAgeRange.UNDER_5) edadMinNinos = 3;
      else if (profile.childrenAgeRange === ChildrenAgeRange.FIVE_TO_12) edadMinNinos = 8;
      else if (profile.childrenAgeRange === ChildrenAgeRange.TEENAGERS) edadMinNinos = 14;
    }

    // Mascotas actuales
    const perroActual =
      profile.currentPets === CurrentPets.DOGS ||
      profile.currentPets === CurrentPets.BOTH
        ? 1
        : 0;
    const gatoActual =
      profile.currentPets === CurrentPets.CATS ||
      profile.currentPets === CurrentPets.BOTH
        ? 1
        : 0;

    // Horas fuera
    let horasFuera = 4;
    if (profile.hoursAlone === HoursAlone.LESS_THAN_2) horasFuera = 2;
    else if (profile.hoursAlone === HoursAlone.FIVE_TO_8) horasFuera = 7;
    else if (profile.hoursAlone === HoursAlone.MORE_THAN_8) horasFuera = 10;

    // Actividad
    let nivelActividad = 'moderado';
    if (
      profile.activityLevel === ActivityLevel.SEDENTARY ||
      profile.activityLevel === ActivityLevel.LOW
    ) {
      nivelActividad = 'sedentario';
    } else if (
      profile.activityLevel === ActivityLevel.ACTIVE ||
      profile.activityLevel === ActivityLevel.VERY_ACTIVE
    ) {
      nivelActividad = 'activo';
    }

    // Experiencia
    let experiencia = 'alguna';
    if (profile.experienceLevel === ExperienceLevel.NONE) experiencia = 'ninguna';
    else if (profile.experienceLevel === ExperienceLevel.EXPERIENCED) experiencia = 'amplia';

    // Presupuesto
    let presupuesto = 'medio';
    if (
      profile.monthlyBudget === MonthlyBudget.UNDER_50 ||
      profile.monthlyBudget === MonthlyBudget.FIFTY_TO_100
    ) {
      presupuesto = 'bajo';
    } else if (profile.monthlyBudget === MonthlyBudget.OVER_300) {
      presupuesto = 'alto';
    }

    // Tiempo de adiestramiento
    let tiempoAdiestramiento = 'media';
    if (profile.walkTime === WalkTime.LESS_THAN_15) tiempoAdiestramiento = 'baja';
    else if (profile.walkTime === WalkTime.MORE_THAN_60) tiempoAdiestramiento = 'alta';

    // Preferencias
    let prefEspecie = 'indistinto';
    if (profile.preferredSpecies === PreferredSpecies.DOG) prefEspecie = 'perro';
    else if (profile.preferredSpecies === PreferredSpecies.CAT) prefEspecie = 'gato';

    let prefTamano = 'pequeno|mediano|grande';
    if (profile.preferredSize === PreferredSize.SMALL) prefTamano = 'pequeno';
    else if (profile.preferredSize === PreferredSize.MEDIUM) prefTamano = 'mediano';
    else if (profile.preferredSize === PreferredSize.LARGE) prefTamano = 'grande';

    let prefEdad = 'cachorro|joven|adulto|senior';
    if (profile.preferredAge === PreferredAge.PUPPY) prefEdad = 'cachorro';
    else if (profile.preferredAge === PreferredAge.YOUNG) prefEdad = 'joven';
    else if (profile.preferredAge === PreferredAge.ADULT) prefEdad = 'adulto';
    else if (profile.preferredAge === PreferredAge.SENIOR) prefEdad = 'senior';

    let prefSexo = 'indistinto';
    if (profile.preferredSex === PreferredSex.MALE) prefSexo = 'macho';
    else if (profile.preferredSex === PreferredSex.FEMALE) prefSexo = 'hembra';

    const aperturaNecEsp =
      profile.specialNeedsAcceptance &&
      profile.specialNeedsAcceptance !== SpecialNeedsAcceptance.NO
        ? 1
        : 0;
    const aperturaSenior =
      profile.preferredAge === PreferredAge.SENIOR ||
      profile.preferredAge === PreferredAge.ANY
        ? 1
        : 0;

    return {
      departamento: dept,
      zona_climatica: zonaClimatica,
      tipo_vivienda: tipoVivienda,
      tenencia_propia: tenenciaPropia,
      permiso_mascotas: permisoMascotas,
      area_exterior: hasOutdoor ? 1 : 0,
      m2_exterior: m2Exterior,
      cercado_seguro: profile.isFenced ? 1 : 0,
      n_integrantes: nIntegrantes,
      presencia_ninos: hayNinos ? 1 : 0,
      edad_min_ninos: edadMinNinos,
      otras_mascotas_perro: perroActual,
      otras_mascotas_gato: gatoActual,
      horas_fuera_dia: horasFuera,
      nivel_actividad: nivelActividad,
      experiencia_previa: experiencia,
      presupuesto_mensual: presupuesto,
      tiempo_adiestramiento: tiempoAdiestramiento,
      pref_especie: prefEspecie,
      pref_tamano: prefTamano,
      pref_edad: prefEdad,
      pref_sexo: prefSexo,
      pref_energia: 3,
      apertura_nec_especiales: aperturaNecEsp,
      apertura_senior: aperturaSenior,
    };
  }

  static toModelPet(pet: Pet): Record<string, any> {
    const chars = pet.characteristics || {};
    const shelterProfile = pet.shelter?.shelterProfile;
    const deptRefugio = (
      shelterProfile?.department ||
      shelterProfile?.city ||
      'lima'
    )
      .toLowerCase()
      .trim();

    // Edad
    let catEdad = 'adulto';
    if (pet.ageCategory === PetAgeCategory.PUPPY) catEdad = 'cachorro';
    else if (pet.ageCategory === PetAgeCategory.YOUNG) catEdad = 'joven';
    else if (pet.ageCategory === PetAgeCategory.SENIOR) catEdad = 'senior';

    // Tamaño
    let tam = 'mediano';
    if (pet.size === PetSize.SMALL) tam = 'pequeno';
    else if (pet.size === PetSize.LARGE) tam = 'grande';

    // Pelaje
    let pelaje = 'corto';
    if (chars.furLength === 'long') pelaje = 'largo';
    else if (chars.furLength === 'medium') pelaje = 'medio';

    // Sociabilidad
    const mapSoc = (val?: boolean | null): string => {
      if (val === true) return 'alto';
      if (val === false) return 'bajo';
      return 'desconocido';
    };

    // Vocalización / ladrido
    const voc = Number(chars.vocalizationLevel ?? 2);
    const nivelLadrido = voc <= 2 ? 'bajo' : voc === 3 ? 'medio' : 'alto';

    // Entrenamiento
    let entrenamiento = 'nulo';
    if (chars.trainingLevel === 'basic') entrenamiento = 'parcial';
    else if (chars.trainingLevel === 'advanced') entrenamiento = 'completo';

    // Salud
    let salud = 'sano';
    if (chars.healthStatus === 'special_needs') salud = 'necesidad_especial';
    else if (chars.healthStatus === 'under_treatment') salud = 'cronica';

    // Días en refugio
    const dias = Math.max(
      1,
      Number(chars.shelterStayMonths || 1) * 30,
    );

    return {
      pet_id: pet.id,
      especie: pet.species === PetSpecies.DOG ? 'perro' : 'gato',
      sexo: pet.gender === PetGender.MALE ? 'macho' : 'hembra',
      categoria_edad: catEdad,
      tamano: tam,
      tipo_pelaje: pelaje,
      nivel_energia: Math.max(1, Math.min(5, Number(chars.energyLevel || 3))),
      sociable_ninos: mapSoc(chars.goodWithChildren),
      sociable_perros: mapSoc(chars.goodWithDogs),
      sociable_gatos: mapSoc(chars.goodWithCats),
      sociable_desconocidos: 'medio',
      nivel_ladrido: nivelLadrido,
      entrenamiento_basico: entrenamiento,
      estado_salud: salud,
      esterilizado: chars.isSterilized ? 1 : 0,
      vacunas_completas: chars.isVaccinated ? 1 : 0,
      departamento_refugio: deptRefugio,
      zona_climatica_refugio: getClimaticZone(deptRefugio),
      req_area_exterior: pet.size === PetSize.LARGE ? 1 : 0,
      req_cercado: Number(chars.energyLevel || 3) >= 4 ? 1 : 0,
      req_sin_ninos: chars.goodWithChildren === false ? 1 : 0,
      dias_en_refugio: dias,
    };
  }

  static toModelAdopterFromSnapshot(snapshot: any): Record<string, any> {
    const applicant = snapshot?.applicant || {};
    const housing = snapshot?.housing || {};
    const household = snapshot?.household || {};
    const routine = snapshot?.routine || {};
    const prefs = snapshot?.preferences || {};

    const dept = (applicant.department || applicant.city || 'lima')
      .toLowerCase()
      .trim();
    const zonaClimatica = getClimaticZone(dept);

    let tipoVivienda = 'departamento';
    if (housing.housingType === 'house_with_yard' || housing.housingType === 'house') {
      tipoVivienda = housing.hasYard ? 'casa_terreno' : 'casa';
    } else if (housing.housingType === 'quinta') {
      tipoVivienda = 'casa';
    }

    const tenenciaPropia = housing.ownership === 'owned' || housing.ownsHome ? 1 : 0;
    const permisoMascotas = housing.landlordAllowsPets !== false ? 1 : 0;
    const hasOutdoor = Boolean(housing.hasYard);
    const m2Exterior = hasOutdoor ? 30 : 0;
    const cercadoSeguro = housing.yardFenced ? 1 : 0;

    let nIntegrantes = Number(household.householdSize || household.adultsCount || 2);
    if (isNaN(nIntegrantes) || nIntegrantes < 1) nIntegrantes = 2;

    const hayNinos = Boolean(household.hasChildren || (household.childrenCount && household.childrenCount > 0));
    const edadMinNinos = hayNinos ? 6 : null;

    const perroActual = household.hasOtherPets ? 1 : 0;
    const gatoActual = 0;

    let horasFuera = Number(routine.hoursAlonePerDay ?? 4);
    if (isNaN(horasFuera)) horasFuera = 4;

    const nivelActividad = 'moderado';
    const experiencia = routine.experienceLevel || 'alguna';
    const presupuesto = routine.budgetMonthlyPen && Number(routine.budgetMonthlyPen) > 250 ? 'alto' : 'medio';
    const tiempoAdiestramiento = 'media';

    let prefEspecie = 'indistinto';
    if (prefs.preferredSpecies === 'dog') prefEspecie = 'perro';
    else if (prefs.preferredSpecies === 'cat') prefEspecie = 'gato';

    return {
      departamento: dept,
      zona_climatica: zonaClimatica,
      tipo_vivienda: tipoVivienda,
      tenencia_propia: tenenciaPropia,
      permiso_mascotas: permisoMascotas,
      area_exterior: hasOutdoor ? 1 : 0,
      m2_exterior: m2Exterior,
      cercado_seguro: cercadoSeguro,
      n_integrantes: nIntegrantes,
      presencia_ninos: hayNinos ? 1 : 0,
      edad_min_ninos: edadMinNinos,
      otras_mascotas_perro: perroActual,
      otras_mascotas_gato: gatoActual,
      horas_fuera_dia: horasFuera,
      nivel_actividad: nivelActividad,
      experiencia_previa: experiencia,
      presupuesto_mensual: presupuesto,
      tiempo_adiestramiento: tiempoAdiestramiento,
      pref_especie: prefEspecie,
      pref_tamano: Array.isArray(prefs.preferredSize) && prefs.preferredSize.length
        ? prefs.preferredSize.join('|')
        : 'pequeno|mediano|grande',
      pref_edad: Array.isArray(prefs.preferredAge) && prefs.preferredAge.length
        ? prefs.preferredAge.join('|')
        : 'cachorro|joven|adulto|senior',
      pref_sexo: prefs.preferredSex || 'indistinto',
      pref_energia: 3,
      apertura_nec_especiales: 1,
      apertura_senior: 1,
    };
  }
}
