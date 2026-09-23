import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../../application/interfaces/media.service';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { MediaController } from './media.controller';

describe('MediaController', () => {
  let controller: MediaController;
  const mockUploadImageUseCase = {
    execute: jest.fn(),
  };
  const mockMediaService = {
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: UploadImageUseCase, useValue: mockUploadImageUseCase },
        { provide: MediaService, useValue: mockMediaService },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should call UploadImageUseCase on upload', async () => {
    const file = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    const expectedResponse = {
      url: 'https://res.cloudinary.com/test.jpg',
      publicId: 'test-id',
      format: 'jpg',
      bytes: 1024,
    };
    mockUploadImageUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.upload(file);

    expect(result).toBe(expectedResponse);
    expect(mockUploadImageUseCase.execute).toHaveBeenCalledWith(file, {
      folder: 'general',
    });
  });

  it('should throw BadRequestException if publicId is missing on delete', async () => {
    await expect(controller.delete('')).rejects.toThrow(BadRequestException);
  });

  it('should call mediaService.deleteImage on delete', async () => {
    mockMediaService.deleteImage.mockResolvedValue(true);

    const result = await controller.delete('firu-api/pets/abc123xyz');

    expect(result).toEqual({ success: true });
    expect(mockMediaService.deleteImage).toHaveBeenCalledWith(
      'firu-api/pets/abc123xyz',
    );
  });
});
