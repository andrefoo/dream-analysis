import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Design tokens
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// Define types for our theme
type ColorGradient = string[];

type MoodGradients = {
  peaceful: ColorGradient;
  scary: ColorGradient;
  confusing: ColorGradient;
  exciting: ColorGradient;
  sad: ColorGradient;
  nostalgic: ColorGradient;
  default: ColorGradient;
  [key: string]: ColorGradient;
};

// Color palette
export const COLORS = {
  // Primary color variations
  primary: '#6A5ACD', // Slate blue
  primaryLight: '#8677DE',
  primaryDark: '#5347A0',
  
  // Secondary/accent colors
  secondary: '#f6547b', // Pink 
  secondaryLight: '#FF7B99',
  secondaryDark: '#D43D62',
  
  // UI colors
  background: '#F8F7FF', // Light lavender-ish background
  card: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FFCC00',
  
  // Text colors
  text: {
    primary: '#18181b', // Near-black but softer than #000000
    secondary: '#71717a', // Medium gray
    tertiary: '#a1a1aa', // Light gray
    inverse: '#FFFFFF', // White text for dark backgrounds
    disabled: '#d4d4d8', // Very light gray
  },
  
  // Mood-based gradient sets
  mood: {
    peaceful: ['#60A5FA', '#8B5CF6'], // Blue to purple
    scary: ['#7F1D1D', '#111827'], // Dark red to gray
    confusing: ['#F59E0B', '#9333EA'], // Yellow to purple
    exciting: ['#EC4899', '#F97316'], // Pink to orange
    sad: ['#1E40AF', '#111827'], // Blue to dark gray
    nostalgic: ['#F59E0B', '#DB2777'], // Amber to pink
    default: ['#6A5ACD', '#9333EA'], // Slate blue to purple
  } as MoodGradients
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 6.0,
    elevation: 10,
  },
};

// Helper function to get mood gradient
export const getMoodGradient = (mood: string): string[] => {
  return COLORS.mood[mood] || COLORS.mood.default;
};

// Theme object
export const theme = {
  colors: COLORS,
  spacing: SPACING,
  fontSize: FONT_SIZE,
  radius: RADIUS,
  shadows: SHADOWS,
  dimensions: {
    width,
    height,
  },
};

export default theme; 