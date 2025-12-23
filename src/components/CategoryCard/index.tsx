import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Category } from '../../store/category/slice';

interface CategoryCardProps {
  category: Category & { icon?: string };
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      (navigation as any).navigate('Products', { categoryId: category.id });
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: 80,
      alignItems: 'center',
      marginRight: 12,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconText: {
      fontSize: 28,
    },
    name: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {category.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;
