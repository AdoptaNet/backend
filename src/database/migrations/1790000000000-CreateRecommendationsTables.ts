import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecommendationsTables1790000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum para interacciones de telemetría de recomendación
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommendation_interaction_enum') THEN
          CREATE TYPE "recommendation_interaction_enum" AS ENUM ('impression', 'click', 'apply');
        END IF;
      END$$;
    `);

    // 2. Tabla recommendation_caches (Caché de alto rendimiento e inferencia)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recommendation_caches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "adopter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "pet_id" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
        "score" DECIMAL(5, 4) NOT NULL,
        "reason_badges" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "is_fallback" BOOLEAN NOT NULL DEFAULT false,
        "generated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_recommendation_adopter_pet" UNIQUE ("adopter_id", "pet_id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rec_caches_adopter_score" ON "recommendation_caches"("adopter_id", "score" DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rec_caches_pet" ON "recommendation_caches"("pet_id");
    `);

    // 3. Tabla recommendation_interactions (Telemetría y evaluación empírica)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recommendation_interactions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "adopter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "pet_id" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
        "interaction_type" "recommendation_interaction_enum" NOT NULL,
        "position" INT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rec_interactions_adopter" ON "recommendation_interactions"("adopter_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rec_interactions_pet" ON "recommendation_interactions"("pet_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rec_interactions_type" ON "recommendation_interactions"("interaction_type");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rec_interactions_created_at" ON "recommendation_interactions"("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "recommendation_interactions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recommendation_caches";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "recommendation_interaction_enum";`);
  }
}
