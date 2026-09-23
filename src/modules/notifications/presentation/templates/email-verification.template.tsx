import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface EmailVerificationTemplateProps {
  fullName?: string | null;
  verificationUrl: string;
}

export function EmailVerificationTemplate({
  fullName,
  verificationUrl,
}: EmailVerificationTemplateProps) {
  const displayName = fullName?.trim() || 'hola';

  return (
    <BaseEmailLayout previewText="Confirma tu correo electrónico para activar tu cuenta en Adoptanet">
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">Verificación de Cuenta</EmailBadge>
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
        ¡Bienvenido/a, {displayName}!
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Gracias por registrarte en Adoptanet. Para garantizar la seguridad de tu
        cuenta y acceder a todas las funciones de la plataforma, por favor confirma
        tu dirección de correo electrónico haciendo clic en el siguiente botón:
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={verificationUrl} variant="primary">
          Confirmar y Activar Cuenta
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
        Este enlace de activación tiene una vigencia de <strong>24 horas</strong>.
        Si no realizaste este registro, puedes ignorar este mensaje de forma segura.
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
          href={verificationUrl}
          style={{
            color: emailTheme.colors.primary,
            wordBreak: 'break-all',
          }}
        >
          {verificationUrl}
        </a>
      </Text>
    </BaseEmailLayout>
  );
}
