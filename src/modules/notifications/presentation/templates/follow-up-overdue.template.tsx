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
  const name = adopterName.trim() || 'Adoptante';

  return (
    <BaseEmailLayout previewText={`⚠️ Urgente: Hito de seguimiento vencido para ${petName}`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">
          Hito Vencido ({milestoneDays} días) ⚠️
        </EmailBadge>
      </Section>

      <Heading
        as="h1"
        style={{
          color: '#B91C1C',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '28px',
          margin: '0 0 16px 0',
          fontFamily: emailTheme.typography.fontFamily,
        }}
      >
        Atención {name}: Regulariza el expediente de {petName}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Te informamos que el plazo máximo para remitir las evidencias del <strong>hito de {milestoneDays} días</strong> para <strong>{petName}</strong> venció el {dueDate} y actualmente registra más de 7 días de retraso sin novedades.
      </Text>

      <Section
        style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          padding: '16px',
          margin: '20px 0',
        }}
      >
        <Text
          style={{
            color: '#991B1B',
            fontSize: '14px',
            fontWeight: 600,
            margin: '0 0 6px 0',
          }}
        >
          Compromiso Contractual de Adopción
        </Text>
        <Text
          style={{
            color: '#7F1D1D',
            fontSize: '13px',
            lineHeight: '20px',
            margin: 0,
          }}
        >
          El albergue custodio ha sido notificado de esta mora. Para evitar visitas inopinadas o medidas de fiscalización presencial, por favor ingresa y carga las fotos y notas de salud a la brevedad posible.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Regularizar Evidencias Ahora
        </EmailButton>
      </Section>

      <Hr style={{ borderColor: emailTheme.colors.border, margin: '24px 0' }} />
    </BaseEmailLayout>
  );
}
