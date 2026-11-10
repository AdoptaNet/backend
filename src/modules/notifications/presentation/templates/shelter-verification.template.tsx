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
  const trimmedName = organizationName?.trim();
  const headingTitle = isVerified
    ? trimmedName
      ? `¡Enhorabuena, ${trimmedName}!`
      : '¡Tu albergue ha sido verificado!'
    : trimmedName
      ? `Resultado de verificación para ${trimmedName}`
      : 'Resultado de verificación de tu albergue';

  const actionText = isVerified
    ? 'Ver Ficha Pública de Albergue'
    : 'Completar y Actualizar mi Perfil';

  return (
    <BaseEmailLayout
      previewText={
        isVerified
          ? '🎉 ¡Tu albergue ha sido verificado en AdoptaNet!'
          : 'ℹ️ Resultado de la solicitud de verificación de tu albergue'
      }
    >
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant={isVerified ? 'success' : 'accent'}>
          {isVerified ? 'Albergue Verificado ✨' : 'Verificación No Aprobada ℹ️'}
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
        {headingTitle}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        {isVerified ? (
          'Nos alegra contarte que el equipo de AdoptaNet ha revisado y validado satisfactoriamente la información de tu organización. A partir de este momento, tu ficha pública y todas tus publicaciones lucirán el distintivo oficial de "Albergue Verificado".'
        ) : (
          <>
            Te informamos que, tras revisar los datos institucionales
            presentados, el equipo de administración{' '}
            <strong>
              no ha aprobado la verificación oficial de tu albergue en esta
              oportunidad
            </strong>
            .
            <br />
            <br />
            Generalmente esto ocurre cuando falta información de contacto, no
            se pudieron validar las redes sociales activas, o se requiere mayor
            detalle sobre las instalaciones y la labor de rescate.
            <br />
            <br />
            <strong>¿Qué puedes hacer ahora?</strong> Puedes ingresar a tu
            perfil, completar los datos faltantes o corregir la información y
            solicitar una nueva revisión en cualquier momento.
          </>
        )}
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <EmailButton
          href={shelterUrl}
          variant={isVerified ? 'primary' : 'secondary'}
        >
          {actionText}
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
        {isVerified
          ? 'Este distintivo genera confianza y transparencia en nuestra comunidad de adoptantes responsables, destacando tu compromiso con el bienestar animal.'
          : 'Nuestro objetivo es construir una comunidad segura y transparente para todos los animales rescatados y sus futuras familias adoptivas.'}
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
          margin: '0 0 8px 0',
        }}
      >
        Si tienes dudas o consultas sobre el proceso de acreditación, responde
        directamente a este correo o contacta a nuestro equipo de soporte.
      </Text>

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
