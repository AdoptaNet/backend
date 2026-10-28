import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { ChatRoomRepository } from '../../domain/repositories/chat-room.repository';

@Injectable()
export class ChatRoomTypeOrmRepository implements ChatRoomRepository {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly repo: Repository<ChatRoom>,
  ) {}

  async findById(id: string): Promise<ChatRoom | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        adoptionRequest: {
          pet: {
            photos: true,
          },
        },
        adopter: {
          adopterProfile: true,
        },
        shelter: {
          shelterProfile: true,
        },
      },
    });
  }

  async findByAdoptionRequestId(
    adoptionRequestId: string,
  ): Promise<ChatRoom | null> {
    return this.repo.findOne({
      where: { adoptionRequestId },
      relations: {
        adoptionRequest: {
          pet: {
            photos: true,
          },
        },
        adopter: {
          adopterProfile: true,
        },
        shelter: {
          shelterProfile: true,
        },
      },
    });
  }

  async findUserRooms(userId: string): Promise<ChatRoom[]> {
    return this.repo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.adoptionRequest', 'adoption')
      .leftJoinAndSelect('adoption.pet', 'pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('room.adopter', 'adopter')
      .leftJoinAndSelect('adopter.adopterProfile', 'adopterProfile')
      .leftJoinAndSelect('room.shelter', 'shelter')
      .leftJoinAndSelect('shelter.shelterProfile', 'shelterProfile')
      .where('room.adopter_id = :userId OR room.shelter_id = :userId', {
        userId,
      })
      .orderBy('room.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('room.created_at', 'DESC')
      .getMany();
  }

  async save(chatRoom: ChatRoom): Promise<ChatRoom> {
    return this.repo.save(chatRoom);
  }
}
