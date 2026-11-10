import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface MilestoneSubmittedTemplateProps {
  shelterName?: string | null;
  adopterName: string;
  petName: string;
  milestoneDays: number;
  actionUrl: string;
}

/**
 * Plantilla de notificación enviada al albergue cuando un adoptante sube
 * fotos y actualización periódica para un hito de seguimiento (30, 90 o 180 días).
 */
export function MilestoneSubmittedTemplate({
  shelterName,
  adopterName,
  petName,
  milestoneDays,
  actionUrl,
}: MilestoneSubmittedTemplateProps) {
  const greetingName = shelterName?.trim()
    ? `equipo de ${shelterName.trim()}`
    : 'equipo del albergue';

  return (
    <BaseEmailLayout
      previewText={`📸 ¡Nuevas fotos y novedades de ${petName} (${milestoneDays} días)!`}
    >
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">
          Seguimiento Post-Adopción ({milestoneDays} días) 📸
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
        ¡Nuevas fotos y actualización de {petName}!
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        ¡Hola, {greetingName}! Nos alegra contarte que <strong>{adopterName}</strong> ha
        compartido nuevas fotografías y detalles sobre el bienestar y la adaptación
        de <strong>{petName}</strong> correspondientes al hito de{' '}
        <strong>{milestoneDays} días</strong>.
      </Text>

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
            margin: '0 0 8px 0',
          }}
        >
          ¿Qué incluye esta actualización?
        </Text>
        <Text
          style={{
            color: emailTheme.colors.textSecondary,
            fontSize: '13px',
            lineHeight: '20px',
            margin: 0,
          }}
        >
          • Fotografías recientes de {petName} disfrutando en su hogar.
          <br />
          • Actualización del carnet de vacunación o control veterinario.
          <br />
          • Notas del adoptante sobre su adaptación, alimentación y rutina diaria.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Ver Fotos y Novedades de {petName}
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
        Desde tu panel de seguimiento puedes revisar el material, dejar un mensaje
        o felicitación a la familia adoptiva, y certificar el cumplimiento de este hito.
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
