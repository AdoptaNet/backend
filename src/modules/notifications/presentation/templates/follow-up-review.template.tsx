import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface FollowUpReviewTemplateProps {
  adopterName: string;
  petName: string;
  milestoneDays: number;
  isApproved: boolean;
  reviewNotes?: string | null;
  actionUrl: string;
}

export function FollowUpReviewTemplate({
  adopterName,
  petName,
  milestoneDays,
  isApproved,
  reviewNotes,
  actionUrl,
}: FollowUpReviewTemplateProps) {
  const name = adopterName.trim() || 'Adoptante';

  return (
    <BaseEmailLayout
      previewText={
        isApproved
          ? `¡Hito de ${milestoneDays} días aprobado para ${petName}!`
          : `Actualización requerida en el hito de ${milestoneDays} días para ${petName}`
      }
    >
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isApproved ? 'success' : 'accent'}>
          {isApproved ? 'Hito Aprobado 🎉' : 'Actualización Requerida 📝'}
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
          ? `¡Excelente noticia, ${name}! 🎉`
          : `Hola ${name}, el albergue dejó notas en el seguimiento de ${petName}`}
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
            El albergue ha revisado con mucha alegría las fotos y novedades del hito de{' '}
            <strong>{milestoneDays} días</strong> de <strong>{petName}</strong> y ha aprobado este
            seguimiento. ¡Muchas gracias por tu compromiso y por brindarle tanto amor y bienestar a tu
            compañero!
          </>
        ) : (
          <>
            El albergue revisó las fotos y novedades que compartiste para el hito de{' '}
            <strong>{milestoneDays} días</strong>. Para poder completar este registro con total
            tranquilidad, te han dejado una pequeña recomendación o solicitud de información
            complementaria.
          </>
        )}
      </Text>

      {reviewNotes && (
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
            Recomendaciones del Albergue:
          </Text>
          <Text
            style={{
              color: emailTheme.colors.textSecondary,
              fontSize: '13px',
              lineHeight: '20px',
              margin: 0,
            }}
          >
            <em>"{reviewNotes}"</em>
          </Text>
        </Section>
      )}

      {!isApproved && (
        <Text
          style={{
            color: emailTheme.colors.textSecondary,
            fontSize: '14px',
            lineHeight: '22px',
            margin: '0 0 16px 0',
          }}
        >
          Por favor ingresa a la plataforma para complementar las fotos o responder a los comentarios
          del equipo y mantener al día el bienestar de <strong>{petName}</strong>.
        </Text>
      )}

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          {isApproved ? `Ver Línea de Tiempo de ${petName}` : 'Actualizar Fotos e Información'}
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
