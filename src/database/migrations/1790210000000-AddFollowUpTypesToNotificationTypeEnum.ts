import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFollowUpTypesToNotificationTypeEnum1790210000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const newTypes = [
      'follow_up_overdue',
      'follow_up_milestone_approved',
      'follow_up_action_required',
      'follow_up_completed',
      'pet_return_requested',
      'pet_return_confirmed',
    ];

    for (const type of newTypes) {
      await queryRunner.query(
        `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS '${type}'`,
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL no soporta eliminar valores individuales de un enum sin recrear el tipo y la tabla.
  }
}
