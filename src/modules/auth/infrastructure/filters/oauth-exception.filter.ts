import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    this.logger.warn(
      `OAuth authentication failed or cancelled: ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
    );

    const redirectUrl = new URL('/login', frontendUrl);
    redirectUrl.searchParams.set('error', 'oauth_cancelled');

    return response.redirect(redirectUrl.toString());
  }
}
