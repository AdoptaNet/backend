import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { Pet } from './pet.entity';

@Entity()
export class PetPhoto extends AuditableEntity {
  @ManyToOne(() => Pet, (pet) => pet.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ type: 'uuid' })
  petId: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  publicId: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'order', type: 'int', default: 0 })
  order: number;
}
