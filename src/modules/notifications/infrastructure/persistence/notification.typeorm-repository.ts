import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class NotificationTypeOrmRepository extends NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly ormRepo: Repository<Notification>,
  ) {
    super();
  }

  create(data: Partial<Notification>): Notification {
    return this.ormRepo.create(data);
  }

  async save(notification: Notification): Promise<Notification> {
    return this.ormRepo.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.ormRepo.findOne({ where: { id } });
  }

  async findByExternalId(externalId: string): Promise<Notification | null> {
    return this.ormRepo.findOne({ where: { externalId } });
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Notification[]> {
    return this.ormRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.ormRepo.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.ormRepo.update({ id }, { isRead: true, readAt: new Date() });
  }
}
