import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '../../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const PostAds = () => {
  const colors = useThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Icon name="add-circle" size={80} color="#FF6B35" />
        <Text style={[styles.title, { color: colors.text }]}>
          Publier une annonce
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Formulaire de création d'annonce en développement
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
  },
});

export default PostAds;
