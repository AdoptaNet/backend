import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface ShelterVerificationTemplateProps {
  organizationName?: string | null;
  isVerified: boolean;
  shelterUrl: string;
}

export function ShelterVerificationTemplate({
  organizationName,
  isVerified,
  shelterUrl,
}: ShelterVerificationTemplateProps) {
  const name = organizationName?.trim() || 'Albergue';

  return (
    <BaseEmailLayout previewText={isVerified ? '¡Tu albergue ha sido verificado en AdoptaNet!' : 'Actualización de estado de verificación'}>
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isVerified ? 'success' : 'accent'}>
          {isVerified ? 'Albergue Verificado' : 'Acreditación Oficial'}
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
        {isVerified ? `¡Enhorabuena, ${name}!` : `Notificación sobre ${name}`}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        {isVerified
          ? 'Nos complace informarte que la administración de AdoptaNet ha revisado y validado satisfactoriamente los antecedentes de tu organización. A partir de este momento, tu ficha pública y todas tus publicaciones lucirán el distintivo oficial de "Albergue Verificado".'
          : 'Te informamos que el estado de acreditación oficial de tu albergue ha sido modificado por el equipo de administración. Puedes ingresar a tu perfil para revisar tus datos institucionales.'}
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton href={shelterUrl} variant="primary">
          Ver Ficha Pública de Albergue
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
        Este distintivo genera confianza y transparencia en nuestra comunidad de adoptantes responsables.
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
        Enlace directo a tu ficha:
        <br />
        <a
          href={shelterUrl}
          style={{
            color: emailTheme.colors.primary,
            wordBreak: 'break-all',
          }}
        >
          {shelterUrl}
        </a>
      </Text>
    </BaseEmailLayout>
  );
}
