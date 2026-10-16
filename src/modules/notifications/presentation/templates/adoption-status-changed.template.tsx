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
  const name = adopterName.trim() || 'Adoptante';

  return (
    <BaseEmailLayout
      previewText={
        isApproved
          ? `¡Felicidades ${name}! Tu solicitud de adopción para ${petName} fue aprobada`
          : `Actualización sobre tu solicitud de adopción para ${petName}`
      }
    >
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isApproved ? 'success' : 'accent'}>
          {isApproved ? '¡Adopción Aprobada! 🎉' : 'Actualización de Solicitud'}
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
        {isApproved
          ? `🎉 ¡Buenas noticias, ${name}!`
          : `Hola ${name}, información sobre tu solicitud`}
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
            Nos alegra comunicarte que el albergue ha evaluado favorablemente tu
            expediente y <strong>ha aprobado tu solicitud de adopción para {petName}</strong>.
            La mascota ha sido reservada para ti y ahora puedes coordinar los detalles de entrega
            y formalización.
          </>
        ) : (
          <>
            Queremos agradecerte por tu tiempo y compromiso al postular para la
            adopción de <strong>{petName}</strong>. El albergue custodio ha
            evaluado las postulaciones y en esta ocasión ha dictaminado que no es
            posible proceder con esta solicitud.
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
              Motivo principal: {rejectionReasonText}
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
          ? 'Recuerda que la tenencia responsable y el programa de seguimiento aseguran el bienestar integral de tu nuevo compañero.'
          : 'Te animamos a continuar explorando nuestro catálogo; hay muchos otros animalitos rescatados esperando por un hogar lleno de cariño.'}
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
        Enlace de acceso directo:
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
