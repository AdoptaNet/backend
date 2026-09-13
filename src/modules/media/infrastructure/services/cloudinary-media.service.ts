import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import {
  MediaService,
  UploadFileOptions,
  UploadResult,
} from '../../application/interfaces/media.service';
import { MediaUploadFailedException } from '../../domain/exceptions/media-upload-failed.exception';

@Injectable()
export class CloudinaryMediaService extends MediaService {
  private readonly logger = new Logger(CloudinaryMediaService.name);

  constructor(configService: ConfigService) {
    super();
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    options?: UploadFileOptions,
  ): Promise<UploadResult> {
    return new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder ?? 'adoptanet',
          resource_type: 'image',
          transformation: options?.transformation,
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error('Error uploading image to Cloudinary', error);
            return reject(
              new MediaUploadFailedException(error?.message ?? 'Unknown error'),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response: unknown = await cloudinary.uploader.destroy(publicId);
      const result = response as { result?: string } | undefined;
      return result?.result === 'ok';
    } catch (error) {
      this.logger.error(
        `Error deleting image "${publicId}" from Cloudinary`,
        error,
      );
      return false;
    }
  }
}
