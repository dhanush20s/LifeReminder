export const colors = {
  // Premium Modern Life OS Design System (Matching Reference Image)
  background: '#F6F7FE',      // Soft Blue-Tinted White Background
  surface: '#FFFFFF',         // Crisp White Card Surface
  surfaceSecondary: '#F8FAFC',
  surfaceMuted: '#F1F5F9',

  primary: '#4F46E5',         // Royal Indigo Accent
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',    // Active Tab Pill / Badge Background
  primaryBorder: '#C7D2FE',

  textPrimary: '#0F172A',     // Deep Slate Typography
  textSecondary: '#475569',   // Subtitle Slate
  textMuted: '#94A3B8',       // Muted Text
  textLight: '#FFFFFF',

  border: '#E2E8F0',          // Subtle Card Border
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  // Soft Tinted Icon & Badge Backgrounds
  iconBgRed: '#FEE2E2',
  iconBgAmber: '#FEF3C7',
  iconBgGreen: '#DCFCE7',
  iconBgBlue: '#DBEAFE',
  iconBgPurple: '#F3E8FF',

  // Semantic Status Colors
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  success: '#16A34A',
  successLight: '#DCFCE7',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  accentPurple: '#9333EA',
  accentPurpleLight: '#F3E8FF',
  accentTeal: '#0D9488',
  accentTealLight: '#CCFBF1',
  accentOrange: '#F97316',
  accentOrangeLight: '#FFEDD5',

  dangerBorder: '#FCA5A5',
  successBorder: '#86EFAC',

  heroTerracotta: '#C96B4D',
  heroTerracottaDark: '#8B3F2D',
  heroBadgeBg: 'rgba(255,255,255,0.18)',
  heroText: '#FFFFFF',
};

export const spacing = {
  micro: 4,
  small: 8,
  compact: 12,
  default: 16,
  section: 24,
  major: 32,
  large: 40,
  hero: 48,
};

export const radii = {
  small: 8,
  field: 12,
  card: 16,           // Crisp 16px cards as in reference
  sheet: 24,
  pill: 999,
};

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  secondary: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
};
