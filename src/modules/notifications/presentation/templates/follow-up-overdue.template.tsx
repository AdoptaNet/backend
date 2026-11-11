import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface FollowUpOverdueTemplateProps {
  adopterName: string;
  petName: string;
  milestoneDays: number;
  dueDate: string;
  actionUrl: string;
}

export function FollowUpOverdueTemplate({
  adopterName,
  petName,
  milestoneDays,
  dueDate,
  actionUrl,
}: FollowUpOverdueTemplateProps) {
  const trimmedName = adopterName?.trim();
  const greetingName = trimmedName ? ` ${trimmedName}` : '';

  return (
    <BaseEmailLayout previewText={`⚠️ Actualización pendiente: Hito de seguimiento de ${petName}`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">
          Hito Pendiente de Seguimiento ({milestoneDays} días) ⚠️
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
        ¡Hola{greetingName}! ¿Cómo está {petName}? Tenemos una actualización pendiente
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Esperamos que todo esté marchando muy bien en casa. Te escribimos porque la fecha programada para el <strong>hito de seguimiento a los {milestoneDays} días</strong> de <strong>{petName}</strong> venció el {dueDate} y aún no hemos recibido noticias de su adaptación.
      </Text>

      <Section
        style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '16px',
          margin: '20px 0',
        }}
      >
        <Text
          style={{
            color: '#92400E',
            fontSize: '14px',
            fontWeight: 600,
            margin: '0 0 6px 0',
          }}
        >
          El albergue está al tanto y pendiente de su bienestar
        </Text>
        <Text
          style={{
            color: '#78350F',
            fontSize: '13px',
            lineHeight: '20px',
            margin: 0,
          }}
        >
          Para el equipo que cuidó de su rescate es indispensable confirmar que {petName} se encuentra sano, seguro y adaptándose bien a su nuevo hogar. Si has tenido días ocupados o algún inconveniente, por favor tómate un par de minutos para subir 1 o 2 fotos recientes y una breve nota sobre su estado.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Subir Fotos y Actualización
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
        Tu compromiso de tenencia responsable es el corazón de Adoptanet. Si necesitas apoyo o tienes alguna consulta sobre la adaptación de {petName}, puedes responder directamente a este correo.
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
