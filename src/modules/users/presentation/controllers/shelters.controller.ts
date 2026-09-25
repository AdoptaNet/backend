import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { PublicShelterResponseDto } from '../../application/dtos/public-shelter-response.dto';
import { VerifyShelterDto } from '../../application/dtos/verify-shelter.dto';
import { GetPublicShelterUseCase } from '../../application/use-cases/get-public-shelter.use-case';
import { VerifyShelterUseCase } from '../../application/use-cases/verify-shelter.use-case';
import { UserRole } from '../../domain/value-objects/user-role.enum';

@ApiTags('shelters')
@Controller('shelters')
export class SheltersController {
  constructor(
    private readonly getPublicShelterUseCase: GetPublicShelterUseCase,
    private readonly verifyShelterUseCase: VerifyShelterUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener la ficha pública de un albergue y sus mascotas disponibles',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PublicShelterResponseDto,
    description: 'Ficha pública del albergue obtenida exitosamente',
  })
  async getPublicProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicShelterResponseDto> {
    return this.getPublicShelterUseCase.execute(id);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar o desverificar un albergue (Solo Administrador)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de verificación del albergue actualizado exitosamente',
  })
  async verifyShelter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyShelterDto,
  ) {
    return this.verifyShelterUseCase.execute(id, dto);
  }
}
