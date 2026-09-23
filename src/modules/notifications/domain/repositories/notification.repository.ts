import { Notification } from '../entities/notification.entity';

export abstract class NotificationRepository {
  abstract create(data: Partial<Notification>): Notification;
  abstract save(notification: Notification): Promise<Notification>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract findByExternalId(externalId: string): Promise<Notification | null>;
  abstract findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Notification[]>;
  abstract findUnreadByUserId(userId: string): Promise<Notification[]>;
  abstract markAsRead(id: string): Promise<void>;
}
