import { UserRole } from '../../../users/domain/value-objects/user-role.enum';

export class UserRegisteredEvent {
  static readonly EVENT_NAME = 'user.registered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly fullName: string | null,
    public readonly role: UserRole,
  ) {}
}
