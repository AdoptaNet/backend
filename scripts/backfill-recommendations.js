/**
 * Script de Backfill y Pre-cálculo de Recomendaciones de IA
 *
 * Busca todos los adoptantes que tengan su encuesta de compatibilidad completa
 * (adopter_profiles.is_survey_completed = true).
 *
 * Para cada adoptante:
 * 1. Verifica si ya cuenta con caché vigente en `recommendation_caches` (a menos que se pase --force).
 * 2. Prepara el perfil del adoptante y el pool de mascotas disponibles.
 * 3. Invoca la inferencia del modelo híbrido en el microservicio ML (/v1/recommendations/match).
 * 4. Persiste las recomendaciones ordenadas con explicabilidad XAI (reason_badges) en `recommendation_caches`.
 *
 * Opciones CLI:
 *   --force       Recalcular recomendaciones incluso si el adoptante ya tiene caché.
 *   --dry-run     Ejecutar simulación sin guardar en la base de datos.
 *   --limit=N     Limitar la cantidad de adoptantes a procesar.
 *
 * Uso:
 *   npm run backfill:recommendations
 *   node scripts/backfill-recommendations.js --force
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Cargar variables de entorno del archivo .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !line.trim().startsWith('#')) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
    }
  });
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Argumentos CLI
const args = process.argv.slice(2);
const isForce = args.includes('--force');
const isDryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

const COSTA_DEPTS = new Set([
  'lima', 'callao', 'piura', 'tumbes', 'lambayeque', 'la libertad',
  'ancash', 'ica', 'arequipa', 'moquegua', 'tacna',
]);

const SELVA_DEPTS = new Set([
  'loreto', 'san martin', 'ucayali', 'madre de dios', 'amazonas',
]);

function getClimaticZone(departmentName) {
  const norm = (departmentName || 'lima').toLowerCase().trim();
  if (SELVA_DEPTS.has(norm)) return 'selva';
  if (COSTA_DEPTS.has(norm)) return 'costa';
  return 'sierra';
}

function mapAdopterToModel(profile) {
  const dept = (profile.department || 'lima').toLowerCase().trim();
  const zonaClimatica = getClimaticZone(dept);

  let tipoVivienda = 'departamento';
  if (profile.housing_type === 'house_with_yard') {
    tipoVivienda = 'casa_terreno';
  } else if (profile.housing_type === 'house_no_yard' || profile.housing_type === 'quinta') {
    tipoVivienda = 'casa';
  }

  const tenenciaPropia = profile.tenure_type === 'owned' ? 1 : 0;
  const permisoMascotas = profile.tenure_type === 'rented_no_permission' ? 0 : 1;

  const hasOutdoor = profile.outdoor_space === 'small_yard' || profile.outdoor_space === 'large_garden';
  const m2Exterior = profile.outdoor_space === 'large_garden' ? 60 : profile.outdoor_space === 'small_yard' ? 25 : 0;

  let nIntegrantes = 2;
  if (profile.household_size === 'alone') nIntegrantes = 1;
  else if (profile.household_size === 'four_five') nIntegrantes = 4;
  else if (profile.household_size === 'six_plus') nIntegrantes = 6;

  let hayNinos = false;
  let edadMinNinos = null;
  if (profile.has_children && profile.children_age_range && profile.children_age_range !== 'none') {
    hayNinos = true;
    if (profile.children_age_range === 'under_5') edadMinNinos = 3;
    else if (profile.children_age_range === 'five_to_12') edadMinNinos = 8;
    else if (profile.children_age_range === 'teenagers') edadMinNinos = 14;
    else edadMinNinos = 7;
  }

  let perroActual = 0;
  let gatoActual = 0;
  if (profile.current_pets === 'dogs' || profile.current_pets === 'both') perroActual = 1;
  if (profile.current_pets === 'cats' || profile.current_pets === 'both') gatoActual = 1;

  let horasFuera = 4;
  if (profile.hours_alone === 'zero_to_two' || profile.hours_alone === 'less_than_2') horasFuera = 2;
  else if (profile.hours_alone === 'four_to_eight' || profile.hours_alone === 'five_to_8') horasFuera = 7;
  else if (profile.hours_alone === 'more_than_eight' || profile.hours_alone === 'more_than_8') horasFuera = 10;

  let nivelActividad = 'moderado';
  if (profile.activity_level === 'sedentary' || profile.activity_level === 'low') {
    nivelActividad = 'sedentario';
  } else if (profile.activity_level === 'active' || profile.activity_level === 'very_active') {
    nivelActividad = 'activo';
  }

  let experiencia = 'alguna';
  if (profile.experience_level === 'first_time' || profile.experience_level === 'none') {
    experiencia = 'ninguna';
  } else if (profile.experience_level === 'experienced' || profile.experience_level === 'extensive') {
    experiencia = 'amplia';
  }

  let presupuesto = 'medio';
  if (
    profile.monthly_budget === 'under_50' ||
    profile.monthly_budget === 'fifty_to_100' ||
    profile.monthly_budget === 'under_100'
  ) {
    presupuesto = 'bajo';
  } else if (
    profile.monthly_budget === 'over_300' ||
    profile.monthly_budget === 'above_500'
  ) {
    presupuesto = 'alto';
  }

  let tiempoAdiestramiento = 'media';
  if (profile.walk_time === 'under_15' || profile.walk_time === 'less_than_15') {
    tiempoAdiestramiento = 'baja';
  } else if (profile.walk_time === 'more_than_60' || profile.walk_time === 'above_60') {
    tiempoAdiestramiento = 'alta';
  }

  let prefEspecie = 'indistinto';
  if (profile.preferred_species === 'dog') prefEspecie = 'perro';
  else if (profile.preferred_species === 'cat') prefEspecie = 'gato';

  let prefTamano = 'pequeno|mediano|grande';
  if (profile.preferred_size === 'small') prefTamano = 'pequeno';
  else if (profile.preferred_size === 'medium') prefTamano = 'mediano';
  else if (profile.preferred_size === 'large') prefTamano = 'grande';

  let prefEdad = 'cachorro|joven|adulto|senior';
  if (profile.preferred_age === 'puppy') prefEdad = 'cachorro';
  else if (profile.preferred_age === 'young') prefEdad = 'joven';
  else if (profile.preferred_age === 'adult') prefEdad = 'adulto';
  else if (profile.preferred_age === 'senior') prefEdad = 'senior';

  let prefSexo = 'indistinto';
  if (profile.preferred_sex === 'male') prefSexo = 'macho';
  else if (profile.preferred_sex === 'female') prefSexo = 'hembra';

  const aperturaNecEsp =
    profile.special_needs_acceptance &&
    profile.special_needs_acceptance !== 'no'
      ? 1
      : 0;
  const aperturaSenior =
    profile.preferred_age === 'senior' || profile.preferred_age === 'any'
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
    cercado_seguro: profile.is_fenced ? 1 : 0,
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

function mapPetToModel(pet) {
  const chars = pet.characteristics || {};
  const deptRefugio = (pet.shelter_dept || pet.shelter_city || 'lima').toLowerCase().trim();

  let catEdad = 'adulto';
  if (pet.age_category === 'puppy') catEdad = 'cachorro';
  else if (pet.age_category === 'young') catEdad = 'joven';
  else if (pet.age_category === 'senior') catEdad = 'senior';

  let tam = 'mediano';
  if (pet.size === 'small') tam = 'pequeno';
  else if (pet.size === 'large') tam = 'grande';

  let pelaje = 'corto';
  if (chars.furLength === 'long') pelaje = 'largo';
  else if (chars.furLength === 'medium') pelaje = 'medio';

  const mapSoc = (val) => {
    if (val === true) return 'alto';
    if (val === false) return 'bajo';
    return 'desconocido';
  };

  const voc = Number(chars.vocalizationLevel ?? 2);
  const nivelLadrido = voc <= 2 ? 'bajo' : voc === 3 ? 'medio' : 'alto';

  let entrenamiento = 'nulo';
  if (chars.trainingLevel === 'basic') entrenamiento = 'parcial';
  else if (chars.trainingLevel === 'advanced') entrenamiento = 'completo';

  let salud = 'sano';
  if (chars.healthStatus === 'special_needs') salud = 'necesidad_especial';
  else if (chars.healthStatus === 'under_treatment') salud = 'cronica';

  const dias = Math.max(1, Number(chars.shelterStayMonths || 1) * 30);

  return {
    pet_id: pet.id,
    especie: pet.species === 'dog' ? 'perro' : 'gato',
    sexo: pet.gender === 'male' ? 'macho' : 'hembra',
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
    req_area_exterior: pet.size === 'large' ? 1 : 0,
    req_cercado: Number(chars.energyLevel || 3) >= 4 ? 1 : 0,
    req_sin_ninos: chars.goodWithChildren === false ? 1 : 0,
    dias_en_refugio: dias,
  };
}

async function main() {
  console.log('================================================================');
  console.log('⚡ BACKFILL DE RECOMENDACIONES PERSONALIZADAS (CACHÉ IA) ⚡');
  console.log('================================================================');
  if (isDryRun) console.log('🔍 MODO SIMULACIÓN (--dry-run): No se guardarán cambios en la BD.');
  if (isForce) console.log('🔄 MODO FORZADO (--force): Se recalculará la caché para todos.');

  // 1. Verificar microservicio ML
  process.stdout.write(`\n[1/4] Verificando microservicio ML en ${ML_SERVICE_URL}... `);
  try {
    const healthRes = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!healthRes.ok) throw new Error(`HTTP ${healthRes.status}`);
    const healthData = await healthRes.json();
    if (!healthData.recommendation_model?.ready && !healthData.recommendation_model?.loaded) {
      throw new Error('El modelo de recomendaciones no está cargado en el ML Service');
    }
    console.log(`✔ ACTIVO (Modelo v${healthData.recommendation_model.version})`);
  } catch (err) {
    console.error(`\n✘ Error conectando a ${ML_SERVICE_URL}: ${err.message}`);
    console.error('Por favor, asegúrate de levantar el microservicio de IA:');
    console.error('  cd ml-service && source .venv/bin/activate && uvicorn app.main:app --port 8000 --reload\n');
    process.exit(1);
  }

  // 2. Conectar a PostgreSQL
  console.log('\n[2/4] Conectando a la base de datos...');
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl:
      process.env.DATABASE_HOST?.includes('supabase') ||
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });

  await client.connect();

  try {
    // 3. Obtener mascotas disponibles
    const petsRes = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.species,
        p.gender,
        p.size,
        p.age_category,
        p.characteristics,
        sp.department as shelter_dept,
        sp.city as shelter_city
      FROM pets p
      JOIN users s ON s.id = p.shelter_id
      LEFT JOIN shelter_profiles sp ON sp.user_id = s.id
      WHERE p.status IN ('available', 'in_process')
      ORDER BY p.created_at DESC;
    `);

    const availablePets = petsRes.rows;
    console.log(`✔ Mascotas disponibles en catálogo: ${availablePets.length}`);
    if (availablePets.length === 0) {
      console.log('⚠ No hay mascotas en adopción disponibles para generar recomendaciones.');
      return;
    }

    const modelPets = availablePets.map(mapPetToModel);

    // 4. Obtener adoptantes con encuesta completada
    let adoptersQuery = `
      SELECT 
        u.id as user_id,
        u.email,
        u.full_name,
        ap.*,
        COUNT(rc.id) as cached_count
      FROM adopter_profiles ap
      JOIN users u ON u.id = ap.user_id
      LEFT JOIN recommendation_caches rc ON rc.adopter_id = u.id
      WHERE ap.is_survey_completed = true
      GROUP BY u.id, u.email, u.full_name, ap.id
      ORDER BY u.created_at ASC
    `;
    if (limit) adoptersQuery += ` LIMIT ${limit}`;

    const adoptersRes = await client.query(adoptersQuery);
    const adopters = adoptersRes.rows;
    console.log(`✔ Adoptantes con encuesta completada encontrados: ${adopters.length}`);

    const targets = isForce
      ? adopters
      : adopters.filter((a) => parseInt(a.cached_count, 10) === 0);

    console.log(`🎯 Adoptantes a procesar: ${targets.length} (omitidos por tener caché vigente: ${adopters.length - targets.length})`);

    if (targets.length === 0) {
      console.log('✔ Todos los adoptantes ya tienen caché precomputada. (Usa --force si deseas recalcular)');
      return;
    }

    console.log('\n[3/4] Generando recomendaciones personalizadas con IA...');
    let totalProcessed = 0;
    let totalCached = 0;

    for (let i = 0; i < targets.length; i++) {
      const adopter = targets[i];
      const displayName = adopter.full_name || adopter.email;
      process.stdout.write(`  [${i + 1}/${targets.length}] Adoptante ${displayName}... `);

      const modelAdopter = mapAdopterToModel(adopter);

      const payload = {
        adopter: modelAdopter,
        pets: modelPets,
        k: Math.min(modelPets.length, 50),
      };

      const matchRes = await fetch(`${ML_SERVICE_URL}/v1/recommendations/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!matchRes.ok) {
        const errText = await matchRes.text();
        console.log(`✘ Falló inferencia ML: HTTP ${matchRes.status} - ${errText}`);
        continue;
      }

      const mlResult = await matchRes.json();
      const recs = mlResult.recomendaciones || [];

      if (!isDryRun && recs.length > 0) {
        // Purgar caché previa si existiera
        await client.query('DELETE FROM recommendation_caches WHERE adopter_id = $1', [adopter.user_id]);

        // Insertar nuevas recomendaciones en lote
        for (const item of recs) {
          const badges = (item.motivos || []).map((m) => ({ badge: m }));
          await client.query(
            `INSERT INTO recommendation_caches (adopter_id, pet_id, score, reason_badges, is_fallback, generated_at)
             VALUES ($1, $2, $3, $4, false, now())
             ON CONFLICT (adopter_id, pet_id) 
             DO UPDATE SET score = EXCLUDED.score, reason_badges = EXCLUDED.reason_badges, generated_at = now()`,
            [adopter.user_id, item.pet_id, item.score, JSON.stringify(badges)],
          );
        }
      }

      console.log(`✔ ${recs.length} recomendaciones cacheadas (${mlResult.tiempo_ms || 0}ms inferencia)`);
      totalProcessed++;
      totalCached += recs.length;
    }

    console.log('\n[4/4] Resumen de finalización:');
    console.log(`  • Adoptantes procesados: ${totalProcessed}/${targets.length}`);
    console.log(`  • Total de recomendaciones cacheadas: ${totalCached}`);
    console.log('\n🎉 ¡Backfill completado exitosamente!');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\n✘ Error fatal durante el backfill:', err);
  process.exit(1);
});
