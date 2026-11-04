import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return healthy status object with timestamp and uptime', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('adoptanet-api');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('getRoot', () => {
    it('should return service info with api docs path', () => {
      const result = appController.getRoot();
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('AdoptaNet API');
      expect(result.docs).toBe('/api/docs');
    });
  });
});
