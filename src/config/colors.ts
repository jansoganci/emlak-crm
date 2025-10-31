export const COLORS = {
  primary: {
    DEFAULT: 'blue-600',
    hex: '#2563eb',
    light: 'blue-500',
    dark: 'blue-700',
    darker: 'blue-800',
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    bgGradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
    bgGradientHover: 'hover:from-blue-700 hover:to-blue-800',
    text: 'text-blue-600',
    textLight: 'text-blue-700',
    border: 'border-blue-300',
    borderHover: 'hover:border-blue-400',
    shadow: 'shadow-blue-500/30',
    hover: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300',
  },

  secondary: {
    DEFAULT: 'slate-500',
    hex: '#64748b',
    bg: 'bg-slate-500',
    bgLight: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-500',
  },

  success: {
    DEFAULT: 'green-600',
    hex: '#16a34a',
    light: 'green-500',
    dark: 'green-700',
    darker: 'green-800',
    bg: 'bg-green-600',
    bgLight: 'bg-green-50',
    bgGradient: 'bg-gradient-to-r from-green-500 to-green-600',
    bgGradientHover: 'hover:from-green-700 hover:to-green-800',
    text: 'text-green-600',
    border: 'border-green-400',
  },

  danger: {
    DEFAULT: 'red-600',
    hex: '#dc2626',
    light: 'red-500',
    dark: 'red-700',
    bg: 'bg-red-600',
    bgLight: 'bg-red-50',
    bgGradient: 'bg-gradient-to-r from-red-500 to-red-600',
    text: 'text-red-600',
    textDark: 'text-red-700',
    border: 'border-red-300',
    borderLight: 'border-red-200',
    borderHover: 'hover:border-red-400',
    hover: 'hover:bg-red-700',
  },

  warning: {
    DEFAULT: 'orange-500',
    hex: '#f97316',
    light: 'orange-500',
    dark: 'orange-600',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    bgGradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
    bgGradientBr: 'bg-gradient-to-br from-orange-50 to-amber-50',
    text: 'text-orange-600',
    textDark: 'text-orange-700',
    textDarker: 'text-orange-900',
    border: 'border-orange-200',
    borderHover: 'border-orange-300',
    hoverBg: 'hover:bg-orange-100',
    hover: 'hover:bg-orange-50 hover:text-orange-600',
  },

  info: {
    DEFAULT: 'sky-500',
    hex: '#0ea5e9',
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-50',
    text: 'text-sky-600',
  },

  accent: {
    DEFAULT: 'teal-600',
    hex: '#0d9488',
    light: 'teal-500',
    dark: 'teal-600',
    bgGradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
    bgGradientR: 'bg-gradient-to-r from-teal-500 to-teal-600',
    text: 'text-teal-600',
  },

  background: {
    DEFAULT: 'slate-50',
    hex: '#f8fafc',
    bg: 'bg-slate-50',
    bgGray: 'bg-gray-50',
    bgGradient: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50',
  },

  card: {
    DEFAULT: 'white',
    hex: '#ffffff',
    bg: 'bg-white',
    bgBlur: 'bg-white/80 backdrop-blur-sm',
  },

  border: {
    DEFAULT: 'gray-200',
    hex: '#e5e7eb',
    light: 'border-gray-100',
    DEFAULT_class: 'border-gray-200',
    dark: 'border-gray-300',
    color: 'border-gray-200',
  },

  text: {
    DEFAULT: 'slate-700',
    hex: '#334155',
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    disabled: 'text-gray-400',
    light: 'text-gray-300',
    white: 'text-white',
  },

  muted: {
    DEFAULT: 'slate-500',
    hex: '#64748b',
    light: 'slate-400',
    bg: 'bg-slate-500',
    text: 'text-slate-500',
    textLight: 'text-gray-500',
  },

  disabled: {
    DEFAULT: 'slate-300',
    hex: '#cbd5e1',
    bg: 'bg-slate-300',
    text: 'text-slate-300',
  },

  gray: {
    bg50: 'bg-gray-50',
    bg100: 'bg-gray-100',
    bg200: 'bg-gray-200',
    border100: 'border-gray-100',
    border200: 'border-gray-200',
    text500: 'text-gray-500',
    text600: 'text-gray-600',
    text700: 'text-gray-700',
    text900: 'text-gray-900',
  },

  status: {
    empty: {
      gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-600',
    },
    occupied: {
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      bg: 'bg-green-600',
    },
    active: {
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      bg: 'bg-green-600',
    },
    inactive: {
      gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
      bg: 'bg-gray-600',
    },
    archived: {
      gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
      bg: 'bg-gray-600',
    },
    assigned: {
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      bg: 'bg-green-600',
    },
    unassigned: {
      gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
      bg: 'bg-gray-600',
    },
  },

  dashboard: {
    properties: {
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
    occupied: {
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    tenants: {
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    contracts: {
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  },

  reminders: {
    overdue: 'bg-red-600',
    upcoming: 'bg-blue-600',
    scheduled: 'bg-blue-600',
    expired: 'bg-gray-600',
  },
} as const;

export const getPrimaryButtonClasses = () =>
  `${COLORS.primary.bgGradient} ${COLORS.primary.bgGradientHover} ${COLORS.primary.shadow}`;

export const getSuccessButtonClasses = () =>
  `${COLORS.success.bgGradient} ${COLORS.success.bgGradientHover}`;

export const getStatusBadgeClasses = (status: 'empty' | 'occupied' | 'active' | 'inactive' | 'archived' | 'assigned' | 'unassigned') =>
  `${COLORS.status[status].gradient} ${COLORS.text.white}`;

export const getCardClasses = () =>
  `shadow-lg ${COLORS.border.color} ${COLORS.card.bgBlur} hover:shadow-xl transition-shadow`;

export const getHoverClasses = (type: 'primary' | 'danger' | 'warning' | 'success') => {
  const colors = {
    primary: COLORS.primary.hover,
    danger: `${COLORS.danger.bgLight} ${COLORS.danger.text} ${COLORS.danger.border}`,
    warning: COLORS.warning.hover,
    success: `${COLORS.success.bgLight} ${COLORS.success.text} ${COLORS.success.border}`,
  };
  return colors[type];
};
