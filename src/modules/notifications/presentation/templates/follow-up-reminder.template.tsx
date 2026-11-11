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
  const trimmedName = adopterName?.trim();
  const greetingName = trimmedName ? ` ${trimmedName}` : '';

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
        ¡Hola{greetingName}! ¿Cómo está {petName}?
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Se acerca la fecha para el <strong>hito de seguimiento a los {milestoneDays} días</strong> ({dueDate}) desde que formalizaste la adopción de <strong>{petName}</strong>.
        Queremos saber cómo le está yendo y celebrar sus avances en casa.
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
          ¿Qué puedes compartir en esta actualización?
        </Text>
        <Text
          style={{
            color: emailTheme.colors.textSecondary,
            fontSize: '13px',
            lineHeight: '20px',
            margin: 0,
          }}
        >
          • 1 o 2 fotografías recientes de {petName} disfrutando en su hogar o paseando.<br />
          • Foto de su carnet de vacunación o control veterinario periódico.<br />
          • Unas breves líneas contándonos sobre su apetito, ánimo y adaptación en familia.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Compartir Fotos y Novedades
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
        Este seguimiento asegura el bienestar integral de {petName} y nos llena de alegría ver cómo crece y se adapta con su nueva familia.
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
