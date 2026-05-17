import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
}

const BRAND = '#EA580C';

const Logo: React.FC<LogoProps> = ({ size = 18, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.wordmark, { fontSize: size }]} numberOfLines={1}>
        BuyAndSale
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    color: BRAND,
    fontWeight: '700',
  },
});

export default Logo;
