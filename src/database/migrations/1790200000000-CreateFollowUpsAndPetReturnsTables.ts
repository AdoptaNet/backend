import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowUpsAndPetReturnsTables1790200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tipos ENUM
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "follow_up_process_status_enum" AS ENUM('in_progress', 'completed', 'returned');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "milestone_type_enum" AS ENUM('30_days', '90_days', '180_days');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "milestone_status_enum" AS ENUM('pending', 'submitted', 'completed', 'action_required', 'overdue');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "pet_return_reason_enum" AS ENUM('severe_allergy', 'behavioral_issue', 'landlord_issue', 'unforeseen_emergency', 'other');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "pet_return_status_enum" AS ENUM('requested', 'under_coordination', 'returned', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // 2. Tabla follow_up_records
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "follow_up_records" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "adoption_id" UUID NOT NULL REFERENCES "adoption_requests"("id") ON DELETE CASCADE,
        "pet_id" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
        "adopter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shelter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" "follow_up_process_status_enum" NOT NULL DEFAULT 'in_progress',
        "start_date" TIMESTAMP NOT NULL DEFAULT now(),
        "completion_date" TIMESTAMP NULL,
        "certificate_code" VARCHAR(100) NULL,
        "notes" TEXT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_follow_up_records_adoption" UNIQUE ("adoption_id"),
        CONSTRAINT "uq_follow_up_records_certificate" UNIQUE ("certificate_code")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_follow_up_records_adopter"
      ON "follow_up_records" ("adopter_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_follow_up_records_shelter"
      ON "follow_up_records" ("shelter_id", "status");
    `);

    // 3. Tabla follow_up_milestones
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "follow_up_milestones" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "record_id" UUID NOT NULL REFERENCES "follow_up_records"("id") ON DELETE CASCADE,
        "milestone_type" "milestone_type_enum" NOT NULL,
        "days_target" INT NOT NULL,
        "due_date" TIMESTAMP NOT NULL,
        "status" "milestone_status_enum" NOT NULL DEFAULT 'pending',
        "reminder_sent_at" TIMESTAMP NULL,
        "overdue_notified_at" TIMESTAMP NULL,
        "submitted_at" TIMESTAMP NULL,
        "reviewed_at" TIMESTAMP NULL,
        "reviewer_id" UUID NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "review_notes" TEXT NULL,
        "health_status_reported" VARCHAR(100) NULL,
        "adaptation_notes" TEXT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_milestone_record_type" UNIQUE ("record_id", "milestone_type")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_milestones_record_status"
      ON "follow_up_milestones" ("record_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_milestones_due_status"
      ON "follow_up_milestones" ("due_date", "status");
    `);

    // 4. Tabla follow_up_evidences
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "follow_up_evidences" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "milestone_id" UUID NOT NULL REFERENCES "follow_up_milestones"("id") ON DELETE CASCADE,
        "evidence_type" VARCHAR(100) NOT NULL DEFAULT 'pet_photo',
        "media_url" VARCHAR(1000) NOT NULL,
        "caption" TEXT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_evidences_milestone"
      ON "follow_up_evidences" ("milestone_id");
    `);

    // 5. Tabla pet_returns
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pet_returns" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "follow_up_record_id" UUID NOT NULL REFERENCES "follow_up_records"("id") ON DELETE CASCADE,
        "pet_id" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
        "adopter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shelter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "reason" "pet_return_reason_enum" NOT NULL,
        "explanation" TEXT NOT NULL,
        "supporting_document_url" VARCHAR(1000) NULL,
        "status" "pet_return_status_enum" NOT NULL DEFAULT 'requested',
        "requested_at" TIMESTAMP NOT NULL DEFAULT now(),
        "coordination_notes" TEXT NULL,
        "scheduled_return_date" TIMESTAMP NULL,
        "completed_at" TIMESTAMP NULL,
        "shelter_observations" TEXT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_pet_returns_record"
      ON "pet_returns" ("follow_up_record_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_pet_returns_shelter_status"
      ON "pet_returns" ("shelter_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_pet_returns_adopter_status"
      ON "pet_returns" ("adopter_id", "status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "pet_returns";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "follow_up_evidences";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "follow_up_milestones";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "follow_up_records";`);

    await queryRunner.query(`DROP TYPE IF EXISTS "pet_return_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "pet_return_reason_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "milestone_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "milestone_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "follow_up_process_status_enum";`);
  }
}
