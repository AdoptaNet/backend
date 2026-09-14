import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { NotificationChannel } from '../value-objects/notification-channel.enum';
import { NotificationStatus } from '../value-objects/notification-status.enum';
import { NotificationType } from '../value-objects/notification-type.enum';

@Entity()
export class Notification extends AuditableEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Column({ type: 'varchar', length: 255 })
  recipientEmail: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.CUSTOM,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.EMAIL,
  })
  channel: NotificationChannel;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;
}
