/**
 * Script de Backfill de Embeddings Visuales para Mascotas
 *
 * Consulta todas las mascotas registradas que tengan `visual_embedding IS NULL`.
 * Envía las fotos (desde seed-assets local o descargadas de Cloudinary)
 * al microservicio ML (DINOv2) para calcular su vector de 384 dimensiones.
 * Actualiza la columna `visual_embedding` en la base de datos de PostgreSQL/Supabase.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Cargar variables de entorno del archivo .env
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

async function main() {
  console.log('================================================================');
  console.log('🧠 BACKFILL DE EMBEDDINGS VISUALES (DINOv2 + PGVECTOR) 🧠');
  console.log('================================================================');

  // 1. Verificar conectividad con el microservicio ML
  process.stdout.write(`\n[1/3] Verificando microservicio ML en ${ML_SERVICE_URL}... `);
  try {
    const healthRes = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!healthRes.ok) {
      throw new Error(`HTTP ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    console.log(`✔ ACTIVO (${healthData.service} v${healthData.version})`);
  } catch (err) {
    console.error(`\n✘ Error conectando a ${ML_SERVICE_URL}: ${err.message}`);
    console.error('\nPor favor, asegúrate de levantar el microservicio de IA antes de ejecutar este script:');
    console.error('  cd /home/franco/Escritorio/tp/ml-service');
    console.error('  source .venv/bin/activate');
    console.error('  uvicorn app.main:app --port 8000 --reload\n');
    process.exit(1);
  }

  // 2. Conectar a la base de datos PostgreSQL
  console.log('\n[2/3] Conectando a la base de datos...');
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.DATABASE_HOST?.includes('supabase') || process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();

  try {
    // 3. Obtener mascotas con visual_embedding IS NULL
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.species,
        json_agg(json_build_object('url', ph.url, 'is_primary', ph.is_primary, 'order', ph."order")) as photos
      FROM pets p
      LEFT JOIN pet_photos ph ON p.id = ph.pet_id
      WHERE p.visual_embedding IS NULL
      GROUP BY p.id, p.name, p.species
      ORDER BY p.name;
    `;

    const res = await client.query(query);
    const pets = res.rows;

    if (pets.length === 0) {
      console.log('✔ Todas las mascotas ya cuentan con su embedding visual calculado.');
      return;
    }

    console.log(`✔ Se encontraron ${pets.length} mascotas sin embedding visual.`);
    console.log('\n[3/3] Procesando mascotas e infiriendo vectores con DINOv2...');

    const assetsDir = path.join(__dirname, 'seed-assets', 'pets');

    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      const petSlug = pet.name.toLowerCase();
      const localPetDir = path.join(assetsDir, petSlug);
      const form = new FormData();

      let photoCount = 0;

      // Intentar cargar fotos locales desde seed-assets
      if (fs.existsSync(localPetDir)) {
        for (let idx = 1; idx <= 3; idx++) {
          const localPhoto = path.join(localPetDir, `${idx}.jpg`);
          if (fs.existsSync(localPhoto)) {
            const buf = fs.readFileSync(localPhoto);
            form.append('files', new File([buf], `${petSlug}_${idx}.jpg`, { type: 'image/jpeg' }));
            photoCount++;
          }
        }
      }

      // Si no hay fotos locales, descargar desde las URLs de Cloudinary
      if (photoCount === 0 && Array.isArray(pet.photos)) {
        for (const ph of pet.photos) {
          if (ph && ph.url) {
            const imgRes = await fetch(ph.url);
            const arrayBuf = await imgRes.arrayBuffer();
            form.append('files', new File([Buffer.from(arrayBuf)], `${petSlug}_remote.jpg`, { type: 'image/jpeg' }));
            photoCount++;
          }
        }
      }

      if (photoCount === 0) {
        console.warn(`  ⚠ ${pet.name} (${pet.id}): No tiene fotos para procesar. Se omite.`);
        continue;
      }

      process.stdout.write(`  [${i + 1}/${pets.length}] Procesando ${pet.name.padEnd(8)} (${photoCount} fotos)... `);

      const mlRes = await fetch(`${ML_SERVICE_URL}/v1/vision/autocomplete`, {
        method: 'POST',
        body: form,
      });

      if (!mlRes.ok) {
        const errorText = await mlRes.text();
        console.log(`✘ Falló ML: HTTP ${mlRes.status} - ${errorText}`);
        continue;
      }

      const mlData = await mlRes.json();
      const vector = mlData.embedding?.vector;

      if (!vector || !Array.isArray(vector) || vector.length !== 384) {
        console.log(`✘ Error: Vector inválido devuelto por ML (longitud: ${vector?.length || 0})`);
        continue;
      }

      // Actualizar visual_embedding en Postgres (formato vector de pgvector: '[0.1,0.2,...]')
      const vectorSql = `[${vector.join(',')}]`;
      await client.query('UPDATE pets SET visual_embedding = $1 WHERE id = $2;', [vectorSql, pet.id]);

      const colorsPredicted = mlData.attributes?.colors?.value?.join(', ') || 'N/A';
      console.log(`✔ OK (Dim: 384 | Colores detectados: [${colorsPredicted}] | Latencia: ${mlData.inference_time_ms}ms)`);
    }

    console.log('\n================================================================');
    console.log('🎉 BACKFILL COMPLETADO CON ÉXITO: Mascotas listas para búsqueda visual.');
    console.log('================================================================');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\n✘ Error en ejecución de backfill:', err);
  process.exit(1);
});
