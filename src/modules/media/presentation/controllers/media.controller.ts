import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { UploadMediaResponseDto } from '../../application/dtos/upload-media-response.dto';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly uploadImageUseCase: UploadImageUseCase) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
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
      folder: 'adoptanet/general',
    });
  }
}
