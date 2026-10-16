import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface NewAdoptionRequestTemplateProps {
  petName: string;
  adopterName: string;
  applicationUrl: string;
}

export function NewAdoptionRequestTemplate({
  petName,
  adopterName,
  applicationUrl,
}: NewAdoptionRequestTemplateProps) {
  return (
    <BaseEmailLayout previewText={`Nueva postulación recibida para ${petName}`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="success">Nueva Solicitud de Adopción</EmailBadge>
      </Section>

      <Heading
        as="h1"
        style={{
          color: emailTheme.colors.textPrimary,
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '28px',
          margin: '0 0 16px 0',
          fontFamily: emailTheme.typography.fontFamily,
        }}
      >
        🐾 ¡Postulación recibida para {petName}!
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        El adoptante <strong>{adopterName}</strong> ha postulado formalmente a la adopción de <strong>{petName}</strong>, adjuntando su carta de motivación y congelando sus respuestas de compatibilidad (vivienda, familia y rutina).
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={applicationUrl} variant="primary">
          Examinar Expediente de Adopción
        </EmailButton>
      </Section>

      <Text
        style={{
          color: emailTheme.colors.textMuted,
          fontSize: '13px',
          lineHeight: '20px',
          margin: '0 0 16px 0',
        }}
      >
        Recuerda que puedes examinar las condiciones del adoptante y dictaminar la aprobación o rechazo constructivo desde tu panel de gestión.
      </Text>

      <Hr
        style={{
          borderColor: emailTheme.colors.border,
          margin: '24px 0 16px 0',
        }}
      />

      <Text
        style={{
          color: emailTheme.colors.textMuted,
          fontSize: '12px',
          lineHeight: '18px',
          margin: 0,
        }}
      >
        Acceso directo a la bandeja:
        <br />
        <a
          href={applicationUrl}
          style={{
            color: emailTheme.colors.primary,
            wordBreak: 'break-all',
          }}
        >
          {applicationUrl}
        </a>
      </Text>
    </BaseEmailLayout>
  );
}
