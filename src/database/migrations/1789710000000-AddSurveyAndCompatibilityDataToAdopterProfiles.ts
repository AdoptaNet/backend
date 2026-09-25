import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddSurveyAndCompatibilityDataToAdopterProfiles1789710000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('adopter_profiles', [
      new TableColumn({
        name: 'city',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_survey_completed',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'compatibility_data',
        type: 'jsonb',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(
      'adopter_profiles',
      new TableIndex({
        name: 'idx_adopter_profiles_survey_completed',
        columnNames: ['is_survey_completed'],
      }),
    );

    await queryRunner.query(
      `CREATE INDEX "idx_adopter_profiles_compatibility_gin" ON "adopter_profiles" USING GIN ("compatibility_data")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_adopter_profiles_compatibility_gin"`,
    );

    await queryRunner.dropIndex(
      'adopter_profiles',
      'idx_adopter_profiles_survey_completed',
    );

    await queryRunner.dropColumn('adopter_profiles', 'compatibility_data');
    await queryRunner.dropColumn('adopter_profiles', 'is_survey_completed');
    await queryRunner.dropColumn('adopter_profiles', 'city');
  }
}
