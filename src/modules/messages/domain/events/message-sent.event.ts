import { Message } from '../entities/message.entity';

export class MessageSentEvent {
  static readonly EVENT_NAME = 'messages.sent';

  constructor(
    public readonly message: Message,
    public readonly chatRoomId: string,
    public readonly recipientId: string,
  ) {}
}
