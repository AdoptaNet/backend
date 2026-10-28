import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/domain/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

@Entity({ name: 'messages' })
@Index('idx_messages_chat_room_created', ['chatRoomId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'chat_room_id' })
  chatRoomId: string;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'attachment_url',
  })
  attachmentUrl: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'attachment_type',
  })
  attachmentType: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
