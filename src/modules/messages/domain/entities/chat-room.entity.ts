import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AdoptionRequest } from '../../../adoptions/domain/entities/adoption-request.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { Message } from './message.entity';

@Entity({ name: 'chat_rooms' })
@Unique('uq_chat_room_adoption_request', ['adoptionRequestId'])
@Index('idx_chat_rooms_adopter', ['adopterId', 'lastMessageAt'])
@Index('idx_chat_rooms_shelter', ['shelterId', 'lastMessageAt'])
@Index('idx_chat_rooms_is_active', ['isActive'])
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'adoption_request_id' })
  adoptionRequestId: string;

  @ManyToOne(() => AdoptionRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adoption_request_id' })
  adoptionRequest: AdoptionRequest;

  @Column({ type: 'uuid', name: 'adopter_id' })
  adopterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adopter_id' })
  adopter: User;

  @Column({ type: 'uuid', name: 'shelter_id' })
  shelterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shelter_id' })
  shelter: User;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_message_at' })
  lastMessageAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.chatRoom)
  messages: Message[];
}
