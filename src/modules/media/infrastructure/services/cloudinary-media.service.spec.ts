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
      if (key === 'APP_NAME') return 'Firu API';
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
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
      public_id: 'firu-api/avatars/avatar_123',
      format: 'webp',
      bytes: 2048,
    };

    let capturedOptions: Record<string, unknown> = {};
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (
        options: unknown,
        callback: (error: unknown, result: unknown) => void,
      ) => {
        capturedOptions = options as Record<string, unknown>;
        return {
          end: () => {
            callback(null, mockUploadResult);
          },
        };
      },
    );

    const result = await service.uploadImage(file, {
      folder: 'avatars',
    });

    expect(capturedOptions).toMatchObject({
      folder: 'firu-api/avatars',
      format: 'webp',
      quality: 'auto:good',
    });
    expect(result.url).toBe(mockUploadResult.secure_url);
    expect(result.publicId).toBe(mockUploadResult.public_id);
    expect(result.format).toBe('webp');
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

  it('should build url from publicId', () => {
    expect(service.buildUrl('firu-api/avatars/pic')).toBe(
      'https://res.cloudinary.com/demo/image/upload/firu-api/avatars/pic',
    );
  });

  it('should return true when deleteImage succeeds', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
      result: 'ok',
    });

    const result = await service.deleteImage('firu-api/pic');
    expect(result).toBe(true);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('firu-api/pic');
  });

  it('should return false when deleteImage fails', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
      new Error('Delete error'),
    );

    const result = await service.deleteImage('firu-api/pic');
    expect(result).toBe(false);
  });
});
