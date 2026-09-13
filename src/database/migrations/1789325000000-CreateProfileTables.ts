import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateProfileTables1789325000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tipos enum para AdopterProfile
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_zone_type_enum" AS ENUM('urban_traffic', 'urban_quiet', 'periurban', 'rural')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_housing_type_enum" AS ENUM('apartment', 'house_no_yard', 'house_with_yard', 'quinta')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_outdoor_space_enum" AS ENUM('none', 'balcony', 'small_yard', 'large_garden')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_tenure_type_enum" AS ENUM('owned', 'rented_with_permission', 'rented_uncertain', 'rented_no_permission')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_household_size_enum" AS ENUM('alone', 'two_three', 'four_five', 'six_plus')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_children_age_range_enum" AS ENUM('none', 'under_5', 'five_to_12', 'teenagers')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_allergy_type_enum" AS ENUM('none', 'cats', 'dogs', 'uncertain')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_current_pets_enum" AS ENUM('none', 'dogs', 'cats', 'both')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_current_pets_sociability_enum" AS ENUM('not_applicable', 'very_sociable', 'selective', 'not_sociable')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_hours_alone_enum" AS ENUM('less_than_2', 'two_to_4', 'five_to_8', 'more_than_8')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_work_schedule_enum" AS ENUM('from_home', 'hybrid', 'out_all_day', 'rotating')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_activity_level_enum" AS ENUM('sedentary', 'low', 'moderate', 'active', 'very_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_walk_time_enum" AS ENUM('less_than_15', 'fifteen_to_30', 'thirty_to_60', 'more_than_60')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_monthly_budget_enum" AS ENUM('under_50', 'fifty_to_100', 'hundred_to_200', 'two_hundred_to_300', 'over_300')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_vet_budget_enum" AS ENUM('basic', 'emergencies', 'chronic_treatment')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_experience_level_enum" AS ENUM('none', 'little', 'moderate', 'experienced')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_preferred_species_enum" AS ENUM('dog', 'cat', 'any')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_preferred_size_enum" AS ENUM('small', 'medium', 'large', 'any')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_preferred_age_enum" AS ENUM('puppy', 'young', 'adult', 'senior', 'any')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_preferred_sex_enum" AS ENUM('male', 'female', 'any')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_preferred_temperament_enum" AS ENUM('calm', 'balanced', 'active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_fur_preference_enum" AS ENUM('short', 'long', 'hairless', 'any')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_noise_tolerance_enum" AS ENUM('low', 'moderate', 'high')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_special_needs_acceptance_enum" AS ENUM('no', 'chronic', 'disability', 'any')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_adoption_motivation_enum" AS ENUM('companionship', 'rescue', 'family', 'therapy', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_follow_up_acceptance_enum" AS ENUM('fully_accept', 'partially', 'prefer_not')`,
    );
    await queryRunner.query(
      `CREATE TYPE "adopter_profiles_adopter_age_range_enum" AS ENUM('18_to_25', '26_to_35', '36_to_45', '46_to_55', '56_plus')`,
    );

    // 2. Crear tabla adopter_profiles
    await queryRunner.createTable(
      new Table({
        name: 'adopter_profiles',
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
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'department',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'zone_type',
            type: 'adopter_profiles_zone_type_enum',
            isNullable: true,
          },
          {
            name: 'housing_type',
            type: 'adopter_profiles_housing_type_enum',
            isNullable: true,
          },
          {
            name: 'outdoor_space',
            type: 'adopter_profiles_outdoor_space_enum',
            isNullable: true,
          },
          {
            name: 'is_fenced',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'tenure_type',
            type: 'adopter_profiles_tenure_type_enum',
            isNullable: true,
          },
          {
            name: 'household_size',
            type: 'adopter_profiles_household_size_enum',
            isNullable: true,
          },
          {
            name: 'children_age_range',
            type: 'adopter_profiles_children_age_range_enum',
            isNullable: true,
          },
          {
            name: 'has_elderly',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'allergy_type',
            type: 'adopter_profiles_allergy_type_enum',
            isNullable: true,
          },
          {
            name: 'current_pets',
            type: 'adopter_profiles_current_pets_enum',
            isNullable: true,
          },
          {
            name: 'current_pets_sociability',
            type: 'adopter_profiles_current_pets_sociability_enum',
            isNullable: true,
          },
          {
            name: 'hours_alone',
            type: 'adopter_profiles_hours_alone_enum',
            isNullable: true,
          },
          {
            name: 'work_schedule',
            type: 'adopter_profiles_work_schedule_enum',
            isNullable: true,
          },
          {
            name: 'activity_level',
            type: 'adopter_profiles_activity_level_enum',
            isNullable: true,
          },
          {
            name: 'walk_time',
            type: 'adopter_profiles_walk_time_enum',
            isNullable: true,
          },
          {
            name: 'monthly_budget',
            type: 'adopter_profiles_monthly_budget_enum',
            isNullable: true,
          },
          {
            name: 'vet_budget',
            type: 'adopter_profiles_vet_budget_enum',
            isNullable: true,
          },
          {
            name: 'experience_level',
            type: 'adopter_profiles_experience_level_enum',
            isNullable: true,
          },
          {
            name: 'preferred_species',
            type: 'adopter_profiles_preferred_species_enum',
            isNullable: true,
          },
          {
            name: 'preferred_size',
            type: 'adopter_profiles_preferred_size_enum',
            isNullable: true,
          },
          {
            name: 'preferred_age',
            type: 'adopter_profiles_preferred_age_enum',
            isNullable: true,
          },
          {
            name: 'preferred_sex',
            type: 'adopter_profiles_preferred_sex_enum',
            isNullable: true,
          },
          {
            name: 'preferred_temperament',
            type: 'adopter_profiles_preferred_temperament_enum',
            isNullable: true,
          },
          {
            name: 'fur_preference',
            type: 'adopter_profiles_fur_preference_enum',
            isNullable: true,
          },
          {
            name: 'noise_tolerance',
            type: 'adopter_profiles_noise_tolerance_enum',
            isNullable: true,
          },
          {
            name: 'special_needs_acceptance',
            type: 'adopter_profiles_special_needs_acceptance_enum',
            isNullable: true,
          },
          {
            name: 'sterilization_commitment',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'adoption_motivation',
            type: 'adopter_profiles_adoption_motivation_enum',
            isNullable: true,
          },
          {
            name: 'follow_up_acceptance',
            type: 'adopter_profiles_follow_up_acceptance_enum',
            isNullable: true,
          },
          {
            name: 'adopter_age_range',
            type: 'adopter_profiles_adopter_age_range_enum',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
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
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // 3. Crear tabla shelter_profiles
    await queryRunner.createTable(
      new Table({
        name: 'shelter_profiles',
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
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'organization_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'department',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rescue_capacity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'facebook_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'instagram_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
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
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shelter_profiles', true);
    await queryRunner.dropTable('adopter_profiles', true);

    const enumTypes = [
      'adopter_profiles_zone_type_enum',
      'adopter_profiles_housing_type_enum',
      'adopter_profiles_outdoor_space_enum',
      'adopter_profiles_tenure_type_enum',
      'adopter_profiles_household_size_enum',
      'adopter_profiles_children_age_range_enum',
      'adopter_profiles_allergy_type_enum',
      'adopter_profiles_current_pets_enum',
      'adopter_profiles_current_pets_sociability_enum',
      'adopter_profiles_hours_alone_enum',
      'adopter_profiles_work_schedule_enum',
      'adopter_profiles_activity_level_enum',
      'adopter_profiles_walk_time_enum',
      'adopter_profiles_monthly_budget_enum',
      'adopter_profiles_vet_budget_enum',
      'adopter_profiles_experience_level_enum',
      'adopter_profiles_preferred_species_enum',
      'adopter_profiles_preferred_size_enum',
      'adopter_profiles_preferred_age_enum',
      'adopter_profiles_preferred_sex_enum',
      'adopter_profiles_preferred_temperament_enum',
      'adopter_profiles_fur_preference_enum',
      'adopter_profiles_noise_tolerance_enum',
      'adopter_profiles_special_needs_acceptance_enum',
      'adopter_profiles_adoption_motivation_enum',
      'adopter_profiles_follow_up_acceptance_enum',
      'adopter_profiles_adopter_age_range_enum',
    ];

    for (const enumType of enumTypes) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}"`);
    }
  }
}
