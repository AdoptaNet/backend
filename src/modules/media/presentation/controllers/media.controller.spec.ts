import { Test, TestingModule } from '@nestjs/testing';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { MediaController } from './media.controller';

describe('MediaController', () => {
  let controller: MediaController;
  const mockUploadImageUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: UploadImageUseCase, useValue: mockUploadImageUseCase },
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
      folder: 'adoptanet/general',
    });
  });
});
