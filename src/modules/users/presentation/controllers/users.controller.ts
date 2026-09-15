import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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
import { AdopterProfileResponseDto } from '../../application/dtos/adopter-profile-response.dto';
import { ShelterProfileResponseDto } from '../../application/dtos/shelter-profile-response.dto';
import { UpdateAdopterProfileDto } from '../../application/dtos/update-adopter-profile.dto';
import { UpdateShelterProfileDto } from '../../application/dtos/update-shelter-profile.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { DeleteAvatarUseCase } from '../../application/use-cases/delete-avatar.use-case';
import { GetMyProfileUseCase } from '../../application/use-cases/get-my-profile.use-case';
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

  @Patch('me/password')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o cuenta sin contraseña local',
  })
  @ApiResponse({
    status: 401,
    description: 'Contraseña actual incorrecta o token no válido',
  })
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
  @ApiOperation({
    summary: 'Crear o actualizar perfil de albergue o rescatista',
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
}
