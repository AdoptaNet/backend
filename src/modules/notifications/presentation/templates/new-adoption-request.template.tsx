import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface NewAdoptionRequestTemplateProps {
  petName: string;
  adopterName: string;
  applicationUrl: string;
}

export function NewAdoptionRequestTemplate({
  petName,
  adopterName,
  applicationUrl,
}: NewAdoptionRequestTemplateProps) {
  return (
    <BaseEmailLayout previewText={`🐾 ¡Nueva postulación recibida para ${petName}!`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="success">Nueva Solicitud de Adopción 🐾</EmailBadge>
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
        🐾 ¡Nueva postulación recibida para {petName}!
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        ¡Buenas noticias! <strong>{adopterName}</strong> ha enviado una solicitud
        para adoptar a <strong>{petName}</strong>, compartiendo su carta de
        motivación y los detalles sobre su tipo de vivienda, familia y rutina
        diaria.
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
            margin: '0 0 6px 0',
          }}
        >
          ¿Qué puedes hacer desde tu panel?
        </Text>
        <Text
          style={{
            color: emailTheme.colors.textSecondary,
            fontSize: '13px',
            lineHeight: '20px',
            margin: 0,
          }}
        >
          • Conocer al postulante y su experiencia previa con mascotas.
          <br />
          • Revisar su compatibilidad con el nivel de energía de {petName}.
          <br />
          • Iniciar una conversación directa o dar respuesta a su postulación.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={applicationUrl} variant="primary">
          Revisar Solicitud de Adopción
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
        Responder a tiempo a los adoptantes mantiene viva su motivación y ayuda
        a que más rescatados encuentren un hogar definitivo.
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
          href={applicationUrl}
          style={{
            color: emailTheme.colors.primary,
            wordBreak: 'break-all',
          }}
        >
          {applicationUrl}
        </a>
      </Text>
    </BaseEmailLayout>
  );
}
