import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateNotificationsTable1789500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tipos enum
    await queryRunner.query(
      `CREATE TYPE "notifications_type_enum" AS ENUM('welcome', 'adoption_status_changed', 'new_adoption_request', 'follow_up_reminder', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TYPE "notifications_channel_enum" AS ENUM('email', 'in_app', 'both')`,
    );
    await queryRunner.query(
      `CREATE TYPE "notifications_status_enum" AS ENUM('pending', 'sent', 'delivered', 'bounced', 'failed')`,
    );

    // 2. Crear tabla notifications
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'recipient_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'notifications_type_enum',
            default: "'custom'",
            isNullable: false,
          },
          {
            name: 'channel',
            type: 'notifications_channel_enum',
            default: "'email'",
            isNullable: false,
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'notifications_status_enum',
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );

    // 3. Crear índices
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_external_id',
        columnNames: ['external_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('notifications', 'IDX_notifications_external_id');
    await queryRunner.dropIndex('notifications', 'IDX_notifications_user_id');
    await queryRunner.dropTable('notifications', true);
    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_channel_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_type_enum"`);
  }
}
