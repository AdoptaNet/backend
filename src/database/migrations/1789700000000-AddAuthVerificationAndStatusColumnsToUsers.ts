import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddAuthVerificationAndStatusColumnsToUsers1789700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'is_email_verified',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'email_verified_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'email_verification_token_hash',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'email_verification_expires_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'password_reset_token_hash',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'password_reset_expires_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    ]);

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email_verification_token_hash',
        columnNames: ['email_verification_token_hash'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_password_reset_token_hash',
        columnNames: ['password_reset_token_hash'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_password_reset_token_hash');
    await queryRunner.dropIndex(
      'users',
      'idx_users_email_verification_token_hash',
    );

    await queryRunner.dropColumn('users', 'is_active');
    await queryRunner.dropColumn('users', 'password_reset_expires_at');
    await queryRunner.dropColumn('users', 'password_reset_token_hash');
    await queryRunner.dropColumn('users', 'email_verification_expires_at');
    await queryRunner.dropColumn('users', 'email_verification_token_hash');
    await queryRunner.dropColumn('users', 'email_verified_at');
    await queryRunner.dropColumn('users', 'is_email_verified');
  }
}
