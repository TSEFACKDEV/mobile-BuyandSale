import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../hooks/store';
import { getImageUrl } from '../../utils/imageUtils';
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
  
  const authState = useAppSelector((state) => state.authentification);
  const user = authState.auth.entities;

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
    (navigation as any).navigate('HomeTab', {
      screen: 'UserProfile'
    });
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

          {user && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              {user.avatar && user.avatar !== 'undefined' && user.avatar !== 'null' ? (
                <Image
                  source={{ uri: getImageUrl(user.avatar, 'avatar') }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default TopNavigation;
