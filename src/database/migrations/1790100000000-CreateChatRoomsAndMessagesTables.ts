import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatRoomsAndMessagesTables1790100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabla chat_rooms
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_rooms" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "adoption_request_id" UUID NOT NULL REFERENCES "adoption_requests"("id") ON DELETE CASCADE,
        "adopter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shelter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_message_at" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Restricción de unicidad: 1 sala por cada postulación
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_chat_room_adoption_request"
      ON "chat_rooms" ("adoption_request_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_rooms_adopter"
      ON "chat_rooms" ("adopter_id", "last_message_at" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_rooms_shelter"
      ON "chat_rooms" ("shelter_id", "last_message_at" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_rooms_is_active"
      ON "chat_rooms" ("is_active");
    `);

    // 2. Tabla messages
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "chat_room_id" UUID NOT NULL REFERENCES "chat_rooms"("id") ON DELETE CASCADE,
        "sender_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "attachment_url" VARCHAR(500) NULL,
        "attachment_type" VARCHAR(50) NULL,
        "read_at" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_messages_chat_room_created"
      ON "messages" ("chat_room_id", "created_at" ASC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_messages_unread"
      ON "messages" ("chat_room_id", "sender_id", "read_at")
      WHERE "read_at" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "messages";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_rooms";`);
  }
}
