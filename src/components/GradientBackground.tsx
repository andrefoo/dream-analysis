import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

interface GradientBackgroundProps {
  children: ReactNode;
  colors?: string[];
  mood?: string;
  style?: ViewStyle;
}

/**
 * GradientBackground component provides a beautiful gradient background
 * that can be tied to mood settings from our theme
 */
const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors,
  mood,
  style,
}) => {
  // If colors are provided, use them directly
  // Otherwise, use the mood to get colors from theme
  const gradientColors = colors || (mood ? theme.colors.mood[mood] : theme.colors.mood.default);
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default GradientBackground; 