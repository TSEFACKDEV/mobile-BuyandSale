import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Category } from '../../store/category/slice';
import createStyles from './style';

interface CategoryCardProps {
  category: Category & { icon?: string };
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      (navigation as any).navigate('Products', { categoryId: category.id });
    }
  };

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
