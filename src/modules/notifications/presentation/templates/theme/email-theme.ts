/**
 * Tokens de diseño para plantillas de correo electrónico transaccionales de Adoptanet.
 * Extraídos fielmente de frontend/DESIGN.md (Figma: "Sistema de diseño y mockups").
 */
export const emailTheme = {
  colors: {
    // Verdes (Marca y acciones de gestión)
    primary: '#1D5147', // verde-700: Primario institucional y botones secundarios
    primaryDark: '#0E2C25', // verde-900: Fondos oscuros y texto sobre ámbar
    primaryLight: '#2E7D6E', // verde-500: Acentos y enlaces
    primarySubtle: '#EDF5F2', // verde-50: Fondo suave para estados positivos

    // Ámbares (Afinidad y acción principal del adoptante)
    accent: '#F0A202', // ambar-500: CTA principal
    accentDark: '#9A5D02', // ambar-700: Texto sobre fondos ámbar claro
    accentLight: '#FCEBC9', // ambar-100: Fondo de razones de afinidad o avisos

    // Estados de proceso
    statusReview: '#2C6E9B', // azul-600: En revisión
    statusReviewBg: '#DCEAF3', // azul-100: Fondo en revisión
    statusRejected: '#B94328', // coral-600: Rechazada / destructivo
    statusRejectedBg: '#F8DED8', // coral-100: Fondo de error

    // Superficies y neutros
    surface: '#FFFFFF', // superficie: Fondo de tarjetas
    surfaceAlt: '#FAF9F6', // superficie-2: Superficie elevada alterna
    background: '#F5F3EE', // fondo: Fondo exterior del email
    border: '#DEE4E1', // linea: Bordes sutiles

    // Tipografía
    textPrimary: '#14201C', // tinta-900: Títulos y texto principal
    textSecondary: '#4B5A55', // tinta-600: Párrafos y subtítulos
    textMuted: '#8A9793', // tinta-400: Pie de página y texto legal
  },
  borderRadius: {
    sm: '6px',
    button: '8px', // md: 8px para botones
    card: '12px', // xl: 12px para tarjetas contenedoras
    full: '9999px', // Insignias / badges
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
} as const;
