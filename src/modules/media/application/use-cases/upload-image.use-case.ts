import { Injectable } from '@nestjs/common';
import { FileTooLargeException } from '../../domain/exceptions/file-too-large.exception';
import { InvalidFileTypeException } from '../../domain/exceptions/invalid-file-type.exception';
import { UploadMediaResponseDto } from '../dtos/upload-media-response.dto';
import { MediaService, UploadFileOptions } from '../interfaces/media.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadImageUseCase {
  constructor(private readonly mediaService: MediaService) {}

  async execute(
    file: Express.Multer.File,
    options?: UploadFileOptions,
  ): Promise<UploadMediaResponseDto> {
    if (!file) {
      throw new InvalidFileTypeException('undefined', ALLOWED_MIME_TYPES);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new InvalidFileTypeException(file.mimetype, ALLOWED_MIME_TYPES);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeException(file.size, MAX_FILE_SIZE_BYTES);
    }

    const result = await this.mediaService.uploadImage(file, options);

    return {
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      bytes: result.bytes,
    };
  }
}
