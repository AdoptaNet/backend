import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { MAX_IMAGE_SIZE_BYTES } from '../../application/constants/image-upload.constants';
import { UploadMediaResponseDto } from '../../application/dtos/upload-media-response.dto';
import { MediaService } from '../../application/interfaces/media.service';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @ApiOperation({
    summary: 'Subir una imagen a Cloudinary (avatares, mascotas, etc.)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPG, PNG, WEBP, GIF, máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    type: UploadMediaResponseDto,
    description: 'Imagen subida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o excede el límite de tamaño',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadMediaResponseDto> {
    return this.uploadImageUseCase.execute(file, {
      folder: 'general',
    });
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una imagen de Cloudinary por su publicId',
  })
  @ApiQuery({
    name: 'publicId',
    type: String,
    required: true,
    description: 'Identificador público en Cloudinary de la imagen a eliminar',
    example: 'firu-api/pets/abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la eliminación en Cloudinary',
  })
  async delete(
    @Query('publicId') publicId: string,
  ): Promise<{ success: boolean }> {
    if (!publicId?.trim()) {
      throw new BadRequestException('El parámetro publicId es obligatorio');
    }
    const success = await this.mediaService.deleteImage(publicId.trim());
    return { success };
  }
}
