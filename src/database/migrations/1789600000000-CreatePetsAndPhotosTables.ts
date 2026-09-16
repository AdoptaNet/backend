import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePetsAndPhotosTables1789600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tipos enum
    await queryRunner.query(
      `CREATE TYPE "pets_species_enum" AS ENUM('dog', 'cat')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_size_enum" AS ENUM('small', 'medium', 'large')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_age_category_enum" AS ENUM('puppy', 'young', 'adult', 'senior')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_fur_length_enum" AS ENUM('short', 'long', 'hairless')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_health_status_enum" AS ENUM('healthy', 'chronic_condition', 'disability')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_training_level_enum" AS ENUM('none', 'basic', 'litterbox', 'advanced')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pets_status_enum" AS ENUM('draft', 'available', 'in_process', 'adopted', 'hidden')`,
    );

    // 2. Crear tabla pets
    await queryRunner.createTable(
      new Table({
        name: 'pets',
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
            name: 'shelter_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'species',
            type: 'pets_species_enum',
            isNullable: false,
          },
          {
            name: 'breed',
            type: 'varchar',
            length: '100',
            default: "'Mestizo'",
            isNullable: false,
          },
          {
            name: 'gender',
            type: 'pets_gender_enum',
            isNullable: false,
          },
          {
            name: 'age_months',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'age_category',
            type: 'pets_age_category_enum',
            isNullable: false,
          },
          {
            name: 'size',
            type: 'pets_size_enum',
            isNullable: false,
          },
          {
            name: 'fur_length',
            type: 'pets_fur_length_enum',
            default: "'short'",
            isNullable: false,
          },
          {
            name: 'is_sterilized',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_vaccinated',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'health_status',
            type: 'pets_health_status_enum',
            default: "'healthy'",
            isNullable: false,
          },
          {
            name: 'health_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'energy_level',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'good_with_children',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'good_with_dogs',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'good_with_cats',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'vocalization_level',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'training_level',
            type: 'pets_training_level_enum',
            default: "'none'",
            isNullable: false,
          },
          {
            name: 'time_alone_tolerance_hours',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'shelter_stay_months',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'pets_status_enum',
            default: "'available'",
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
            columnNames: ['shelter_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_pets_shelter_id',
            columnNames: ['shelter_id'],
          }),
          new TableIndex({
            name: 'idx_pets_status',
            columnNames: ['status'],
          }),
          new TableIndex({
            name: 'idx_pets_species_status',
            columnNames: ['species', 'status'],
          }),
        ],
      }),
      true,
    );

    // 3. Crear tabla pet_photos
    await queryRunner.createTable(
      new Table({
        name: 'pet_photos',
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
            name: 'pet_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'public_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
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
            columnNames: ['pet_id'],
            referencedTableName: 'pets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_pet_photos_pet_id',
            columnNames: ['pet_id'],
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pet_photos', true);
    await queryRunner.dropTable('pets', true);

    const enumTypes = [
      'pets_status_enum',
      'pets_training_level_enum',
      'pets_health_status_enum',
      'pets_fur_length_enum',
      'pets_age_category_enum',
      'pets_size_enum',
      'pets_gender_enum',
      'pets_species_enum',
    ];

    for (const enumType of enumTypes) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}"`);
    }
  }
}
