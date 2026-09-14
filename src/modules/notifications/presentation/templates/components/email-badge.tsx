import * as React from 'react';
import { Text } from '@react-email/components';
import { emailTheme } from '../theme/email-theme';

export interface EmailBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'review' | 'rejected' | 'accent';
  style?: React.CSSProperties;
}

/**
 * Chip / insignia de estado para correos de Adoptanet.
 */
export function EmailBadge({
  children,
  variant = 'success',
  style,
}: EmailBadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'review':
        return {
          bg: emailTheme.colors.statusReviewBg,
          color: emailTheme.colors.statusReview,
        };
      case 'rejected':
        return {
          bg: emailTheme.colors.statusRejectedBg,
          color: emailTheme.colors.statusRejected,
        };
      case 'accent':
        return {
          bg: emailTheme.colors.accentLight,
          color: emailTheme.colors.accentDark,
        };
      case 'success':
      default:
        return {
          bg: emailTheme.colors.primarySubtle,
          color: emailTheme.colors.primary,
        };
    }
  };

  const { bg, color } = getColors();

  return (
    <Text
      style={{
        display: 'inline-block',
        backgroundColor: bg,
        color: color,
        borderRadius: emailTheme.borderRadius.full,
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '16px',
        margin: '0',
        fontFamily: emailTheme.typography.fontFamily,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
