import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapExceptionToStatus(exception);

    this.logger.warn(
      `[${request.method}] ${request.url} - DomainException: ${exception.name} - ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapExceptionToStatus(exception: DomainException): HttpStatus {
    const name = exception.name;

    if (name.includes('NotFound')) {
      return HttpStatus.NOT_FOUND;
    }
    if (
      name.includes('AlreadyExists') ||
      name.includes('Conflict') ||
      name.includes('AlreadyInUse')
    ) {
      return HttpStatus.CONFLICT;
    }
    if (
      name.includes('Unauthorized') ||
      name.includes('InvalidCredentials') ||
      name.includes('InvalidCurrentPassword')
    ) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (
      name.includes('Forbidden') ||
      name.includes('RoleMismatch') ||
      name.includes('EmailNotVerified')
    ) {
      return HttpStatus.FORBIDDEN;
    }
    if (name.includes('RateLimit') || name.includes('TooManyRequests')) {
      return HttpStatus.TOO_MANY_REQUESTS;
    }

    return HttpStatus.BAD_REQUEST;
  }
}
