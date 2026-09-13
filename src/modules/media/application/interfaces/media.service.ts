export interface UploadFileOptions {
  folder?: string;
  transformation?: Record<string, unknown>;
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export abstract class MediaService {
  abstract uploadImage(
    file: Express.Multer.File,
    options?: UploadFileOptions,
  ): Promise<UploadResult>;

  abstract deleteImage(publicId: string): Promise<boolean>;
}
