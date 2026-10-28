import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdoptionsModule } from '../adoptions/adoptions.module';
import { AuthModule } from '../auth/auth.module';
import { ChatRoom } from './domain/entities/chat-room.entity';
import { Message } from './domain/entities/message.entity';
import { ChatRoomRepository } from './domain/repositories/chat-room.repository';
import { MessageRepository } from './domain/repositories/message.repository';
import { ChatRoomTypeOrmRepository } from './infrastructure/persistence/chat-room.typeorm-repository';
import { MessageTypeOrmRepository } from './infrastructure/persistence/message.typeorm-repository';
import { ProvisionChatRoomUseCase } from './application/use-cases/provision-chat-room.use-case';
import { GetMyChatRoomsUseCase } from './application/use-cases/get-my-chat-rooms.use-case';
import { GetChatRoomByIdUseCase } from './application/use-cases/get-chat-room-by-id.use-case';
import { GetOrCreateRoomByAdoptionUseCase } from './application/use-cases/get-or-create-room-by-adoption.use-case';
import { GetChatRoomMessagesUseCase } from './application/use-cases/get-chat-room-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { MarkMessagesAsReadUseCase } from './application/use-cases/mark-messages-as-read.use-case';
import { GetUnreadMessagesCountUseCase } from './application/use-cases/get-unread-messages-count.use-case';
import { AdoptionChatListener } from './application/listeners/adoption-chat.listener';
import { MessagesController } from './presentation/controllers/messages.controller';
import { MessagesGateway } from './presentation/gateways/messages.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, Message]),
    JwtModule.register({}),
    forwardRef(() => AuthModule),
    forwardRef(() => AdoptionsModule),
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: ChatRoomRepository,
      useClass: ChatRoomTypeOrmRepository,
    },
    {
      provide: MessageRepository,
      useClass: MessageTypeOrmRepository,
    },
    ProvisionChatRoomUseCase,
    GetMyChatRoomsUseCase,
    GetChatRoomByIdUseCase,
    GetOrCreateRoomByAdoptionUseCase,
    GetChatRoomMessagesUseCase,
    SendMessageUseCase,
    MarkMessagesAsReadUseCase,
    GetUnreadMessagesCountUseCase,
    AdoptionChatListener,
    MessagesGateway,
  ],
  exports: [
    ChatRoomRepository,
    MessageRepository,
    ProvisionChatRoomUseCase,
    GetMyChatRoomsUseCase,
    GetChatRoomMessagesUseCase,
    SendMessageUseCase,
  ],
})
export class MessagesModule {}
