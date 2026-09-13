import { Test, TestingModule } from '@nestjs/testing';
import { FileTooLargeException } from '../../domain/exceptions/file-too-large.exception';
import { InvalidFileTypeException } from '../../domain/exceptions/invalid-file-type.exception';
import { MediaService } from '../interfaces/media.service';
import { UploadImageUseCase } from './upload-image.use-case';

describe('UploadImageUseCase', () => {
  let useCase: UploadImageUseCase;
  const mockMediaService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadImageUseCase,
        { provide: MediaService, useValue: mockMediaService },
      ],
    }).compile();

    useCase = module.get<UploadImageUseCase>(UploadImageUseCase);
  });

  it('should throw InvalidFileTypeException if file is undefined', async () => {
    await expect(
      useCase.execute(undefined as unknown as Express.Multer.File),
    ).rejects.toThrow(InvalidFileTypeException);
  });

  it('should throw InvalidFileTypeException for unsupported MIME type', async () => {
    const file = {
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    await expect(useCase.execute(file)).rejects.toThrow(
      InvalidFileTypeException,
    );
  });

  it('should throw FileTooLargeException if file exceeds 5MB', async () => {
    const file = {
      mimetype: 'image/jpeg',
      size: 6 * 1024 * 1024, // 6MB
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    await expect(useCase.execute(file)).rejects.toThrow(FileTooLargeException);
  });

  it('should upload valid image and return dto', async () => {
    const file = {
      mimetype: 'image/png',
      size: 500 * 1024,
      buffer: Buffer.from('test-image'),
    } as Express.Multer.File;

    mockMediaService.uploadImage.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/pic.png',
      publicId: 'adoptanet/general/pic',
      format: 'png',
      bytes: 500 * 1024,
    });

    const result = await useCase.execute(file, { folder: 'adoptanet/test' });

    expect(result.url).toBe(
      'https://res.cloudinary.com/demo/image/upload/v1/pic.png',
    );
    expect(result.publicId).toBe('adoptanet/general/pic');
    expect(result.format).toBe('png');
    expect(mockMediaService.uploadImage).toHaveBeenCalledWith(file, {
      folder: 'adoptanet/test',
    });
  });
});
