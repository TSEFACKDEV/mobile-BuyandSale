import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const OfflineBanner: React.FC = () => {
  const isConnected = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -40 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, translateY]);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLabel="Vous êtes hors ligne"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>Pas de connexion internet</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: '#B91C1C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;
