import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface FollowUpCompletedTemplateProps {
  adopterName: string;
  petName: string;
  certificateCode: string;
  shelterName: string;
  actionUrl: string;
}

export function FollowUpCompletedTemplate({
  adopterName,
  petName,
  certificateCode,
  shelterName,
  actionUrl,
}: FollowUpCompletedTemplateProps) {
  const name = adopterName.trim() || 'Adoptante';

  return (
    <BaseEmailLayout previewText={`🏆 ¡Felicidades! Adopción Consolidada Oficialmente para ${petName}`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="success">
          ¡Ciclo de Seguimiento Culminado con Éxito! 🏆
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
        ¡Felicidades, {name}! {petName} ya tiene su hogar definitivo 🏡
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        Has completado con dedicación y cariño los 3 hitos del programa de acompañamiento post-adopción (30, 90 y 180 días). Junto con el equipo de <strong>{shelterName}</strong>, celebramos que la adopción de <strong>{petName}</strong> es hoy un compromiso consolidado y una hermosa historia con final feliz.
      </Text>

      <Section
        style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          padding: '20px',
          margin: '24px 0',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            color: '#065F46',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 700,
            margin: '0 0 4px 0',
          }}
        >
          Código Oficial de Constancia de Adopción
        </Text>
        <Text
          style={{
            color: '#047857',
            fontSize: '22px',
            fontFamily: 'monospace',
            fontWeight: 800,
            margin: '4px 0',
          }}
        >
          {certificateCode}
        </Text>
        <Text
          style={{
            color: '#065F46',
            fontSize: '12px',
            margin: '4px 0 0 0',
          }}
        >
          Acreditado con amor por Adoptanet y {shelterName}
        </Text>
      </Section>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '14px',
          lineHeight: '22px',
          margin: '0 0 16px 0',
        }}
      >
        Gracias por abrir las puertas de tu hogar y darle una segunda oportunidad a un animalito que lo necesitaba. ¡Te deseamos una vida llena de momentos maravillosos junto a <strong>{petName}</strong>!
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Ver Constancia en Mi Perfil
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
