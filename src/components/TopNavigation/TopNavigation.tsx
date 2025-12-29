import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../contexts/ThemeContext';
import createStyles from './style';

interface TopNavigationProps {
  showBackButton?: boolean;
  title?: string;
  onBackPress?: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  showBackButton = false,
  title,
  onBackPress,
}) => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleFavoritesPress = () => {
    navigation.navigate('Favorites' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('UserProfile' as never);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Icon name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        {!title && !showBackButton && (
          <View style={styles.titleSection}>
            <Text style={styles.appTitle}>
              <Text style={styles.orangeText}>Buy</Text>
              <Text style={styles.darkBlueText}>&Sale</Text>
            </Text>
          </View>
        )}

        {title && (
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}
      </View>

      {!showBackButton && (
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFavoritesPress}
            activeOpacity={0.7}
          >
            <Icon name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Icon name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <Icon name="person-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TopNavigation;
