import { Module } from '@nestjs/common';
import { MediaService } from './application/interfaces/media.service';
import { UploadImageUseCase } from './application/use-cases/upload-image.use-case';
import { CloudinaryMediaService } from './infrastructure/services/cloudinary-media.service';
import { MediaController } from './presentation/controllers/media.controller';

@Module({
  controllers: [MediaController],
  providers: [
    UploadImageUseCase,
    {
      provide: MediaService,
      useClass: CloudinaryMediaService,
    },
  ],
  exports: [MediaService, UploadImageUseCase],
})
export class MediaModule {}
