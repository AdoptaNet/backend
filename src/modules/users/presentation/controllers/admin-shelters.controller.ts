import {
  Body,
  Controller,
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
import { VerifyShelterDto } from '../../application/dtos/verify-shelter.dto';
import { VerifyShelterUseCase } from '../../application/use-cases/verify-shelter.use-case';
import { UserRole } from '../../domain/value-objects/user-role.enum';

@ApiTags('admin')
@Controller('admin/shelters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminSheltersController {
  constructor(private readonly verifyShelterUseCase: VerifyShelterUseCase) {}

  @Patch(':id/verify')
  @ApiOperation({
    summary: 'Acreditar o verificar un albergue como administrador',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de verificación actualizado exitosamente',
  })
  async verifyShelter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyShelterDto,
  ) {
    return this.verifyShelterUseCase.execute(id, dto);
  }
}
