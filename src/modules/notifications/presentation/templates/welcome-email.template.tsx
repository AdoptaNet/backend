import * as React from 'react';
import { Heading, Hr, Section, Text } from '@react-email/components';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { BaseEmailLayout } from './components/base-email-layout';
import { EmailBadge } from './components/email-badge';
import { EmailButton } from './components/email-button';
import { emailTheme } from './theme/email-theme';

export interface WelcomeEmailProps {
  fullName?: string | null;
  role?: UserRole;
  frontendUrl?: string;
}

/**
 * Plantilla de correo de bienvenida tras el registro exitoso de un usuario.
 * Adapta el contenido y el llamado a la acción (CTA) según el rol (ADOPTER o SHELTER).
 */
export function WelcomeEmailTemplate({
  fullName,
  role = UserRole.ADOPTER,
  frontendUrl = 'http://localhost:3001',
}: WelcomeEmailProps) {
  const isAdopter = role === UserRole.ADOPTER;
  const displayName = fullName?.trim() || (isAdopter ? 'adoptante' : 'rescatista');

  return (
    <BaseEmailLayout previewText="🐾 ¡Te damos la bienvenida a Adoptanet! Gracias por sumarte a la adopción responsable.">
      {/* Insignia superior */}
      <Section style={{ marginBottom: '16px' }}>
        <EmailBadge variant="accent">🐾 Comunidad Adoptanet</EmailBadge>
      </Section>

      {/* Título de bienvenida */}
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
        ¡Hola, {displayName}!
      </Heading>

      {/* Introducción */}
      <Text
        style={{
          color: emailTheme.colors.textSecondary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 16px 0',
        }}
      >
        {isAdopter
          ? 'Estamos muy felices de darte la bienvenida a Adoptanet. Creemos que cada animal rescatado merece un hogar definitivo y un compañero humano que encaje de verdad con su energía, espacio y rutina.'
          : 'Gracias por registrar tu albergue o labor de rescate en Adoptanet. Tu dedicación y cuidado son el motor que hace posible transformar la vida de cientos de animales.'}
      </Text>

      {/* Caja de recomendaciones o siguientes pasos */}
      <Section
        style={{
          backgroundColor: emailTheme.colors.primarySubtle,
          borderRadius: emailTheme.borderRadius.button,
          border: `1px solid ${emailTheme.colors.border}`,
          padding: '20px',
          margin: '20px 0',
        }}
      >
        <Text
          style={{
            color: emailTheme.colors.primary,
            fontSize: '14px',
            fontWeight: 700,
            margin: '0 0 12px 0',
            lineHeight: '20px',
          }}
        >
          {isAdopter ? '¿Qué puedes hacer ahora?' : 'Próximos pasos para tu albergue:'}
        </Text>

        {isAdopter ? (
          <>
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0 0 8px 0',
              }}
            >
              1. <strong>Completa tu perfil:</strong> Cuéntanos sobre tu tipo de vivienda, horarios y patio para que nuestro sistema encuentre a tu compañero ideal.
            </Text>
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0 0 8px 0',
              }}
            >
              2. <strong>Descubre tus coincidencias:</strong> Consulta las razones concretas de afinidad con cada perrito o gatito rescatado.
            </Text>
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0',
              }}
            >
              3. <strong>Postula con confianza:</strong> Envía solicitudes directas y mantén comunicación clara con los albergues.
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0 0 8px 0',
              }}
            >
              1. <strong>Configura el perfil de tu albergue:</strong> Agrega tu información de contacto, redes y ubicación para generar confianza.
            </Text>
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0 0 8px 0',
              }}
            >
              2. <strong>Publica tus animales:</strong> Sube fotos nítidas y describe su temperamento, nivel de energía y necesidades.
            </Text>
            <Text
              style={{
                color: emailTheme.colors.textPrimary,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0',
              }}
            >
              3. <strong>Evalúa solicitudes objetivas:</strong> Recibe postulaciones ordenadas con el perfil real de cada postulante.
            </Text>
          </>
        )}
      </Section>

      {/* Botón de acción principal */}
      <Section style={{ textAlign: 'center', margin: '28px 0 20px 0' }}>
        <EmailButton
          href={isAdopter ? `${frontendUrl}/explorar` : `${frontendUrl}/albergue`}
          variant={isAdopter ? 'primary' : 'secondary'}
        >
          {isAdopter ? 'Explorar mascotas en adopción' : 'Ir a mi panel de albergue'}
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
          fontSize: '13px',
          lineHeight: '20px',
          margin: '0',
        }}
      >
        ¡Gracias por sumarte a la adopción responsable en el Perú! Si tienes alguna duda, responde directamente a este correo.
      </Text>
    </BaseEmailLayout>
  );
}
