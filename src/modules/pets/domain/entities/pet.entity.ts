import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { PetAgeCategory } from '../value-objects/pet-age-category.enum';
import { PetFurLength } from '../value-objects/pet-fur-length.enum';
import { PetGender } from '../value-objects/pet-gender.enum';
import { PetHealthStatus } from '../value-objects/pet-health-status.enum';
import { PetSize } from '../value-objects/pet-size.enum';
import { PetSpecies } from '../value-objects/pet-species.enum';
import { PetStatus } from '../value-objects/pet-status.enum';
import { PetTrainingLevel } from '../value-objects/pet-training-level.enum';
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

  @Column({
    type: 'enum',
    enum: PetFurLength,
    enumName: 'pets_fur_length_enum',
    default: PetFurLength.SHORT,
  })
  furLength: PetFurLength;

  @Column({ type: 'boolean', default: false })
  isSterilized: boolean;

  @Column({ type: 'boolean', default: false })
  isVaccinated: boolean;

  @Column({
    type: 'enum',
    enum: PetHealthStatus,
    enumName: 'pets_health_status_enum',
    default: PetHealthStatus.HEALTHY,
  })
  healthStatus: PetHealthStatus;

  @Column({ type: 'text', nullable: true })
  healthNotes: string | null;

  @Column({ type: 'int' })
  energyLevel: number;

  @Column({ type: 'boolean', nullable: true })
  goodWithChildren: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  goodWithDogs: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  goodWithCats: boolean | null;

  @Column({ type: 'int' })
  vocalizationLevel: number;

  @Column({
    type: 'enum',
    enum: PetTrainingLevel,
    enumName: 'pets_training_level_enum',
    default: PetTrainingLevel.NONE,
  })
  trainingLevel: PetTrainingLevel;

  @Column({ type: 'int', nullable: true })
  timeAloneToleranceHours: number | null;

  @Column({ type: 'int', default: 0 })
  shelterStayMonths: number;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PetStatus,
    enumName: 'pets_status_enum',
    default: PetStatus.AVAILABLE,
  })
  status: PetStatus;

  @OneToMany(() => PetPhoto, (photo) => photo.pet, { cascade: true })
  photos: PetPhoto[];
}
