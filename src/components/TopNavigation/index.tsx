import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useAppSelector, useAppDispatch } from '../../hooks/store';
import { fetchNotificationsAction } from '../../store/notification/actions';
import { selectValidFavoritesCount } from '../../store/favorite/slice';
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
  const dispatch = useAppDispatch();

  // Récupérer le compteur de notifications non lues
  const { unreadCount } = useAppSelector((state) => state.notification);

  // Récupérer le compteur de favoris
  const favoritesCount = useAppSelector(selectValidFavoritesCount);

  // Animation pour le badge favoris
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (favoritesCount > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 50,
          bounciness: 20,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 20,
        }),
      ]).start();
    }
  }, [favoritesCount, scaleAnim]);

  // Charger les notifications au montage
  React.useEffect(() => {
    dispatch(fetchNotificationsAction());
  }, [dispatch]);

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
    (navigation as any).navigate('HomeTab', {
      screen: 'Favorites'
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
            {favoritesCount > 0 && (
              <Animated.View style={[styles.notificationBadge, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.notificationBadgeText}>
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Icon name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TopNavigation;
