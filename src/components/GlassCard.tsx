import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  blurEnabled?: boolean;
}

/**
 * GlassCard component provides a translucent card with blur effect
 * similar to "glassmorphism" design trend
 */
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 50,
  tint = 'default',
  blurEnabled = true,
}) => {
  // If blur is disabled or running on a device/platform that doesn't support BlurView
  if (!blurEnabled) {
    return (
      <View style={[styles.container, styles.fallbackContainer, style]}>
        {children}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={styles.blurView}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  blurView: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fallbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default GlassCard; 