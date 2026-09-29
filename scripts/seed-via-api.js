/**
 * Seed database using the running REST API
 * Guarantees RFC 4122 v4 UUIDs, full password hashing, real Cloudinary uploads,
 * native TypeORM events, immutable snapshots, and domain lifecycle transitions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_BASE = 'http://localhost:3001';
const DOCKER_CONTAINER = 'supabase_db_adopta-net';

function runSql(sql) {
  const cmd = `docker exec -i ${DOCKER_CONTAINER} psql -U postgres -d postgres -c "${sql.replace(/"/g, '\\"')}"`;
  execSync(cmd, { stdio: 'pipe' });
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${endpoint}: ${typeof json === 'object' ? JSON.stringify(json) : json}`);
  }
  return json;
}

async function register(email, password, fullName, role) {
  const regRole = role === 'admin' ? 'shelter' : role;
  await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, role: regRole }),
  });
  // Activate email & confirm role selection directly in DB (and elevate role if admin)
  runSql(`UPDATE users SET is_email_verified = true, role_selected = true, role = '${role}' WHERE email = '${email.toLowerCase()}';`);
}

async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return { token: data.accessToken, user: data.user };
}

async function uploadPhoto(token, filePath) {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const file = new File([buffer], filename, { type: 'image/jpeg' });
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Upload failed for ${filename}: ${JSON.stringify(data)}`);
  }
  return { url: data.url, publicId: data.publicId };
}

async function main() {
  console.log('===============================================================');
  console.log('🐾 INICIANDO SEEDING COMPLETO A TRAVÉS DE LA API DE ADOPTANET 🐾');
  console.log('===============================================================');

  // 1. Limpiar base de datos
  console.log('\n[1/7] Limpiando tablas operativas de la base de datos...');
  runSql('TRUNCATE TABLE adoption_requests, pet_photos, pets, notifications, adopter_profiles, shelter_profiles, users CASCADE;');
  console.log('✔ Base de datos reseteada limpiamente (migraciones preservadas).');

  // 2. Crear Administrador
  console.log('\n[2/7] Creando cuenta de Administrador...');
  const adminEmail = 'admin@adopta.pe';
  const commonPass = 'Password123!';
  await register(adminEmail, commonPass, 'Administrador AdoptaNet', 'admin');
  const { token: adminToken, user: adminUser } = await login(adminEmail, commonPass);
  console.log(`✔ Admin creado: ${adminEmail} (UUID: ${adminUser.id})`);

  // 3. Subir fotos a Cloudinary usando la API (o usar caché para ejecuciones instantáneas)
  const assetsDir = path.join(__dirname, 'seed-assets');
  const cacheFile = path.join(assetsDir, 'cloudinary-cache.json');
  let dogPhotos = [];
  let catPhotos = [];

  if (fs.existsSync(cacheFile)) {
    console.log('\n[3/7] Usando URLs cacheadas de Cloudinary (ejecución ultrarrápida)...');
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    dogPhotos = cached.dogPhotos;
    catPhotos = cached.catPhotos;
    console.log(`✔ Cargadas ${dogPhotos.length} fotos de perros y ${catPhotos.length} fotos de gatos desde caché.`);
  } else {
    console.log('\n[3/7] Subiendo lote de fotos reales a Cloudinary mediante POST /media/upload...');
    for (let i = 1; i <= 6; i++) {
      const dogPath = path.join(assetsDir, `dog-${i}.jpg`);
      const catPath = path.join(assetsDir, `cat-${i}.jpg`);

      if (fs.existsSync(dogPath)) {
        process.stdout.write(`  - Subiendo dog-${i}.jpg... `);
        const res = await uploadPhoto(adminToken, dogPath);
        dogPhotos.push(res);
        console.log('✔ OK');
      }
      if (fs.existsSync(catPath)) {
        process.stdout.write(`  - Subiendo cat-${i}.jpg... `);
        const res = await uploadPhoto(adminToken, catPath);
        catPhotos.push(res);
        console.log('✔ OK');
      }
    }
    fs.writeFileSync(cacheFile, JSON.stringify({ dogPhotos, catPhotos }, null, 2));
    console.log(`✔ Subidas y cacheadas ${dogPhotos.length} fotos de perros y ${catPhotos.length} fotos de gatos.`);
  }

  // 4. Crear Albergues
  console.log('\n[4/7] Registrando y configurando 3 Albergues...');
  const sheltersData = [
    {
      email: 'huellitas@albergue.pe',
      name: 'Huellitas con Esperanza',
      fullName: 'Albergue Huellitas con Esperanza',
      phone: '987654321',
      city: 'Lima',
      department: 'Lima',
      address: 'Av. Alfredo Mendiola 3500, Los Olivos',
      lat: -11.9932,
      lng: -77.0689,
      description: 'Albergue comprometido con el rescate y rehabilitación de perritos y gatitos en Lima Norte. Más de 5 años transformando vidas.',
      capacity: 35,
      verify: true,
    },
    {
      email: 'patitas@albergue.pe',
      name: 'Refugio Patitas Callejeras',
      fullName: 'Refugio Patitas Callejeras',
      phone: '912345678',
      city: 'Lima',
      department: 'Lima',
      address: 'Jr. Huancavelica 240, San Miguel',
      lat: -12.0792,
      lng: -77.0945,
      description: 'Refugio dedicado al rescate de animales senior y casos de salud vulnerables en la zona costera de Lima.',
      capacity: 25,
      verify: true,
    },
    {
      email: 'sanroque@albergue.pe',
      name: 'Hogar San Roque Rescates',
      fullName: 'Hogar San Roque Rescates',
      phone: '998877665',
      city: 'Lima',
      department: 'Lima',
      address: 'Calle Los Sauces 140, Santiago de Surco',
      lat: -12.1432,
      lng: -76.9984,
      description: 'Grupo independiente de rescate comunitario en Surco. En proceso de formalización y acreditación.',
      capacity: 20,
      verify: false, // Dejar sin verificar para pruebas de UI
    },
  ];

  const shelters = [];
  for (const s of sheltersData) {
    await register(s.email, commonPass, s.fullName, 'shelter');
    const { token, user } = await login(s.email, commonPass);

    // Actualizar perfil institucional via PUT /users/me/shelter-profile
    await request('/users/me/shelter-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        organizationName: s.name,
        phoneNumber: s.phone,
        city: s.city,
        department: s.department,
        address: s.address,
        latitude: s.lat,
        longitude: s.lng,
        description: s.description,
        rescueCapacity: s.capacity,
      }),
    });

    // Si corresponde, verificar mediante admin via PATCH /admin/shelters/:id/verify
    if (s.verify) {
      await request(`/admin/shelters/${user.id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isVerified: true }),
      });
    }

    shelters.push({ ...s, userId: user.id, token });
    console.log(`✔ Albergue: ${s.name} (${s.email}) — ${s.verify ? 'VERIFICADO' : 'PENDIENTE VERIFICACIÓN'}`);
  }

  // 5. Crear Adoptantes
  console.log('\n[5/7] Registrando y configurando 4 Adoptantes...');
  const adoptersData = [
    {
      email: 'carlos.mendoza@adopter.pe',
      fullName: 'Carlos Mendoza',
      phone: '981234567',
      city: 'Miraflores',
      department: 'Lima',
      survey: {
        zoneType: 'urban_quiet',
        housingType: 'apartment',
        outdoorSpace: 'balcony',
        isFenced: true,
        tenureType: 'owned',
        householdSize: 'two_three',
        childrenAgeRange: 'none',
        hasElderly: false,
        allergyType: 'none',
        currentPets: 'none',
        currentPetsSociability: 'not_applicable',
        hoursAlone: 'two_to_4',
        workSchedule: 'hybrid',
        activityLevel: 'active',
        walkTime: 'thirty_to_60',
        monthlyBudget: 'two_hundred_to_300',
        vetBudget: 'emergencies',
        experienceLevel: 'experienced',
        preferredSpecies: 'dog',
        preferredSize: 'medium',
        preferredAge: 'young',
        preferredSex: 'any',
        preferredTemperament: 'balanced',
        furPreference: 'short',
        noiseTolerance: 'moderate',
        specialNeedsAcceptance: 'any',
        sterilizationCommitment: true,
        adoptionMotivation: 'companionship',
        followUpAcceptance: 'fully_accept',
        adopterAgeRange: '26_to_35',
      },
    },
    {
      email: 'lucia.paredes@adopter.pe',
      fullName: 'Lucía Paredes',
      phone: '976543210',
      city: 'San Isidro',
      department: 'Lima',
      survey: {
        zoneType: 'urban_quiet',
        housingType: 'house_with_yard',
        outdoorSpace: 'large_garden',
        isFenced: true,
        tenureType: 'owned',
        householdSize: 'two_three',
        childrenAgeRange: 'none',
        hasElderly: false,
        allergyType: 'none',
        currentPets: 'cats',
        currentPetsSociability: 'very_sociable',
        hoursAlone: 'less_than_2',
        workSchedule: 'from_home',
        activityLevel: 'moderate',
        walkTime: 'fifteen_to_30',
        monthlyBudget: 'over_300',
        vetBudget: 'chronic_treatment',
        experienceLevel: 'experienced',
        preferredSpecies: 'cat',
        preferredSize: 'small',
        preferredAge: 'young',
        preferredSex: 'female',
        preferredTemperament: 'calm',
        furPreference: 'any',
        noiseTolerance: 'low',
        specialNeedsAcceptance: 'any',
        sterilizationCommitment: true,
        adoptionMotivation: 'rescue',
        followUpAcceptance: 'fully_accept',
        adopterAgeRange: '26_to_35',
      },
    },
    {
      email: 'mateo.salazar@adopter.pe',
      fullName: 'Mateo Salazar',
      phone: '965432109',
      city: 'Surco',
      department: 'Lima',
      survey: {
        zoneType: 'urban_traffic',
        housingType: 'house_with_yard',
        outdoorSpace: 'small_yard',
        isFenced: true,
        tenureType: 'owned',
        householdSize: 'four_five',
        childrenAgeRange: 'five_to_12',
        hasElderly: true,
        allergyType: 'none',
        currentPets: 'none',
        currentPetsSociability: 'not_applicable',
        hoursAlone: 'two_to_4',
        workSchedule: 'hybrid',
        activityLevel: 'moderate',
        walkTime: 'thirty_to_60',
        monthlyBudget: 'hundred_to_200',
        vetBudget: 'emergencies',
        experienceLevel: 'moderate',
        preferredSpecies: 'dog',
        preferredSize: 'medium',
        preferredAge: 'young',
        preferredSex: 'male',
        preferredTemperament: 'balanced',
        furPreference: 'short',
        noiseTolerance: 'moderate',
        specialNeedsAcceptance: 'no',
        sterilizationCommitment: true,
        adoptionMotivation: 'family',
        followUpAcceptance: 'fully_accept',
        adopterAgeRange: '36_to_45',
      },
    },
    {
      email: 'valeria.gomez@adopter.pe',
      fullName: 'Valeria Gómez',
      phone: '954321098',
      city: 'Barranco',
      department: 'Lima',
      survey: null, // Dejar pendiente para probar el gate de cuestionario
    },
  ];

  const adopters = [];
  for (const a of adoptersData) {
    await register(a.email, commonPass, a.fullName, 'adopter');
    const { token, user } = await login(a.email, commonPass);

    // Actualizar perfil de adoptante via PUT /users/me/adopter-profile
    const payload = {
      phoneNumber: a.phone,
      city: a.city,
      department: a.department,
      ...(a.survey || {}),
    };

    await request('/users/me/adopter-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    adopters.push({ ...a, userId: user.id, token });
    console.log(`✔ Adoptante: ${a.fullName} (${a.email}) — Cuestionario: ${a.survey ? '100% COMPLETADO' : 'PENDIENTE'}`);
  }

  // 6. Crear Mascotas via POST /pets
  console.log('\n[6/7] Creando 12 Mascotas mediante POST /pets...');

  function makePhotoList(species, offset) {
    const list = species === 'dog' ? dogPhotos : catPhotos;
    const p1 = list[offset % list.length];
    const p2 = list[(offset + 1) % list.length];
    const p3 = list[(offset + 2) % list.length];
    return [
      { url: p1.url, publicId: p1.publicId, isPrimary: true, order: 0 },
      { url: p2.url, publicId: p2.publicId, isPrimary: false, order: 1 },
      { url: p3.url, publicId: p3.publicId, isPrimary: false, order: 2 },
    ];
  }

  const petsConfig = [
    // Albergue 1 (Huellitas)
    {
      shelterIndex: 0,
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever Mix',
      gender: 'male',
      ageMonths: 18,
      size: 'medium',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 4,
      vocalizationLevel: 2,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: false,
      description: 'Max es un perrito noble, muy juguetón y lleno de energía positiva. Ama correr en parques y convivir con familias activas.',
      status: 'available',
      offset: 0,
    },
    {
      shelterIndex: 0,
      name: 'Luna',
      species: 'dog',
      breed: 'Mestiza',
      gender: 'female',
      ageMonths: 24,
      size: 'medium',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 3,
      vocalizationLevel: 1,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: true,
      description: 'Luna es tranquila, dulce y muy obediente. Ideal para departamento o casa con rutina relajada.',
      status: 'available',
      offset: 1,
    },
    {
      shelterIndex: 0,
      name: 'Mishi',
      species: 'cat',
      breed: 'Atigrado Europeo',
      gender: 'female',
      ageMonths: 14,
      size: 'small',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 2,
      vocalizationLevel: 2,
      goodWithChildren: true,
      goodWithDogs: false,
      goodWithCats: true,
      description: 'Mishi adora descansar cerca de ventanas soleadas y recibir caricias. Muy limpia y sociable con otros gatos.',
      status: 'available',
      offset: 0,
    },
    {
      shelterIndex: 0,
      name: 'Rocky',
      species: 'dog',
      breed: 'Labrador Mestizo',
      gender: 'male',
      ageMonths: 36,
      size: 'large',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 3,
      vocalizationLevel: 2,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: false,
      description: 'Rocky es un perro guardián y compañero leal rescatado en una obra. Tiene entrenamiento básico y es muy obediente.',
      status: 'available', // pasará a adopted por solicitud
      offset: 2,
    },

    // Albergue 2 (Patitas)
    {
      shelterIndex: 1,
      name: 'Simba',
      species: 'cat',
      breed: 'Naranjoso Mestizo',
      gender: 'male',
      ageMonths: 10,
      size: 'small',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 3,
      vocalizationLevel: 3,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: true,
      description: 'Simba es un gatito curioso y ronroneador que busca cariño permanente. Se lleva genial con todos en casa.',
      status: 'available',
      offset: 1,
    },
    {
      shelterIndex: 1,
      name: 'Toby',
      species: 'dog',
      breed: 'Beagle Mestizo',
      gender: 'male',
      ageMonths: 15,
      size: 'small',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 3,
      vocalizationLevel: 3,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: null,
      description: 'Toby es alegre, cariñoso y tiene un olfato insaciable. Le encantan las caminatas diarias por el parque.',
      status: 'available',
      offset: 3,
    },
    {
      shelterIndex: 1,
      name: 'Nala',
      species: 'cat',
      breed: 'Siamés Mestiza',
      gender: 'female',
      ageMonths: 20,
      size: 'small',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 2,
      vocalizationLevel: 2,
      goodWithChildren: false,
      goodWithDogs: false,
      goodWithCats: true,
      description: 'Nala es una señorita elegante, algo tímida al inicio pero fiel y protectora de su espacio.',
      status: 'available',
      offset: 2,
    },
    {
      shelterIndex: 1,
      name: 'Balto',
      species: 'dog',
      breed: 'Husky Mestizo',
      gender: 'male',
      ageMonths: 48,
      size: 'large',
      furLength: 'long',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 3,
      vocalizationLevel: 2,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: false,
      description: 'Balto es un noble ejemplar rescatado en carretera. Muy cariñoso con adultos y protector del hogar.',
      status: 'available',
      offset: 4,
    },

    // Albergue 3 (San Roque)
    {
      shelterIndex: 2,
      name: 'Copito',
      species: 'cat',
      breed: 'Blanco Doméstico',
      gender: 'male',
      ageMonths: 8,
      size: 'small',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 4,
      vocalizationLevel: 1,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: true,
      description: 'Copito es puro amor y alegría. Juguetón incansable de plumeros y pelotas de tela.',
      status: 'available',
      offset: 3,
    },
    {
      shelterIndex: 2,
      name: 'Bella',
      species: 'dog',
      breed: 'Podenco Mestizo',
      gender: 'female',
      ageMonths: 16,
      size: 'medium',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 3,
      vocalizationLevel: 1,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: true,
      description: 'Bella es ágil, inteligente y con mirada enternecedora. Se adapta rápido a cualquier hogar con cariño.',
      status: 'available',
      offset: 5,
    },
    {
      shelterIndex: 2,
      name: 'Pelusa',
      species: 'cat',
      breed: 'Gata de Pelo Largo',
      gender: 'female',
      ageMonths: 30,
      size: 'small',
      furLength: 'long',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 1,
      vocalizationLevel: 1,
      goodWithChildren: true,
      goodWithDogs: false,
      goodWithCats: true,
      description: 'Pelusa es una bolita de algodón silenciosa y relajada. Ama dormir en cojines y que la cepillen con paciencia.',
      status: 'available',
      offset: 4,
    },
    {
      shelterIndex: 2,
      name: 'Thor',
      species: 'dog',
      breed: 'Pastor Mestizo',
      gender: 'male',
      ageMonths: 28,
      size: 'large',
      furLength: 'short',
      isSterilized: true,
      isVaccinated: true,
      healthStatus: 'healthy',
      energyLevel: 4,
      vocalizationLevel: 2,
      goodWithChildren: true,
      goodWithDogs: true,
      goodWithCats: false,
      description: 'Thor es valiente, juguetón y atlético. Busca personas que disfruten del senderismo o correr.',
      status: 'available',
      offset: 0,
    },
  ];

  const createdPets = [];
  for (const p of petsConfig) {
    const shelter = shelters[p.shelterIndex];
    const photos = makePhotoList(p.species, p.offset);

    const petRes = await request('/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shelter.token}`,
      },
      body: JSON.stringify({
        name: p.name,
        species: p.species,
        breed: p.breed,
        gender: p.gender,
        ageMonths: p.ageMonths,
        size: p.size,
        furLength: p.furLength,
        isSterilized: p.isSterilized,
        isVaccinated: p.isVaccinated,
        healthStatus: p.healthStatus,
        energyLevel: p.energyLevel,
        vocalizationLevel: p.vocalizationLevel,
        goodWithChildren: p.goodWithChildren,
        goodWithDogs: p.goodWithDogs,
        goodWithCats: p.goodWithCats,
        description: p.description,
        photos,
      }),
    });

    createdPets.push({ ...petRes, shelterIndex: p.shelterIndex });
    console.log(`✔ Mascota creada: ${p.name} (${p.species}) en ${shelter.name} — ID: ${petRes.id}`);
  }

  // 7. Crear y Resolver Solicitudes de Adopción
  console.log('\n[7/7] Creando y gestionando Solicitudes de Adopción mediante API...');

  const rocky = createdPets.find((p) => p.name === 'Rocky');
  const balto = createdPets.find((p) => p.name === 'Balto');
  const toby = createdPets.find((p) => p.name === 'Toby');
  const luna = createdPets.find((p) => p.name === 'Luna');
  const max = createdPets.find((p) => p.name === 'Max');

  const carlos = adopters[0];
  const lucia = adopters[1];
  const mateo = adopters[2];

  // Solicitud 1: Carlos Mendoza -> Rocky
  const req1 = await request('/adoptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${carlos.token}`,
    },
    body: JSON.stringify({
      petId: rocky.id,
      motivationLetter: 'Vivo en una casa amplia con patio cerrado. Cuento con tiempo y solvencia económica para darle la mejor vida a Rocky.',
      responsibilityPledge: true,
    }),
  });
  console.log(`✔ Solicitud 1 creada: Carlos -> Rocky (ID: ${req1.id})`);

  // Solicitud 2: Lucía Paredes -> Rocky (solicitud competidora)
  const req2 = await request('/adoptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lucia.token}`,
    },
    body: JSON.stringify({
      petId: rocky.id,
      motivationLetter: 'Deseo postular por Rocky porque me conmovió su historia y tenemos jardín grande en casa con tiempo para pasearlo.',
      responsibilityPledge: true,
    }),
  });
  console.log(`✔ Solicitud 2 (competidora) creada: Lucía -> Rocky (ID: ${req2.id})`);

  // Aprobación atómica de Carlos para Rocky por Albergue Huellitas
  // Esto debe aprobar a Carlos, poner a Rocky en adopted y desestimar a Lucía automáticamente
  const shelter1 = shelters[0];
  await request(`/adoptions/${req1.id}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${shelter1.token}`,
    },
    body: JSON.stringify({
      status: 'approved',
    }),
  });
  console.log(`✔ Dictamen: Carlos APROBADO para Rocky. Rocky pasa a ADOPTADO. Lucía desestimada atómicamente.`);

  // Solicitud 3: Lucía Paredes -> Balto
  const req3 = await request('/adoptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lucia.token}`,
    },
    body: JSON.stringify({
      petId: balto.id,
      motivationLetter: 'Nos encantó Balto por su tamaño y carácter noble. Vivimos cerca de áreas verdes ideales para paseos.',
      responsibilityPledge: true,
    }),
  });

  // Albergue Patitas pone la solicitud de Lucía en "under_review"
  const shelter2 = shelters[1];
  await request(`/adoptions/${req3.id}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${shelter2.token}`,
    },
    body: JSON.stringify({
      status: 'under_review',
    }),
  });
  console.log(`✔ Solicitud 3: Lucía -> Balto en UNDER_REVIEW (lista para probar chat en Épica 6).`);

  // Solicitud 4: Mateo Salazar -> Toby (queda en PENDING)
  const req4 = await request('/adoptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mateo.token}`,
    },
    body: JSON.stringify({
      petId: toby.id,
      motivationLetter: 'Somos una familia con niños que busca un perrito juguetón y sociable. Toby es el compañero perfecto para nuestro hogar.',
      responsibilityPledge: true,
    }),
  });
  console.log(`✔ Solicitud 4: Mateo -> Toby queda en PENDING.`);

  // Solicitud 5: Mateo Salazar -> Luna (la cancela voluntariamente el adoptante)
  const req5 = await request('/adoptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mateo.token}`,
    },
    body: JSON.stringify({
      petId: luna.id,
      motivationLetter: 'Nos interesó Luna por su dulzura, pero luego decidimos evaluar una mascota de menor tamaño.',
      responsibilityPledge: true,
    }),
  });
  await request(`/adoptions/${req5.id}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${mateo.token}`,
    },
  });
  console.log(`✔ Solicitud 5: Mateo -> Luna CANCELADA voluntariamente por el adoptante.`);

  // Solicitud 6: Carlos Mendoza -> Max (rechazada con motivo constructivo)
  const req6 = await request('/adoptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${carlos.token}`,
    },
    body: JSON.stringify({
      petId: max.id,
      motivationLetter: 'Me gustaría adoptar también a Max para que tenga compañía y espacio en mis paseos diarios.',
      responsibilityPledge: true,
    }),
  });
  await request(`/adoptions/${req6.id}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${shelter1.token}`,
    },
    body: JSON.stringify({
      status: 'rejected',
      rejectionReason: 'incompatible_housing',
      rejectionNotes: 'Max requiere patio amplio y cercado según evaluación conductual veterinaria. Agradecemos mucho tu postulación.',
    }),
  });
  console.log(`✔ Solicitud 6: Carlos -> Max RECHAZADA con motivo 'incompatible_housing' y feedback.`);

  console.log('\n===============================================================');
  console.log('🎉 SEEDING COMPLETADO CON ÉXITO A TRAVÉS DE LA API DE ADOPTANET 🎉');
  console.log('===============================================================');
}

main().catch((err) => {
  console.error('\n❌ ERROR EN EL PROCESO DE SEEDING:', err);
  process.exit(1);
});
