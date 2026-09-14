import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import { MediaUploadFailedException } from '../../domain/exceptions/media-upload-failed.exception';
import { CloudinaryMediaService } from './cloudinary-media.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryMediaService', () => {
  let service: CloudinaryMediaService;
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'CLOUDINARY_CLOUD_NAME') return 'demo';
      if (key === 'CLOUDINARY_API_KEY') return '123456';
      if (key === 'CLOUDINARY_API_SECRET') return 'secret';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryMediaService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CloudinaryMediaService>(CloudinaryMediaService);
  });

  it('should upload image stream successfully', async () => {
    const file = {
      buffer: Buffer.from('test-image'),
    } as Express.Multer.File;

    const mockUploadResult = {
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
      public_id: 'adoptanet/avatars/avatar_123',
      format: 'jpg',
      bytes: 2048,
    };

    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (
        options: unknown,
        callback: (error: unknown, result: unknown) => void,
      ) => {
        return {
          end: () => {
            callback(null, mockUploadResult);
          },
        };
      },
    );

    const result = await service.uploadImage(file, {
      folder: 'adoptanet/avatars',
    });

    expect(result.url).toBe(mockUploadResult.secure_url);
    expect(result.publicId).toBe(mockUploadResult.public_id);
    expect(result.format).toBe('jpg');
    expect(result.bytes).toBe(2048);
  });

  it('should throw MediaUploadFailedException when upload stream returns error', async () => {
    const file = {
      buffer: Buffer.from('test-image'),
    } as Express.Multer.File;

    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (
        options: unknown,
        callback: (error: unknown, result: unknown) => void,
      ) => {
        return {
          end: () => {
            callback(new Error('Cloudinary error'), null);
          },
        };
      },
    );

    await expect(service.uploadImage(file)).rejects.toThrow(
      MediaUploadFailedException,
    );
  });

  it('should return true when deleteImage succeeds', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
      result: 'ok',
    });

    const result = await service.deleteImage('adoptanet/pic');
    expect(result).toBe(true);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('adoptanet/pic');
  });

  it('should return false when deleteImage fails', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
      new Error('Delete error'),
    );

    const result = await service.deleteImage('adoptanet/pic');
    expect(result).toBe(false);
  });
});
