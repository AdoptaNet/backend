import * as React from 'react';
import { Button } from '@react-email/components';
import { emailTheme } from '../theme/email-theme';

export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  style?: React.CSSProperties;
}

/**
 * Botón seguro para clientes de correo electrónico con la estética de Adoptanet.
 * - 'primary': Fondo ámbar-500 (#F0A202) con texto verde-900 (#0E2C25) para acciones de adoptantes.
 * - 'secondary': Fondo verde-700 (#1D5147) con texto blanco (#FFFFFF) para acciones de albergue/institucional.
 */
export function EmailButton({
  href,
  children,
  variant = 'secondary',
  style,
}: EmailButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Button
      href={href}
      style={{
        backgroundColor: isPrimary
          ? emailTheme.colors.accent
          : emailTheme.colors.primary,
        color: isPrimary
          ? emailTheme.colors.primaryDark
          : emailTheme.colors.surface,
        borderRadius: emailTheme.borderRadius.button,
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: 600,
        lineHeight: '20px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        fontFamily: emailTheme.typography.fontFamily,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </Button>
  );
}
