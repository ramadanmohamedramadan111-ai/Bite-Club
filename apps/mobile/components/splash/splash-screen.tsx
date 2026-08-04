import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SplashScreenComponent() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run animations in sequence and parallel
    Animated.sequence([
      // 1. Fade in and scale up the logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 2. Slide up and fade in the brand text
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 3. Animate the loading bar width
      Animated.timing(loaderWidth, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false, // width cannot use native driver
      }),
    ]).start();
  }, []);

  const gradientColors =
    scheme === 'dark'
      ? (['#140B07', '#1F110B', '#120A06'] as const)
      : (['#FFF8F5', '#FFEFE7', '#FFF5F0'] as const);

  const brandLogo = require('@/assets/images/brand-logo.png');

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.content}>
        {/* Animated Brand Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={[styles.logoOutline, { borderColor: colors.primary + '1F', backgroundColor: colors.muted }]}>
            <Image source={brandLogo} style={styles.logo} contentFit="contain" />
          </View>
        </Animated.View>

        {/* Animated Text Block */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>BITE</Text>
            <Text style={[styles.title, { color: colors.primary }]}>CLUB</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Social Group Ordering
          </Text>
        </Animated.View>
      </View>

      {/* Loading Progress Indicator at the bottom */}
      <View style={styles.loaderContainer}>
        <View style={[styles.loaderTrack, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.loaderBar,
              {
                backgroundColor: colors.primary,
                width: loaderWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOutline: {
    width: 110,
    height: 110,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for elegant depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 72,
    height: 72,
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    width: '45%',
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  loaderBar: {
    height: '100%',
    borderRadius: 999,
  },
});
