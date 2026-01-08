import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  fetchNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  Notification,
} from '../../../store/notification/actions';
import { LoadingType } from '../../../store/notification/slice';
import { formatRelativeDate } from '../../../utils/dateUtils';
import createStyles from './styles';

const NOTIFICATION_TYPES = {
  WELCOME: { icon: 'hand-left-outline', color: '#4CAF50' },
  PRODUCT: { icon: 'cube-outline', color: '#2196F3' },
  favorite: { icon: 'heart', color: '#FF6B6B' },
  DEFAULT: { icon: 'notifications-outline', color: '#FF6F00' },
};

const Notifications = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  const { items, unreadCount, status } = useAppSelector(
    (state) => state.notification
  );

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Charger les notifications au montage
  useEffect(() => {
  }, [dispatch]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchNotificationsAction());
    setRefreshing(false);
  }, [dispatch]);

  // Marquer toutes comme lues
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Alert.alert(t('notifications.info'), t('notifications.allRead'));
      return;
    }

    Alert.alert(
      t('notifications.markAllAsReadTitle'),
      t('notifications.markAllAsReadMessage'),
      [
        { text: t('notifications.cancel'), style: 'cancel' },
        {
          text: t('notifications.confirm'),
          onPress: async () => {
            await dispatch(markAllAsReadAction());
            await dispatch(fetchNotificationsAction());
          },
        },
      ]
    );
  }, [dispatch, unreadCount, t]);

  // Gérer le clic sur une notification
  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      // Marquer comme lue si non lue
      if (!notification.read) {
        await dispatch(markAsReadAction(notification.id));
      }

      // Navigation vers le lien si présent
      if (notification.link) {
        // Parser le lien pour navigation React Native
        // Formats possibles: /annonce/:id, /products/:id, /product/:id
        if (notification.link.includes('/annonce/') || 
            notification.link.includes('/product/') || 
            notification.link.includes('/products/')) {
          // Extraire l'ID du produit
          const productId = notification.link.split('/').pop();
          if (productId) {
            // Naviguer vers le nested navigator HomeTab puis ProductDetails
            (navigation as any).navigate('MainTab', {
              screen: 'HomeTab',
              params: {
                screen: 'ProductDetails',
                params: { productId }
              }
            });
          }
        } else {
          // Pour d'autres types de liens, on pourrait ajouter d'autres cas ici
          console.log('Type de lien non géré:', notification.link);
        }
      }
    },
    [dispatch, navigation]
  );

  const getNotificationIcon = (type: string | null) => {
    const notifType = type || 'DEFAULT';
    return (
      NOTIFICATION_TYPES[notifType as keyof typeof NOTIFICATION_TYPES] ||
      NOTIFICATION_TYPES.DEFAULT
    );
  };

  const filteredNotifications = items.filter((notif) =>
    filter === 'unread' ? !notif.read : true
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconData = getNotificationIcon(item.type);
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.unreadItem,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        {/* Icône */}
        <View style={[styles.iconContainer, { backgroundColor: iconData.color + '20' }]}>
          <Icon name={iconData.icon} size={24} color={iconData.color} />
        </View>

        {/* Contenu */}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationDate}>
            {formatRelativeDate(item.createdAt)}
          </Text>
        </View>

        {/* Indicateur non lu */}
        {isUnread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>{t('notifications.noNotifications')}</Text>
      <Text style={styles.emptyStateText}>
        {filter === 'unread'
          ? t('notifications.noUnreadNotifications')
          : t('notifications.noNotificationsYet')}
      </Text>
    </View>
  );

  // Loading state
  if (status === LoadingType.LOADING && items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Icon name="checkmark-done" size={20} color={colors.primary} />
            <Text style={styles.markAllText}>{t('notifications.markAllAsRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            {t('notifications.all')} ({items.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.filterTextActive,
            ]}
          >
            {t('notifications.unread')} ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des notifications */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredNotifications.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Notifications;