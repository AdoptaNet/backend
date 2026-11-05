import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetReturn } from '../../domain/entities/pet-return.entity';
import { PetReturnStatus } from '../../domain/value-objects/pet-return-status.enum';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { CoordinatePetReturnDto } from '../dtos/coordinate-pet-return.dto';

@Injectable()
export class CoordinatePetReturnUseCase {
  constructor(
    @InjectRepository(PetReturn)
    private readonly petReturnRepository: Repository<PetReturn>,
  ) {}

  async execute(
    returnId: string,
    dto: CoordinatePetReturnDto,
    shelterId: string,
    role: UserRole,
  ): Promise<PetReturn> {
    const petReturn = await this.petReturnRepository.findOne({
      where: { id: returnId },
      relations: { pet: true, adopter: true },
    });

    if (!petReturn) {
      throw new NotFoundException(`No se encontró la solicitud de retorno #${returnId}`);
    }

    if (role !== UserRole.ADMIN && petReturn.shelterId !== shelterId) {
      throw new ForbiddenException('Solo el albergue receptor puede coordinar este retorno');
    }

    if (petReturn.status === PetReturnStatus.RETURNED) {
      throw new BadRequestException('Este retorno ya fue completado previamente');
    }

    petReturn.status = PetReturnStatus.UNDER_COORDINATION;
    petReturn.scheduledReturnDate = new Date(dto.scheduledReturnDate);
    petReturn.coordinationNotes = dto.coordinationNotes?.trim() || null;

    return await this.petReturnRepository.save(petReturn);
  }
}
