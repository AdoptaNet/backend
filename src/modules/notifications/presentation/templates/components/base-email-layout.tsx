import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { emailTheme } from '../theme/email-theme';

export interface BaseEmailLayoutProps {
  previewText?: string;
  children: React.ReactNode;
}

/**
 * Plantilla base envoltorio para todos los correos transaccionales de Adoptanet.
 * Aplica el fondo cálido (#F5F3EE), tarjeta blanca (#FFFFFF), cabecera institucional y pie de página legal.
 */
export function BaseEmailLayout({
  previewText = 'Notificación de Adoptanet',
  children,
}: BaseEmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: emailTheme.colors.background,
          fontFamily: emailTheme.typography.fontFamily,
          margin: '0',
          padding: '32px 16px',
        }}
      >
        <Container
          style={{
            maxWidth: '580px',
            margin: '0 auto',
          }}
        >
          {/* Cabecera / Marca */}
          <Section
            style={{
              textAlign: 'center',
              paddingBottom: '24px',
            }}
          >
            <Text
              style={{
                color: emailTheme.colors.primary,
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                margin: '0',
                lineHeight: '30px',
              }}
            >
              🐾 AdoptaNet
            </Text>
            <Text
              style={{
                color: emailTheme.colors.textSecondary,
                fontSize: '13px',
                margin: '4px 0 0 0',
              }}
            >
              Conectando vidas, transformando adopciones
            </Text>
          </Section>

          {/* Tarjeta de Contenido Principal */}
          <Section
            style={{
              backgroundColor: emailTheme.colors.surface,
              borderRadius: emailTheme.borderRadius.card,
              border: `1px solid ${emailTheme.colors.border}`,
              padding: '32px',
              boxShadow: '0 1px 3px rgba(20, 32, 28, 0.05)',
            }}
          >
            {children}
          </Section>

          {/* Pie de página institucional */}
          <Section
            style={{
              textAlign: 'center',
              paddingTop: '24px',
            }}
          >
            <Text
              style={{
                color: emailTheme.colors.textMuted,
                fontSize: '12px',
                lineHeight: '18px',
                margin: '0 0 8px 0',
              }}
            >
              Este es un correo transaccional generado automáticamente por{' '}
              <strong>Adoptanet</strong>.
            </Text>
            <Text
              style={{
                color: emailTheme.colors.textMuted,
                fontSize: '11px',
                lineHeight: '16px',
                margin: '0',
              }}
            >
              © {new Date().getFullYear()} Adoptanet — Plataforma para la
              optimización de adopciones en el Perú.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
