import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface SampleEmailProps {
  title?: string;
  name?: string;
  message?: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Plantilla de muestra / base que demuestra el uso de BaseEmailLayout,
 * EmailButton y EmailBadge con la estética de Adoptanet.
 */
export function SampleEmailTemplate({
  title = 'Actualización en Adoptanet',
  name = 'Amigo de Adoptanet',
  message = 'Te informamos que hay novedades importantes en tu cuenta o proceso de adopción.',
  actionUrl = 'http://localhost:3001',
  actionText = 'Ver en la plataforma',
}: SampleEmailProps) {
  return (
    <BaseEmailLayout previewText={title}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="success">Notificación</EmailBadge>
      </Section>

      <Heading
        as="h1"
        style={{
          color: emailTheme.colors.textPrimary,
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '28px',
          margin: '0 0 16px 0',
        }}
      >
        {title}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        ¡Hola, <strong>{name}</strong>!
      </Text>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 24px 0',
        }}
      >
        {message}
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          {actionText}
        </EmailButton>
      </Section>

      <Hr
        style={{
          borderColor: emailTheme.colors.border,
          margin: '24px 0 16px 0',
        }}
      />

      <Text
        style={{
          color: emailTheme.colors.textMuted,
          fontSize: '13px',
          lineHeight: '20px',
          margin: '0',
        }}
      >
        Si tienes alguna pregunta, no dudes en responder a este correo o ponerte en
        contacto con nuestro equipo de soporte.
      </Text>
    </BaseEmailLayout>
  );
}
