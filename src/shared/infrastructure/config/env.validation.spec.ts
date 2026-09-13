import 'reflect-metadata';
import { validate } from './env.validation';

describe('EnvironmentVariables validation', () => {
  const baseConfig = {
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: '5432',
    DATABASE_USER: 'postgres',
    DATABASE_PASSWORD: 'postgres',
    DATABASE_NAME: 'postgres',
    JWT_SECRET: 'super-secret-jwt-token-with-at-least-32-characters-long',
    JWT_REFRESH_SECRET:
      'super-secret-jwt-refresh-token-with-at-least-32-characters-long',
  };

  it('should transform DATABASE_SSL="false" string to boolean false', () => {
    const result = validate({
      ...baseConfig,
      DATABASE_SSL: 'false',
    });

    expect(result.DATABASE_SSL).toBe(false);
  });

  it('should transform DATABASE_SSL="true" string to boolean true', () => {
    const result = validate({
      ...baseConfig,
      DATABASE_SSL: 'true',
    });

    expect(result.DATABASE_SSL).toBe(true);
  });

  it('should default DATABASE_SSL to false when not provided', () => {
    const result = validate({
      ...baseConfig,
    });

    expect(result.DATABASE_SSL).toBe(false);
  });

  it('should default APP_NAME to "AdoptaNet API" when not provided', () => {
    const result = validate({
      ...baseConfig,
    });

    expect(result.APP_NAME).toBe('AdoptaNet API');
  });

  it('should use custom APP_NAME when provided', () => {
    const result = validate({
      ...baseConfig,
      APP_NAME: 'Custom Rescues API',
    });

    expect(result.APP_NAME).toBe('Custom Rescues API');
  });
});
