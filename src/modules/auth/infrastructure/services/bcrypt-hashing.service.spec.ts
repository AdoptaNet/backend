import { BcryptHashingService } from './bcrypt-hashing.service';

describe('BcryptHashingService', () => {
  let service: BcryptHashingService;

  beforeEach(() => {
    service = new BcryptHashingService();
  });

  it('should hash a password and verify it correctly', async () => {
    const password = 'Password123!';
    const hash = await service.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isMatch = await service.compare(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await service.compare('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });
});
