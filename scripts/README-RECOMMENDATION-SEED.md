# Script de Seeding para el Modelo de Recomendación de Adopciones

Este script prepara y carga un catálogo amplio de mascotas para el sistema de recomendación de Adopta.pe, asegurando una distribución balanceada de variables conductuales, médicas y demográficas.

---

## 🌟 Características Clave

1. **Ingesta 100% Oficial por API REST (`POST /pets`)**:
   - No inserta SQL "a ciegas". Pasa por las entidades, pipes de validación (`CreatePetDto`), generador de slugs y eventos del dominio de NestJS.
2. **Cero Destrucción de Datos (Append-Only)**:
   - A diferencia de `seed-via-api.js`, este script **NO ejecuta `TRUNCATE`**. Los albergues, usuarios, solicitudes y mascotas existentes permanecen intactos.
3. **Aislamiento en Albergue Dedicado**:
   - Por defecto utiliza la cuenta `dataset.recomendador@adoptanet.pe` ("Albergue Esperanza - Dataset Recomendador").
   - Si no existe, la crea automáticamente vía API, verifica su cuenta y completa su perfil de albergue.
4. **Cumplimiento de Fotos sin Consumo Excesivo de Cloudinary**:
   - La API exige entre 3 y 6 fotos válidas con sus `publicId`.
   - El script reutiliza el pool verificado de imágenes de Cloudinary (`scripts/seed-assets/cloudinary-cache.json`) rotándolas coherentemente por especie (perros y gatos), garantizando que todas las mascotas tengan 3 fotos válidas de alta calidad.
5. **Modo Simulación (`--dry-run`)**:
   - Permite auditar qué mascotas se cargarían y con qué fotos sin tocar la base de datos ni la API.

---

## 📁 Archivos Relacionados

- **Script principal**: `scripts/seed-recommendation-catalog.js`
- **Dataset curado**: `scripts/data/recommendation-pets-dataset.json` (30 perfiles representativos listos, expandibles).
- **Caché de imágenes**: `scripts/seed-assets/cloudinary-cache.json` (pool de 36 fotos en Cloudinary).

---

## 🚀 Comandos de Uso

> **IMPORTANTE**: No ejecutar hasta que el usuario dé el visto bueno.

### 1. Auditoría / Simulación (Sin impacto en DB ni API):
```bash
node scripts/seed-recommendation-catalog.js --dry-run
```

### 2. Carga completa en Albergue de Dataset:
```bash
node scripts/seed-recommendation-catalog.js
```
o mediante npm:
```bash
npm run seed:recommendations
```

### 3. Carga parcial o parametrizada (Ej. solo 5 mascotas):
```bash
node scripts/seed-recommendation-catalog.js --limit=5
```

### 4. Carga bajo otro albergue existente:
```bash
node scripts/seed-recommendation-catalog.js --email=huellitas@albergue.pe
```

---

## 🧠 Siguiente Paso Opcional (Embeddings Visuales)

Una vez cargadas las mascotas, si se desea calcular los vectores visuales de 384 dimensiones mediante DINOv2 para la búsqueda por foto con IA:
```bash
npm run backfill:embeddings
```
