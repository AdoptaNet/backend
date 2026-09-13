import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  // Database
  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @IsOptional()
  DATABASE_PORT: number = 5432;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL: boolean = false;

  // Supabase Auth
  @IsString()
  @IsOptional()
  SUPABASE_URL?: string;

  @IsString()
  @IsOptional()
  SUPABASE_ANON_KEY?: string;

  @IsString()
  @IsOptional()
  SUPABASE_JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  SUPABASE_AUTH_HOOK_SECRET?: string;

  // Cloudinary
  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  // ML Service
  @IsString()
  @IsOptional()
  ML_SERVICE_URL?: string = 'http://localhost:8000';

  @IsNumber()
  @IsOptional()
  ML_SERVICE_TIMEOUT?: number = 10000;

  // Resend Email
  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM?: string = 'onboarding@resend.dev';
}

export function validate(config: Record<string, unknown>) {
  const transformedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(transformedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Config validation error: ${errorMessages}`);
  }

  return transformedConfig;
}
