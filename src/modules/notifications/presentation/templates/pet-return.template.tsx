import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface PetReturnTemplateProps {
  recipientName: string;
  petName: string;
  isCompleted: boolean;
  isAccepted?: boolean;
  reasonText?: string;
  actionUrl: string;
}

export function PetReturnTemplate({
  recipientName,
  petName,
  isCompleted,
  isAccepted,
  reasonText,
  actionUrl,
}: PetReturnTemplateProps) {
  const name = recipientName?.trim() || 'Estimado/a';

  const previewText = !isCompleted
    ? `Solicitud de retorno responsable para ${petName}`
    : isAccepted
      ? `${petName} ya se encuentra bajo el cuidado del albergue`
      : `Coordinación sobre la solicitud de retorno de ${petName}`;

  return (
    <BaseEmailLayout previewText={previewText}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isCompleted && isAccepted ? 'success' : 'accent'}>
          {!isCompleted
            ? 'Solicitud de Retorno Responsable 🐾'
            : isAccepted
              ? 'Retorno Responsable Confirmado 🐾'
              : 'Coordinación Requerida 💬'}
        </EmailBadge>
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
        {!isCompleted
          ? `Solicitud de retorno responsable para ${petName}`
          : isAccepted
            ? `Hola ${name}, ${petName} ya se encuentra bajo el cuidado del albergue`
            : `Hola ${name}, el albergue desea comunicarse contigo sobre ${petName}`}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        {!isCompleted ? (
          <>
            Hola <strong>{name}</strong>, el adoptante de <strong>{petName}</strong> ha comunicado
            una situación de fuerza mayor y solicita coordinar el retorno responsable de la mascota.
          </>
        ) : isAccepted ? (
          <>
            Queremos confirmarte que el albergue ha recibido a <strong>{petName}</strong> y se
            encuentra a salvo y bien atendido. Entendemos que tomar esta decisión por causas de fuerza
            mayor ha sido difícil. Te agradecemos por haber actuado con empatía y responsabilidad,
            priorizando su seguridad en todo momento en lugar de dejarlo desprotegido.
          </>
        ) : (
          <>
            El albergue ha revisado tu mensaje respecto a la situación de <strong>{petName}</strong>.
            Antes de avanzar con un retorno definitivo, el equipo considera importante explorar
            juntos alternativas de apoyo (como asesoría en adaptación o cuidados). Por favor
            comunícate directamente con el albergue para acordar la mejor opción para ambos.
          </>
        )}
      </Text>

      {reasonText && (
        <Section
          style={{
            backgroundColor: '#F8FAF9',
            border: `1px solid ${emailTheme.colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 0',
          }}
        >
          <Text
            style={{
              color: emailTheme.colors.textPrimary,
              fontSize: '14px',
              fontWeight: 600,
              margin: '0 0 6px 0',
            }}
          >
            Motivo y circunstancias comunicadas:
          </Text>
          <Text
            style={{
              color: emailTheme.colors.textSecondary,
              fontSize: '13px',
              lineHeight: '20px',
              margin: 0,
            }}
          >
            <em>"{reasonText}"</em>
          </Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          {!isCompleted
            ? 'Revisar y Coordinar Retorno'
            : isAccepted
              ? 'Ver Detalle en Mi Perfil'
              : 'Ver Mensajes y Contacto'}
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
          fontSize: '12px',
          lineHeight: '18px',
          margin: 0,
        }}
      >
        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        <br />
        <a
          href={actionUrl}
          style={{
            color: emailTheme.colors.primary,
            wordBreak: 'break-all',
          }}
        >
          {actionUrl}
        </a>
      </Text>
    </BaseEmailLayout>
  );
}
