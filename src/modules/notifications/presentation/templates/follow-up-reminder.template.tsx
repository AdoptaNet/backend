import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface FollowUpReminderTemplateProps {
  adopterName: string;
  petName: string;
  milestoneDays: number;
  dueDate: string;
  actionUrl: string;
}

export function FollowUpReminderTemplate({
  adopterName,
  petName,
  milestoneDays,
  dueDate,
  actionUrl,
}: FollowUpReminderTemplateProps) {
  const name = adopterName.trim() || 'Adoptante';

  return (
    <BaseEmailLayout previewText={`Recordatorio: Hito de ${milestoneDays} días para ${petName}`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">
          Seguimiento Post-Adopción ({milestoneDays} días) 📅
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
        ¡Hola {name}! ¿Cómo está {petName}?
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Se aproxima la fecha límite para el <strong>hito de seguimiento a los {milestoneDays} días</strong> ({dueDate}) desde que formalizaste la adopción de <strong>{petName}</strong>.
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
          ¿Qué necesitas subir a la plataforma?
        </Text>
        <Text
          style={{
            color: emailTheme.colors.textSecondary,
            fontSize: '13px',
            lineHeight: '20px',
            margin: 0,
          }}
        >
          • 1 o 2 fotografías claras de {petName} en casa.<br />
          • Foto del carnet de vacunación o control veterinario periódico.<br />
          • Unas breves líneas contándonos sobre su apetito, energía y adaptación.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Subir Evidencias de Seguimiento
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
        Este proceso garantiza el bienestar del animal y es parte de tu compromiso de tenencia responsable con el albergue custodio.
      </Text>

      <Hr style={{ borderColor: emailTheme.colors.border, margin: '24px 0' }} />
    </BaseEmailLayout>
  );
}
