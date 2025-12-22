import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../contexts/ThemeContext';
import COLORS from '../../pages/colors';

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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      paddingTop: 40,
      paddingBottom: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      marginRight: 12,
      padding: 8,
    },
    titleSection: {
      flex: 1,
    },
    appTitle: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
      fontStyle: 'italic',

    },
    titleText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 16,
    },
    iconButton: {
      padding: 8,
      borderRadius: 8,
    },
    orangeText: {
      color: COLORS.primary,
    },
    darkBlueText: {
      color: COLORS.secondary,
    },
  });

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
