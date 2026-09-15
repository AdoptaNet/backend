import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HandleResendWebhookUseCase } from '../../application/use-cases/handle-resend-webhook.use-case';

@ApiTags('Notifications')
@Controller('notifications/webhooks')
export class ResendWebhookController {
  constructor(
    private readonly handleResendWebhookUseCase: HandleResendWebhookUseCase,
  ) {}

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook receptor de eventos de entrega y rebote de Resend',
    description:
      'Endpoint público invocado por Resend para notificar eventos como email.delivered, email.bounced y email.complained.',
  })
  @ApiResponse({ status: 200, description: 'Evento procesado correctamente' })
  @ApiResponse({ status: 401, description: 'Firma de webhook inválida' })
  async handleWebhook(
    @Body() payload: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.handleResendWebhookUseCase.execute(payload, headers);
  }
}
