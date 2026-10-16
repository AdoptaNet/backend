import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdoptionRequestsTable1789800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enums de adopciones
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'adoption_status_enum') THEN
          CREATE TYPE "adoption_status_enum" AS ENUM (
            'pending',
            'under_review',
            'approved',
            'rejected',
            'cancelled'
          );
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'adoption_rejection_reason_enum') THEN
          CREATE TYPE "adoption_rejection_reason_enum" AS ENUM (
            'incompatible_housing',
            'unsuitable_schedule',
            'financial_incompatibility',
            'other_applicant_chosen',
            'incomplete_profile',
            'other'
          );
        END IF;
      END$$;
    `);

    // 2. Extender notifications_type_enum si no están presentes
    await queryRunner.query(`
      ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'new_adoption_request';
    `);
    await queryRunner.query(`
      ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'adoption_status_changed';
    `);

    // 3. Crear tabla adoption_requests
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "adoption_requests" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "pet_id" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
        "adopter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shelter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" "adoption_status_enum" NOT NULL DEFAULT 'pending',
        "motivation_letter" TEXT NOT NULL,
        "responsibility_pledge" BOOLEAN NOT NULL DEFAULT true,
        "adopter_snapshot" JSONB NOT NULL,
        "rejection_reason" "adoption_rejection_reason_enum" NULL,
        "rejection_notes" TEXT NULL,
        "approved_at" TIMESTAMP NULL,
        "rejected_at" TIMESTAMP NULL,
        "cancelled_at" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      );
    `);

    // 4. Índices de unicidad parcial y consulta
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_active_adoption_request" 
      ON "adoption_requests" ("pet_id", "adopter_id") 
      WHERE "status" IN ('pending', 'under_review') AND "deleted_at" IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_adoption_requests_adopter_status" 
      ON "adoption_requests" ("adopter_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_adoption_requests_shelter_status" 
      ON "adoption_requests" ("shelter_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_adoption_requests_pet_status" 
      ON "adoption_requests" ("pet_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_adoption_requests_created_at" 
      ON "adoption_requests" ("created_at" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "adoption_requests" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "adoption_rejection_reason_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "adoption_status_enum";`);
  }
}
