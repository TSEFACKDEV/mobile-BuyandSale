import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import { useThemeColors, useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAppSelector, useAppDispatch } from '../../../hooks/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { useProducts } from '../../../hooks/useProducts';
import { RootNavigationProp } from '../../../types/navigation';

import { selectUserAuthenticated } from '../../../store/authentification/slice';
import { logoutAction } from '../../../store/authentification/actions';
import { updateUserAction } from '../../../store/user/actions';
import { selectForfaits } from '../../../store/forfait/slice';
import { getAllForfaitsAction } from '../../../store/forfait/actions';

import {
  BoostOfferModal,
  ForfaitSelectorModal,
  PaymentModal,
  PaymentStatusModal,
} from '../../../components/modals';

import { styles } from './styles';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  status?: string;
}

type TabType = 'active' | 'pending' | 'profile' | 'settings';

const UserProfile: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { toggleDarkMode, theme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  // Redux state
  const authData = useAppSelector(selectUserAuthenticated);
  const forfaits = useAppSelector(selectForfaits);
  const user = authData?.entities;

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Forfait states
  const [selectedProductForBoost, setSelectedProductForBoost] = useState<Product | null>(null);
  const [showBoostOffer, setShowBoostOffer] = useState(false);
  const [showForfaitSelector, setShowForfaitSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedForfaitId, setSelectedForfaitId] = useState<string | null>(null);
  const [selectedForfaitType, setSelectedForfaitType] = useState<string | null>(null);
  const [selectedForfaitPrice, setSelectedForfaitPrice] = useState<number>(0);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  // Products hooks
  const { products: userProducts, isLoading: isLoadingActive, refetch: refetchActive } = useProducts('user', {
    userId: user?.id,
    limit: 20,
  });

  const { products: pendingProducts, isLoading: isLoadingPending, refetch: refetchPending, deleteProduct } = useProducts('pending', undefined, {
    autoFetch: !!user?.id,
  });

  // Load forfaits
  useEffect(() => {
    if (user?.id && forfaits.length === 0) {
      dispatch(getAllForfaitsAction());
    }
  }, [user?.id, forfaits.length, dispatch]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchActive(), refetchPending()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchActive, refetchPending]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('userProfile.actions.logout'),
      t('userProfile.messages.logoutConfirm'),
      [
        { text: t('userProfile.actions.cancel'), style: 'cancel' },
        {
          text: t('userProfile.actions.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutAction()).unwrap();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          },
        },
      ]
    );
  }, [dispatch, navigation, t]);

  const handleSaveProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      await dispatch(updateUserAction({
        id: user.id,
        data: profileData,
      })).unwrap();

      Alert.alert('Succès', t('userProfile.messages.profileUpdateSuccess'));
      setIsEditingProfile(false);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || t('userProfile.messages.profileUpdateError'));
    }
  }, [user?.id, profileData, dispatch, t]);

  const handleCancelEdit = useCallback(() => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setIsEditingProfile(false);
  }, [user]);

  const handleAvatarPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder aux photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Alert.alert('Info', 'Fonctionnalité de mise à jour d\'avatar à implémenter');
    }
  };

  const handleProductAction = useCallback(async (product: Product, action: 'view' | 'edit' | 'delete' | 'boost') => {
    switch (action) {
      case 'view':
        navigation.navigate('Main', {
          screen: 'HomeTab',
          params: {
            screen: 'ProductDetails',
            params: { productId: product.id },
          },
        });
        break;
      
      case 'edit':
        Alert.alert('Info', 'Édition de produit à implémenter');
        break;
      
      case 'delete':
        Alert.alert(
          t('userProfile.actions.delete'),
          t('userProfile.messages.deleteConfirm'),
          [
            { text: t('userProfile.actions.cancel'), style: 'cancel' },
            {
              text: t('userProfile.actions.delete'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteProduct(product.id);
                  Alert.alert('Succès', t('userProfile.messages.deleteSuccess'));
                  await handleRefresh();
                } catch (error: any) {
                  Alert.alert('Erreur', error.message || t('userProfile.messages.deleteError'));
                }
              },
            },
          ]
        );
        break;
      
      case 'boost':
        setSelectedProductForBoost(product);
        setShowBoostOffer(true);
        break;
    }
  }, [navigation, deleteProduct, t, handleRefresh]);

  // Forfait handlers
  const handleAcceptBoost = useCallback(() => {
    setShowBoostOffer(false);
    setTimeout(() => setShowForfaitSelector(true), 100);
  }, []);

  const handleDeclineBoost = useCallback(() => {
    setShowBoostOffer(false);
    setSelectedProductForBoost(null);
  }, []);

  const handleForfaitSelected = useCallback((forfaitType: string, forfaitId: string) => {
    if (!selectedProductForBoost) return;

    const forfait = forfaits.find((f: any) => f.id === forfaitId);
    if (!forfait) {
      Alert.alert('Erreur', 'Forfait non trouvé');
      return;
    }

    setSelectedForfaitId(forfaitId);
    setSelectedForfaitType(forfaitType);
    setSelectedForfaitPrice(forfait.price);
    setShowForfaitSelector(false);
    setTimeout(() => setShowPaymentModal(true), 100);
  }, [selectedProductForBoost, forfaits]);

  const handlePaymentInitiated = useCallback((paymentId: string) => {
    setCurrentPaymentId(paymentId);
    setShowPaymentModal(false);
    setTimeout(() => setShowPaymentStatusModal(true), 300);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setShowPaymentStatusModal(false);
    Alert.alert('Parfait !', 'Votre annonce est maintenant boostée !', [
      { text: 'OK', onPress: () => handleRefresh() },
    ]);
    setSelectedProductForBoost(null);
  }, [handleRefresh]);

  const handlePaymentError = useCallback(() => {
    setShowPaymentStatusModal(false);
    Alert.alert('Erreur', 'Le paiement a échoué. Veuillez réessayer.');
  }, []);

  // Render functions
  const renderHeader = () => {
    const initials = user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || '?';

    const memberSince = user?.createdAt 
      ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      : 'récemment';

    return (
      <View style={styles.headerSection}>
        {/* Cover Photo */}
        <View style={styles.coverPhoto}>
          <View style={[styles.coverGradient, { backgroundColor: colors.primary }]} />
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleAvatarPick}>
                <Icon name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              <View style={styles.memberSince}>
                <Icon name="calendar-outline" size={12} color={colors.textTertiary} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                  {t('userProfile.profile.memberSince')} {memberSince}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProducts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('userProfile.stats.products')}
              </Text>
            </View>
            <View style={[styles.statItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
              <Text style={styles.statValue}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('userProfile.stats.reviews')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('userProfile.stats.rating')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={() => navigation.navigate('PostAd')}
      >
        <Icon name="add-circle" size={18} color="#FFF" />
        <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
          {t('userProfile.actions.createAd')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={handleLogout}
      >
        <Icon name="log-out-outline" size={18} color={colors.text} />
        <Text style={[styles.actionButtonText, { color: colors.text }]}>
          {t('userProfile.actions.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => {
    const tabs = [
      { 
        id: 'active' as TabType, 
        label: t('userProfile.tabs.activeProducts'), 
        icon: 'checkmark-circle', 
        count: userProducts.length 
      },
      { 
        id: 'pending' as TabType, 
        label: t('userProfile.tabs.pendingProducts'), 
        icon: 'time', 
        count: pendingProducts.length 
      },
      { 
        id: 'profile' as TabType, 
        label: t('userProfile.tabs.profile'), 
        icon: 'person', 
        count: null 
      },
      { 
        id: 'settings' as TabType, 
        label: t('userProfile.tabs.settings'), 
        icon: 'settings', 
        count: null 
      },
    ];

    return (
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && [styles.activeTab, { backgroundColor: `rgba(255, 107, 53, ${colors.isDark ? '0.15' : '0.1'})` }]
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <View style={styles.tabContent}>
              <Icon 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? '#FF6B35' : colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText, 
                { color: colors.textSecondary }, 
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </View>
            {tab.count !== null && tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProduct = (product: Product, isPending: boolean = false) => (
    <View key={product.id} style={[styles.productCard, { backgroundColor: colors.surface }]}>
      <Image
        source={{ uri: product.images[0] || 'https://via.placeholder.com/200' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{product.price} FCFA</Text>
        <View style={styles.productActions}>
          {!isPending && (
            <>
              <TouchableOpacity
                style={[styles.productActionButton, styles.viewButton]}
                onPress={() => handleProductAction(product, 'view')}
              >
                <Icon name="eye-outline" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.productActionButton, styles.boostButton]}
                onPress={() => handleProductAction(product, 'boost')}
              >
                <Icon name="rocket-outline" size={16} color="#D97706" />
              </TouchableOpacity>
            </>
          )}
          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.productActionButton, styles.editButton]}
                onPress={() => handleProductAction(product, 'edit')}
              >
                <Icon name="pencil" size={16} color="#FF6B35" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.productActionButton, styles.deleteButton]}
                onPress={() => handleProductAction(product, 'delete')}
              >
                <Icon name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderActiveProducts = () => {
    if (isLoadingActive) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      );
    }

    if (userProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="cube-outline" size={64} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {t('userProfile.messages.noProducts')}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Commencez à publier vos annonces dès maintenant
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('PostAd')}>
            <Text style={styles.emptyButtonText}>{t('userProfile.actions.createAd')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.productsGrid}>
        {userProducts.map((product) => renderProduct(product, false))}
      </View>
    );
  };

  const renderPendingProducts = () => {
    if (isLoadingPending) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      );
    }

    if (pendingProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="time-outline" size={64} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {t('userProfile.messages.noPendingProducts')}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.productsGrid}>
        {pendingProducts.map((product) => renderProduct(product, true))}
      </View>
    );
  };

  const renderProfileForm = () => (
    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('userProfile.profile.firstName')}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          editable={isEditingProfile}
          value={profileData.firstName}
          onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('userProfile.profile.lastName')}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          editable={isEditingProfile}
          value={profileData.lastName}
          onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('userProfile.profile.email')}
        </Text>
        <TextInput
          style={[styles.input, styles.inputDisabled, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          editable={false}
          value={user?.email}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('userProfile.profile.phone')}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          editable={isEditingProfile}
          value={profileData.phone}
          onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
        />
      </View>

      {isEditingProfile ? (
        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { flex: 1, borderColor: colors.border }]}
            onPress={handleCancelEdit}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {t('userProfile.actions.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { flex: 1 }]}
            onPress={handleSaveProfile}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              {t('userProfile.actions.saveProfile')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => setIsEditingProfile(true)}
        >
          <Icon name="pencil-outline" size={20} color="#FFF" />
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
            {t('userProfile.actions.editProfile')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSettings = () => (
    <View>
      {/* Apparence Section */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Apparence
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: theme.isDark ? 'rgba(255, 107, 53, 0.15)' : '#FFF3E0' }]}>
              <Icon name={theme.isDark ? "moon" : "sunny"} size={22} color="#FF6B35" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {t('userProfile.settings.theme')}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {theme.isDark ? t('userProfile.settings.themeDark') : t('userProfile.settings.themeLight')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: theme.isDark ? '#FF6B35' : '#E0E0E0' }]}
            onPress={toggleDarkMode}
            activeOpacity={0.7}
          >
            <View style={[styles.toggleThumb, theme.isDark ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Langue Section */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Langue
        </Text>

        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: language === 'en' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)' }]}>
              <Icon name="language" size={22} color={language === 'en' ? '#10B981' : '#3B82F6'} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {t('userProfile.settings.language')}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {language === 'fr' ? t('userProfile.settings.languageFr') : t('userProfile.settings.languageEn')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: language === 'en' ? '#10B981' : '#E0E0E0' }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <View style={[styles.toggleThumb, language === 'en' ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'active':
        return renderActiveProducts();
      case 'pending':
        return renderPendingProducts();
      case 'profile':
        return renderProfileForm();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF6B35" />
        }
      >
        {renderHeader()}
        {renderActionButtons()}
        {renderTabs()}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </ScrollView>

      <BoostOfferModal
        visible={showBoostOffer}
        onAccept={handleAcceptBoost}
        onDecline={handleDeclineBoost}
      />

      <ForfaitSelectorModal
        visible={showForfaitSelector}
        forfaits={Array.isArray(forfaits) ? forfaits : []}
        onSelect={handleForfaitSelected}
        onSkip={handleDeclineBoost}
        onClose={() => setShowForfaitSelector(false)}
      />

      <PaymentModal
        visible={showPaymentModal}
        productId={selectedProductForBoost?.id || null}
        forfaitId={selectedForfaitId}
        forfaitType={selectedForfaitType}
        forfaitPrice={selectedForfaitPrice}
        onPaymentInitiated={handlePaymentInitiated}
        onClose={() => setShowPaymentModal(false)}
      />

      <PaymentStatusModal
        visible={showPaymentStatusModal}
        paymentId={currentPaymentId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onClose={() => setShowPaymentStatusModal(false)}
      />
    </View>
  );
};

export default UserProfile;