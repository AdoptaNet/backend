import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { MAX_IMAGE_SIZE_BYTES } from '../../../media/application/constants/image-upload.constants';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import { DeleteAccountDto } from '../../application/dtos/delete-account.dto';
import { AdopterProfileResponseDto } from '../../application/dtos/adopter-profile-response.dto';
import { ShelterProfileResponseDto } from '../../application/dtos/shelter-profile-response.dto';
import { UpdateAdopterProfileDto } from '../../application/dtos/update-adopter-profile.dto';
import { UpdateShelterProfileDto } from '../../application/dtos/update-shelter-profile.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { SelectUserRoleDto } from '../../application/dtos/select-user-role.dto';
import { AuthResponseDto } from '../../../auth/application/dtos/auth-response.dto';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case';
import { DeleteAvatarUseCase } from '../../application/use-cases/delete-avatar.use-case';
import { GetMyProfileUseCase } from '../../application/use-cases/get-my-profile.use-case';
import { SelectUserRoleUseCase } from '../../application/use-cases/select-user-role.use-case';
import { UpdateAdopterProfileUseCase } from '../../application/use-cases/update-adopter-profile.use-case';
import { UpdateAvatarUseCase } from '../../application/use-cases/update-avatar.use-case';
import { UpdateShelterProfileUseCase } from '../../application/use-cases/update-shelter-profile.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { User } from '../../domain/entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateAvatarUseCase: UpdateAvatarUseCase,
    private readonly deleteAvatarUseCase: DeleteAvatarUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updateAdopterProfileUseCase: UpdateAdopterProfileUseCase,
    private readonly updateShelterProfileUseCase: UpdateShelterProfileUseCase,
    private readonly selectUserRoleUseCase: SelectUserRoleUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Obtener perfil completo del usuario autenticado (incluye perfil de adoptante o albergue)',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Perfil del usuario con información de perfil anidada',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.getMyProfileUseCase.execute(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar nombre completo del usuario',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(user.id, dto);
  }

  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @ApiOperation({
    summary:
      'Subir o actualizar foto de perfil (avatar) del usuario autenticado',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPG, PNG, WEBP, GIF, máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Avatar actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o excede el límite de tamaño',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return this.updateAvatarUseCase.execute(user.id, file);
  }

  @Delete('me/avatar')
  @ApiOperation({
    summary: 'Eliminar foto de perfil (avatar) del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Avatar eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async deleteAvatar(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.deleteAvatarUseCase.execute(user.id);
  }

  @Post('change-password')
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cambiar o definir contraseña del usuario autenticado (US-04 Escenario 3 y 4)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Contraseña actual incorrecta o datos inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.changePasswordUseCase.execute(user.id, dto);
  }

  @Put('me/adopter-profile')
  @ApiOperation({
    summary: 'Crear o actualizar perfil de adoptante (cuestionario ML)',
  })
  @ApiResponse({
    status: 200,
    type: AdopterProfileResponseDto,
    description: 'Perfil de adoptante guardado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Operación no permitida: el usuario no tiene rol de adoptante',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateAdopterProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateAdopterProfileDto,
  ): Promise<AdopterProfileResponseDto> {
    return this.updateAdopterProfileUseCase.execute(user.id, dto);
  }

  @Put('me/shelter-profile')
  @Patch('me/shelter-profile')
  @ApiOperation({
    summary:
      'Crear o actualizar perfil de albergue o rescatista (soporta PUT y PATCH)',
  })
  @ApiResponse({
    status: 200,
    type: ShelterProfileResponseDto,
    description: 'Perfil de albergue guardado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Operación no permitida: el usuario no tiene rol de albergue',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateShelterProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateShelterProfileDto,
  ): Promise<ShelterProfileResponseDto> {
    return this.updateShelterProfileUseCase.execute(user.id, dto);
  }

  @Post('select-role')
  @Patch('me/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Seleccionar o asignar rol inicial del usuario durante onboarding (US-02 Escenario 2)',
    description:
      'Permite al usuario elegir su rol inicial tras el registro con Google. Inmutable una vez asignado.',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Rol actualizado exitosamente y nuevos tokens JWT emitidos',
  })
  @ApiResponse({
    status: 400,
    description:
      'No es posible cambiar el rol una vez configurado o datos inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async selectRole(
    @CurrentUser() user: User,
    @Body() dto: SelectUserRoleDto,
  ): Promise<AuthResponseDto> {
    return this.selectUserRoleUseCase.execute(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Solicitud de baja definitiva de cuenta y anonimización de datos (US-05 - Ley N° 29733)',
    description:
      'Aplica soft-delete y anonimización irreversible a los datos personales del usuario. Bloquea si existen animales activos en adopción.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta dada de baja y datos personales anonimizados con éxito',
  })
  @ApiResponse({
    status: 400,
    description:
      'Baja bloqueada por solicitudes o animales a cargo, o contraseña incorrecta',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async deleteAccount(
    @CurrentUser() user: User,
    @Body() dto?: DeleteAccountDto,
  ): Promise<{ message: string }> {
    return this.deleteAccountUseCase.execute(user.id, dto);
  }
}
