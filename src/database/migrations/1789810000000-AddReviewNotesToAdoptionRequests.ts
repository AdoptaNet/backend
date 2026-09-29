import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewNotesToAdoptionRequests1789810000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "adoption_requests"
      ADD COLUMN IF NOT EXISTS "review_notes" TEXT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "adoption_requests"
      DROP COLUMN IF EXISTS "review_notes";
    `);
  }
}
