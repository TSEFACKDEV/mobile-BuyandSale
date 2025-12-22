import { View, StyleSheet } from 'react-native';
import React from 'react';
import { useThemeColors } from '../../../contexts/ThemeContext';

const Favorites = () => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  return <View style={styles.container}>{/* Content goes here */}</View>;
};

export default Favorites;
