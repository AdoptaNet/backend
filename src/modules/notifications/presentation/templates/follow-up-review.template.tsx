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
          : `Observaciones en tu hito de ${milestoneDays} días para ${petName}`
      }
    >
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isApproved ? 'success' : 'accent'}>
          {isApproved ? 'Hito Aprobado 🎉' : 'Observación en Seguimiento ⚠️'}
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
          ? `¡Excelente noticia, ${name}!`
          : `Hola ${name}, el albergue solicita una corrección`}
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
            El albergue ha revisado y <strong>aprobado satisfactoriamente tus evidencias</strong> para el hito de <strong>{milestoneDays} días</strong> de <strong>{petName}</strong>. ¡Gracias por tu dedicación y amor hacia tu compañero!
          </>
        ) : (
          <>
            El albergue examinó tus evidencias del hito de <strong>{milestoneDays} días</strong> para <strong>{petName}</strong> y ha solicitado subsanar algunos puntos para certificar su estado de salud.
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
            Comentarios del Albergue:
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

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          {isApproved ? 'Ver Mi Línea de Tiempo' : 'Subsanar Evidencias'}
        </EmailButton>
      </Section>

      <Hr style={{ borderColor: emailTheme.colors.border, margin: '24px 0' }} />
    </BaseEmailLayout>
  );
}
