import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface PasswordResetTemplateProps {
  fullName?: string | null;
  resetUrl: string;
}

export function PasswordResetTemplate({
  fullName,
  resetUrl,
}: PasswordResetTemplateProps) {
  const displayName = fullName?.trim() || 'hola';

  return (
    <BaseEmailLayout previewText="Restablece tu contraseña en Adoptanet">
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">Seguridad y Acceso</EmailBadge>
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
        Restablecimiento de Contraseña
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Hola, {displayName}. Hemos recibido una solicitud para restablecer la
        contraseña de tu cuenta en Adoptanet. Para crear una nueva contraseña, haz
        clic en el botón a continuación:
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={resetUrl} variant="primary">
          Restablecer Contraseña
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
        Por motivos de seguridad, este enlace tiene una vigencia estricta de{' '}
        <strong>30 minutos</strong>. Si tú no solicitaste este cambio, no te
        preocupes: tu contraseña actual permanece segura y puedes ignorar este
        correo.
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
        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        <br />
        <a
          href={resetUrl}
          style={{
            color: emailTheme.colors.primary,
            wordBreak: 'break-all',
          }}
        >
          {resetUrl}
        </a>
      </Text>
    </BaseEmailLayout>
  );
}
