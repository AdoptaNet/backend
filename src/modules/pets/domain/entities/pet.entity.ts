import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { PetAgeCategory } from '../value-objects/pet-age-category.enum';
import { PetGender } from '../value-objects/pet-gender.enum';
import { PetSize } from '../value-objects/pet-size.enum';
import { PetSpecies } from '../value-objects/pet-species.enum';
import { PetStatus } from '../value-objects/pet-status.enum';
import { PetPhoto } from './pet-photo.entity';

@Entity()
export class Pet extends AuditableEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shelter_id' })
  shelter: User;

  @Column({ type: 'uuid' })
  shelterId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: PetSpecies, enumName: 'pets_species_enum' })
  species: PetSpecies;

  @Column({ type: 'varchar', length: 100, default: 'Mestizo' })
  breed: string;

  @Column({ type: 'enum', enum: PetGender, enumName: 'pets_gender_enum' })
  gender: PetGender;

  @Column({ type: 'int' })
  ageMonths: number;

  @Column({
    type: 'enum',
    enum: PetAgeCategory,
    enumName: 'pets_age_category_enum',
  })
  ageCategory: PetAgeCategory;

  @Column({ type: 'enum', enum: PetSize, enumName: 'pets_size_enum' })
  size: PetSize;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PetStatus,
    enumName: 'pets_status_enum',
    default: PetStatus.AVAILABLE,
  })
  status: PetStatus;

  @Column({ type: 'jsonb', default: {} })
  characteristics: Record<string, any>;

  @Column({
    type: 'text',
    nullable: true,
    name: 'visual_embedding',
    transformer: {
      to: (value: number[] | null) => (value ? `[${value.join(',')}]` : null),
      from: (value: string | number[] | null) => {
        if (!value) return null;
        if (Array.isArray(value)) return value;
        return typeof value === 'string'
          ? value.replace(/[\[\]]/g, '').split(',').map(Number)
          : null;
      },
    },
  })
  visualEmbedding: number[] | null;

  @OneToMany(() => PetPhoto, (photo) => photo.pet, { cascade: true })
  photos: PetPhoto[];
}
