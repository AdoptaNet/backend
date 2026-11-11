import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { PublicShelterResponseDto } from '../../application/dtos/public-shelter-response.dto';
import { ShelterProfileResponseDto } from '../../application/dtos/shelter-profile-response.dto';
import { VerifyShelterDto } from '../../application/dtos/verify-shelter.dto';
import { GetPublicShelterUseCase } from '../../application/use-cases/get-public-shelter.use-case';
import { RequestShelterVerificationUseCase } from '../../application/use-cases/request-shelter-verification.use-case';
import { VerifyShelterUseCase } from '../../application/use-cases/verify-shelter.use-case';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.enum';

@ApiTags('Shelters')
@Controller('shelters')
export class SheltersController {
  constructor(
    private readonly getPublicShelterUseCase: GetPublicShelterUseCase,
    private readonly verifyShelterUseCase: VerifyShelterUseCase,
    private readonly requestShelterVerificationUseCase: RequestShelterVerificationUseCase,
  ) {}

  @Post('me/request-verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Solicitar verificación oficial para el albergue autenticado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ShelterProfileResponseDto,
    description: 'Solicitud de verificación enviada exitosamente',
  })
  async requestVerification(
    @CurrentUser() user: User,
  ): Promise<ShelterProfileResponseDto> {
    return this.requestShelterVerificationUseCase.execute(user.id);
  }

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
