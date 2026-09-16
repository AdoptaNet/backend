import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpenedAndComplainedToNotificationStatus1789501000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "notifications_status_enum" ADD VALUE IF NOT EXISTS 'opened'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_status_enum" ADD VALUE IF NOT EXISTS 'complained'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL no soporta eliminar valores individuales de un enum sin recrear la tabla.
  }
}
