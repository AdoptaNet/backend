import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCharacteristicsAndVisualEmbeddingToPets1789900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Activar la extensión pgvector si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // 2. Agregar la columna characteristics (JSONB)
    await queryRunner.query(
      `ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "characteristics" JSONB NOT NULL DEFAULT '{}'::jsonb;`,
    );

    // 3. Agregar la columna visual_embedding de 384 dimensiones (DINOv2)
    await queryRunner.query(
      `ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "visual_embedding" vector(384) NULL;`,
    );

    // 4. Poblar characteristics en registros previos usando las columnas existentes
    await queryRunner.query(`
      UPDATE "pets"
      SET "characteristics" = jsonb_build_object(
        'colors', COALESCE("characteristics"->'colors', '[]'::jsonb),
        'medical', jsonb_build_object(
          'fur_length', "fur_length"::text,
          'is_sterilized', "is_sterilized",
          'is_vaccinated', "is_vaccinated",
          'health_status', "health_status"::text,
          'health_notes', "health_notes"
        ),
        'behavioral', jsonb_build_object(
          'energy_level', "energy_level",
          'vocalization_level', "vocalization_level",
          'training_level', "training_level"::text,
          'good_with_children', "good_with_children",
          'good_with_dogs', "good_with_dogs",
          'good_with_cats', "good_with_cats",
          'time_alone_tolerance_hours', "time_alone_tolerance_hours",
          'shelter_stay_months', "shelter_stay_months"
        )
      )
      WHERE "characteristics" = '{}'::jsonb;
    `);

    // 5. Eliminar las 13 columnas escalares redundantes de la tabla pets
    await queryRunner.query(`
      ALTER TABLE "pets"
        DROP COLUMN IF EXISTS "fur_length",
        DROP COLUMN IF EXISTS "is_sterilized",
        DROP COLUMN IF EXISTS "is_vaccinated",
        DROP COLUMN IF EXISTS "health_status",
        DROP COLUMN IF EXISTS "health_notes",
        DROP COLUMN IF EXISTS "energy_level",
        DROP COLUMN IF EXISTS "good_with_children",
        DROP COLUMN IF EXISTS "good_with_dogs",
        DROP COLUMN IF EXISTS "good_with_cats",
        DROP COLUMN IF EXISTS "vocalization_level",
        DROP COLUMN IF EXISTS "training_level",
        DROP COLUMN IF EXISTS "time_alone_tolerance_hours",
        DROP COLUMN IF EXISTS "shelter_stay_months";
    `);

    // 6. Crear índice GIN para characteristics
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_pets_characteristics_gin" ON "pets" USING GIN ("characteristics");`,
    );

    // 7. Crear índice HNSW para búsqueda por similitud coseno
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_pets_visual_embedding_cosine" ON "pets" USING hnsw ("visual_embedding" vector_cosine_ops);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_pets_visual_embedding_cosine";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_pets_characteristics_gin";`,
    );

    // Restaurar columnas
    await queryRunner.query(`
      ALTER TABLE "pets"
        ADD COLUMN IF NOT EXISTS "fur_length" pets_fur_length_enum DEFAULT 'short',
        ADD COLUMN IF NOT EXISTS "is_sterilized" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "is_vaccinated" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "health_status" pets_health_status_enum DEFAULT 'healthy',
        ADD COLUMN IF NOT EXISTS "health_notes" text,
        ADD COLUMN IF NOT EXISTS "energy_level" integer DEFAULT 3,
        ADD COLUMN IF NOT EXISTS "good_with_children" boolean,
        ADD COLUMN IF NOT EXISTS "good_with_dogs" boolean,
        ADD COLUMN IF NOT EXISTS "good_with_cats" boolean,
        ADD COLUMN IF NOT EXISTS "vocalization_level" integer DEFAULT 1,
        ADD COLUMN IF NOT EXISTS "training_level" pets_training_level_enum DEFAULT 'none',
        ADD COLUMN IF NOT EXISTS "time_alone_tolerance_hours" integer,
        ADD COLUMN IF NOT EXISTS "shelter_stay_months" integer DEFAULT 0;
    `);

    // Restaurar datos desde characteristics
    await queryRunner.query(`
      UPDATE "pets"
      SET
        "fur_length" = COALESCE(("characteristics"->'medical'->>'fur_length')::pets_fur_length_enum, 'short'),
        "is_sterilized" = COALESCE(("characteristics"->'medical'->>'is_sterilized')::boolean, false),
        "is_vaccinated" = COALESCE(("characteristics"->'medical'->>'is_vaccinated')::boolean, false),
        "health_status" = COALESCE(("characteristics"->'medical'->>'health_status')::pets_health_status_enum, 'healthy'),
        "health_notes" = "characteristics"->'medical'->>'health_notes',
        "energy_level" = COALESCE(("characteristics"->'behavioral'->>'energy_level')::integer, 3),
        "good_with_children" = ("characteristics"->'behavioral'->>'good_with_children')::boolean,
        "good_with_dogs" = ("characteristics"->'behavioral'->>'good_with_dogs')::boolean,
        "good_with_cats" = ("characteristics"->'behavioral'->>'good_with_cats')::boolean,
        "vocalization_level" = COALESCE(("characteristics"->'behavioral'->>'vocalization_level')::integer, 1),
        "training_level" = COALESCE(("characteristics"->'behavioral'->>'training_level')::pets_training_level_enum, 'none'),
        "time_alone_tolerance_hours" = ("characteristics"->'behavioral'->>'time_alone_tolerance_hours')::integer,
        "shelter_stay_months" = COALESCE(("characteristics"->'behavioral'->>'shelter_stay_months')::integer, 0);
    `);

    await queryRunner.query(
      `ALTER TABLE "pets" DROP COLUMN IF EXISTS "visual_embedding";`,
    );
    await queryRunner.query(
      `ALTER TABLE "pets" DROP COLUMN IF EXISTS "characteristics";`,
    );
  }
}
