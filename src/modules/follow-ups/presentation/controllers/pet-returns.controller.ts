import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { User } from '../../../users/domain/entities/user.entity';
import { CoordinatePetReturnUseCase } from '../../application/use-cases/coordinate-pet-return.use-case';
import { CompletePetReturnUseCase } from '../../application/use-cases/complete-pet-return.use-case';
import { CoordinatePetReturnDto } from '../../application/dtos/coordinate-pet-return.dto';
import { CompletePetReturnDto } from '../../application/dtos/complete-pet-return.dto';

@ApiTags('PetReturns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pet-returns')
export class PetReturnsController {
  constructor(
    private readonly coordinatePetReturnUseCase: CoordinatePetReturnUseCase,
    private readonly completePetReturnUseCase: CompletePetReturnUseCase,
  ) {}

  @Patch(':id/coordinate')
  @ApiOperation({
    summary: 'Coordinar fecha y logística para entrega física del retorno (Albergue o Admin)',
  })
  @ApiResponse({ status: 200, description: 'Retorno en coordinación' })
  async coordinateReturn(
    @Param('id') id: string,
    @Body() dto: CoordinatePetReturnDto,
    @CurrentUser() user: User,
  ) {
    return await this.coordinatePetReturnUseCase.execute(
      id,
      dto,
      user.id,
      user.role,
    );
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Completar o dictaminar resolución de retorno de mascota (Albergue o Admin)',
  })
  @ApiResponse({ status: 200, description: 'Retorno formalizado o rechazado' })
  async completeReturn(
    @Param('id') id: string,
    @Body() dto: CompletePetReturnDto,
    @CurrentUser() user: User,
  ) {
    return await this.completePetReturnUseCase.execute(
      id,
      dto,
      user.id,
      user.role,
    );
  }
}
