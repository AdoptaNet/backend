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
  private readonly rootFolder: string;
  private readonly cloudName: string;

  constructor(configService: ConfigService) {
    super();
    this.cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    this.rootFolder = CloudinaryMediaService.slugifyRootFolder(
      configService.get<string>('APP_NAME') ?? 'app',
    );
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private static slugifyRootFolder(appName: string): string {
    const slug = appName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'app';
  }

  buildUrl(publicId: string): string {
    if (!this.cloudName) {
      throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
    }
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }

  async uploadImage(
    file: Express.Multer.File,
    options?: UploadFileOptions,
  ): Promise<UploadResult> {
    const folder = options?.folder
      ? `${this.rootFolder}/${options.folder}`
      : this.rootFolder;

    return new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'webp',
          quality: 'auto:good',
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
