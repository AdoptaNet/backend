import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationRequestColumnsToShelterProfiles1790300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shelter_profiles"
      ADD COLUMN IF NOT EXISTS "verification_requested" BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "verification_requested_at" TIMESTAMP NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shelter_profiles"
      DROP COLUMN IF EXISTS "verification_requested_at",
      DROP COLUMN IF EXISTS "verification_requested";
    `);
  }
}
