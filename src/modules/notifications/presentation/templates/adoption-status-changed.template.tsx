import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface AdoptionStatusChangedTemplateProps {
  adopterName: string;
  petName: string;
  isApproved: boolean;
  rejectionReasonText?: string | null;
  rejectionNotes?: string | null;
  actionUrl: string;
}

export function AdoptionStatusChangedTemplate({
  adopterName,
  petName,
  isApproved,
  rejectionReasonText,
  rejectionNotes,
  actionUrl,
}: AdoptionStatusChangedTemplateProps) {
  const trimmedName = adopterName?.trim();

  const previewText = isApproved
    ? trimmedName
      ? `¡Felicidades ${trimmedName}! Tu solicitud de adopción para ${petName} fue aprobada`
      : `¡Felicidades! Tu solicitud de adopción para ${petName} fue aprobada`
    : trimmedName
      ? `Novedades sobre tu postulación para adoptar a ${petName}`
      : `Actualización sobre tu solicitud de adopción para ${petName}`;

  const headingTitle = isApproved
    ? trimmedName
      ? `🎉 ¡Excelentes noticias, ${trimmedName}!`
      : '🎉 ¡Excelentes noticias sobre tu adopción!'
    : trimmedName
      ? `Hola ${trimmedName}, novedades sobre tu postulación`
      : 'Novedades sobre tu postulación de adopción';

  return (
    <BaseEmailLayout previewText={previewText}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isApproved ? 'success' : 'accent'}>
          {isApproved ? '¡Adopción Aprobada! 🎉' : 'Actualización de Solicitud 🐾'}
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
        {headingTitle}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        {isApproved ? (
          <>
            Nos alegra mucho contarte que el albergue ha evaluado favorablemente
            tu solicitud y{' '}
            <strong>ha aprobado la adopción de {petName}</strong>. La mascota ha
            sido reservada para ti y ahora puedes coordinar los detalles de
            bienvenida y formalización.
          </>
        ) : (
          <>
            Queremos agradecerte sinceramente por tu tiempo, interés y
            compromiso al postular para la adopción de{' '}
            <strong>{petName}</strong>. El albergue ha evaluado con mucho
            cuidado las postulaciones recibidas y, en esta ocasión, ha decidido
            continuar con otra opción que se ajusta de manera más inmediata a las
            necesidades de la mascota.
          </>
        )}
      </Text>

      {!isApproved && (rejectionReasonText || rejectionNotes) && (
        <Section
          style={{
            backgroundColor: '#F8FAF9',
            border: `1px solid ${emailTheme.colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 0',
          }}
        >
          {rejectionReasonText && (
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                fontWeight: 600,
                margin: '0 0 8px 0',
              }}
            >
              Detalle de la evaluación: {rejectionReasonText}
            </Text>
          )}
          {rejectionNotes && (
            <Text
              style={{
                color: emailTheme.colors.textSecondary,
                fontSize: '13px',
                lineHeight: '20px',
                margin: 0,
              }}
            >
              Comentarios del albergue: <em>"{rejectionNotes}"</em>
            </Text>
          )}
        </Section>
      )}

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          {isApproved
            ? 'Ver Mi Solicitud y Próximos Pasos'
            : 'Explorar Otras Mascotas Compatibles'}
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
        {isApproved
          ? 'Recuerda que la tenencia responsable y el programa de acompañamiento aseguran el bienestar integral de tu nuevo compañero.'
          : '¡No te desanimes! Te invitamos a seguir explorando el catálogo; hay muchos otros perritos y gatitos rescatados esperando una familia con tanto cariño como la tuya.'}
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
