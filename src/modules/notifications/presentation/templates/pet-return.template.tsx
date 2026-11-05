import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface PetReturnTemplateProps {
  recipientName: string;
  petName: string;
  isCompleted: boolean;
  isAccepted?: boolean;
  reasonText?: string;
  actionUrl: string;
}

export function PetReturnTemplate({
  recipientName,
  petName,
  isCompleted,
  isAccepted,
  reasonText,
  actionUrl,
}: PetReturnTemplateProps) {
  const name = recipientName.trim() || 'Usuario';

  return (
    <BaseEmailLayout previewText={`Protocolo de Retorno de Mascota: ${petName}`}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">
          {isCompleted ? 'Resolución de Retorno' : 'Solicitud de Retorno'}
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
        {isCompleted
          ? `Actualización del retorno de ${petName}`
          : `Nueva solicitud formal de retorno para ${petName}`}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        {isCompleted ? (
          isAccepted ? (
            <>
              Hola {name}, el albergue ha confirmado la <strong>recepción física de {petName}</strong>. El proceso de adopción ha sido revocado formalmente y la mascota pasa a evaluación preventiva.
            </>
          ) : (
            <>
              Hola {name}, el albergue ha revisado la solicitud de retorno de {petName} y determinó que no cumple las causales tipificadas.
            </>
          )
        ) : (
          <>
            Hola {name}, el adoptante ha iniciado una <strong>solicitud de retorno por fuerza mayor</strong> para {petName}.
          </>
        )}
      </Text>

      {reasonText && (
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
            Motivo declarado:
          </Text>
          <Text
            style={{
              color: emailTheme.colors.textSecondary,
              fontSize: '13px',
              lineHeight: '20px',
              margin: 0,
            }}
          >
            {reasonText}
          </Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={actionUrl} variant="primary">
          Gestionar en AdoptaNet
        </EmailButton>
      </Section>

      <Hr style={{ borderColor: emailTheme.colors.border, margin: '24px 0' }} />
    </BaseEmailLayout>
  );
}
