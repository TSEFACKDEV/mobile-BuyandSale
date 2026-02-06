import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import { useAppSelector, useAppDispatch } from '../../../hooks/store';
import { useProducts } from '../../../hooks/useProducts';
import { useSellerReviews } from '../../../hooks/useSellerReviews';
import { useDialog } from '../../../contexts/DialogContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTheme, useThemeColors } from '../../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { logoutAction, getUserProfileAction, updateUserAction } from '../../../store/authentification/actions';
import { getAllForfaitsAction } from '../../../store/forfait/actions';
import {
  selectForfaits,
  selectForfaitStatus,
} from '../../../store/forfait/slice';
import { LoadingType } from '../../../models/store';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../../utils/imageUtils';
import EditProductModal from '../../../components/EditProductModal';
import PaymentHistory from '../../../components/UserProfile/PaymentHistory';
import {
  ForfaitSelectorModal,
  PaymentModal,
  PaymentStatusModal,
} from '../../../components/modals';
import { Loading, ProductCardSkeleton } from '../../../components/LoadingVariants';
import PhoneInput from '../../../components/PhoneInput';
import { styles } from './styles';

type TabType = 'active' | 'expired' | 'pending' | 'payments' | 'profile';

// Constantes pour la hiérarchie des forfaits
const FORFAIT_PRIORITY: Record<string, number> = {
  PREMIUM: 1,
  TOP_ANNONCE: 2,
  URGENT: 3,
};

const FORFAIT_LABELS: Record<string, string> = {
  PREMIUM: 'Premium',
  TOP_ANNONCE: 'Top',
  URGENT: 'Urgent',
};

const FORFAIT_COLORS: Record<string, string> = {
  PREMIUM: '#9333ea',
  TOP_ANNONCE: '#3b82f6',
  URGENT: '#ef4444',
};

// Helper: Trouver le forfait actif d'un produit
// ✅ SIMPLIFICATION: Utiliser activeForfaits du serveur si disponible
const getActiveForfait = (product: any) => {
  // Utiliser activeForfaits du serveur si disponible
  if (product?.activeForfaits && Array.isArray(product.activeForfaits) && product.activeForfaits.length > 0) {
    const firstActive = product.activeForfaits[0];
    // Retourner dans le format attendu par le reste du code
    return {
      isActive: true,
      expiresAt: firstActive.expiresAt,
      forfait: { type: firstActive.type }
    };
  }
  // Fallback: chercher dans productForfaits
  return product?.productForfaits?.find(
    (pf: any) => pf.isActive && new Date(pf.expiresAt) > new Date()
  );
};

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { t, language } = useTranslation();
  const { showDestructive, showSuccess, showWarning, showConfirm } = useDialog();
  const isDark = theme.isDark;

  const authState = useAppSelector((state) => state.authentification);
  const forfaits = useAppSelector(selectForfaits);
  const forfaitStatus = useAppSelector(selectForfaitStatus);
  const user = authState.auth.entities;
  const isAuthenticated = user !== null;
  const isLoggingOut = authState.auth.status === LoadingType.PENDING && !user;
  
  // Récupérer le paramètre initialTab depuis la navigation
  const params = route.params as { initialTab?: string } | undefined;
  const initialTab = params?.initialTab;

  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab === 'ProductTab' ? 'active' : 'profile'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // States pour le boost
  const [showForfaitSelector, setShowForfaitSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [boostingProductId, setBoostingProductId] = useState<string | null>(null);
  const [boostingProductName, setBoostingProductName] = useState<string>('');
  const [selectedForfaitId, setSelectedForfaitId] = useState<string | null>(null);
  const [selectedForfaitType, setSelectedForfaitType] = useState<string | null>(null);
  const [selectedForfaitPrice, setSelectedForfaitPrice] = useState<number>(0);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { products: userProducts, pagination, refetch: refetchUserProducts, deleteProduct: deleteUserProduct, isLoading: isLoadingUserProducts } = useProducts(
    'user',
    { userId: user?.id, page: currentPage, limit: 12 }
  );

  // Update hasMore when pagination changes
  useEffect(() => {
    setHasMore(pagination?.nextPage !== null);
  }, [pagination]);

  // Reset when user changes
  useEffect(() => {
    if (user?.id) {
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [user?.id]);

  const handleLoadMore = () => {
    if (!isLoadingUserProducts && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Filtrer les produits par statut
  const activeProducts = useMemo(() => {
    return userProducts.filter((product: any) => product.status === 'VALIDATED');
  }, [userProducts]);

  const expiredProducts = useMemo(() => {
    return userProducts.filter((product: any) => product.status === 'EXPIRED');
  }, [userProducts]);

  const { products: userPendingProducts, refetch: refetchPendingProducts, isLoading: isLoadingPendingProducts } = useProducts(
    'pending',
    undefined,
    { autoFetch: true }
  );

  const { userRating, totalReviews: userTotalReviews } = useSellerReviews(user?.id, false);

  // Charger les forfaits au montage
  useEffect(() => {
    if (forfaitStatus === 'idle') {
      dispatch(getAllForfaitsAction());
    }
  }, [dispatch, forfaitStatus]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUserProducts(),
        refetchPendingProducts(),
        dispatch(getUserProfileAction()),
        dispatch(getAllForfaitsAction()),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUserProducts, refetchPendingProducts, dispatch]);

  const handleLogout = useCallback(async () => {
    const confirmed = await showDestructive(
      t('userProfile.messages.logoutConfirm'),
      t('userProfile.actions.logout') + ' ?',
      async () => {
        try {
          await dispatch(logoutAction()).unwrap();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' as any, params: { screen: 'Login' } }],
          });
        } catch (error) {
          // TODO: Implémenter système de logging
        }
      }
    );
  }, [dispatch, navigation, showDestructive, t]);

  const handleStartEdit = useCallback(() => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
    setIsEditingProfile(true);
  }, [user]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingProfile(false);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await dispatch(
        updateUserAction({
          id: user.id,
          updates: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            location: profileData.location,
          },
        })
      ).unwrap();

      if (result) {
        showSuccess(t('userProfile.messages.profileUpdateSuccess'), t('userProfile.messages.profileUpdateSuccess'));
        setIsEditingProfile(false);
        // Rafraîchir le profil
        await dispatch(getUserProfileAction());
      }
    } catch (error: any) {
      showWarning(t('userProfile.messages.profileUpdateError'), error.message || t('userProfile.messages.profileUpdateError'));
    }
  }, [profileData, user?.id, dispatch, showSuccess, showWarning]);

  const handleAvatarUpload = useCallback(async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showWarning(t('userProfile.messages.permissionDenied'), t('userProfile.messages.permissionGallery'));
        return;
      }

      // Ouvrir le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingAvatar(true);

      // Créer le FormData
      const formData = new FormData();
      
      // Ajouter l'image
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('avatar', {
        uri: asset.uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      // Ajouter les champs requis
      formData.append('firstName', user!.firstName ?? '');
      formData.append('lastName', user!.lastName);
      formData.append('email', user!.email);
      if (user!.phone) {
        formData.append('phone', user!.phone);
      }

      // TODO: Implémenter updateUserAvatarAction dans le store mobile
      // Pour l'instant, on fait l'appel direct
      const API_CONFIG = require('../../../config/api.config').default;
      const fetchWithAuth = require('../../../utils/fetchWithAuth').default;

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/user/${user!.id}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Échec de la mise à jour de l\'avatar');
      }

      showSuccess(t('userProfile.messages.avatarUpdateSuccess'), t('userProfile.messages.avatarUpdateSuccess'));
      await dispatch(getUserProfileAction());
    } catch (error: any) {
      showWarning(t('userProfile.messages.avatarUpdateError'), error.message || t('userProfile.messages.avatarUpdateError'));
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, dispatch]);

  // Handlers pour le boost
  const handleBoostProduct = useCallback(async (productId: string, productName: string) => {
    const product = userProducts.find((p: any) => p.id === productId);
    
    if (!product) {
      showWarning(t('userProfile.messages.error'), t('userProfile.messages.productNotFound'));
      return;
    }
    
    const activeForfait = getActiveForfait(product);
    const currentForfaitType = activeForfait?.forfait?.type;
    
    // Vérifier si l'annonce a déjà le forfait PREMIUM (niveau max)
    if (currentForfaitType === 'PREMIUM') {
      showWarning(
        t('userProfile.messages.maxForfaitReached'),
        t('userProfile.messages.maxForfaitMessage')
      );
      return;
    }
    
    // Si l'annonce a un forfait actif, informer l'utilisateur
    if (currentForfaitType) {
      const currentPriority = FORFAIT_PRIORITY[currentForfaitType];
      const availableForfaits = currentPriority === 2 
        ? t('userProfile.messages.premiumOnly')
        : t('userProfile.messages.topOrPremium');
      
      await showConfirm(
        t('userProfile.messages.upgradeForfait'),
        `${language === 'fr' 
          ? `Cette annonce possède actuellement le forfait ${FORFAIT_LABELS[currentForfaitType]}.\n\nVous pouvez la booster avec : ${availableForfaits}`
          : `This ad currently has the ${FORFAIT_LABELS[currentForfaitType]} package.\n\nYou can boost it with: ${availableForfaits}`}`,
        () => {
          setBoostingProductId(productId);
          setBoostingProductName(productName);
          setShowForfaitSelector(true);
        }
      );
    } else {
      // Pas de forfait actif, permettre tous les forfaits
      setBoostingProductId(productId);
      setBoostingProductName(productName);
      setShowForfaitSelector(true);
    }
  }, [userProducts]);

  const handleForfaitSelected = useCallback((forfaitType: string, forfaitId: string) => {
    try {
      if (!boostingProductId) {
        throw new Error('ID du produit non disponible');
      }

      const selectedForfait = Array.isArray(forfaits) ? forfaits.find((f: any) => f.id === forfaitId) : null;
      if (!selectedForfait) {
        throw new Error(`Forfait avec ID ${forfaitId} non trouvé`);
      }

      setSelectedForfaitId(forfaitId);
      setSelectedForfaitType(forfaitType);
      setSelectedForfaitPrice(selectedForfait.price);
      setShowForfaitSelector(false);
      setShowPaymentModal(true);
    } catch (error: any) {
      showWarning(t('userProfile.messages.error'), error.message);
      setShowForfaitSelector(false);
    }
  }, [boostingProductId, forfaits]);

  const handleSkipForfait = useCallback(() => {
    setShowForfaitSelector(false);
    setBoostingProductId(null);
    setBoostingProductName('');
  }, []);

  const handlePaymentInitiated = useCallback((paymentId: string) => {
    setCurrentPaymentId(paymentId);
    setShowPaymentModal(false);
    setShowPaymentStatusModal(true);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setShowPaymentStatusModal(false);
    setShowPaymentModal(false);
    setShowForfaitSelector(false);
    setBoostingProductId(null);
    setBoostingProductName('');
    setSelectedForfaitId(null);
    setSelectedForfaitType(null);
    setSelectedForfaitPrice(0);
    setCurrentPaymentId(null);
    
    refetchUserProducts();
    navigation.navigate('HomeTab' as never);
  }, [refetchUserProducts, navigation]);

  const handlePaymentError = useCallback(() => {
    setShowPaymentStatusModal(false);
    setShowPaymentModal(false);
    setShowForfaitSelector(false);
    setBoostingProductId(null);
    setBoostingProductName('');
    setSelectedForfaitId(null);
    setSelectedForfaitType(null);
    setSelectedForfaitPrice(0);
    setCurrentPaymentId(null);
    
    navigation.navigate('HomeTab' as never);
  }, [navigation]);

  const handlePaymentCancel = useCallback(() => {
    setShowPaymentModal(false);
    setShowPaymentStatusModal(false);
    setShowForfaitSelector(false);
    setBoostingProductId(null);
    setBoostingProductName('');
    setSelectedForfaitId(null);
    setSelectedForfaitType(null);
    setSelectedForfaitPrice(0);
    setCurrentPaymentId(null);
  }, []);

  const handleReactivateProduct = useCallback(async (productId: string, productName: string) => {
    const confirmed = await showConfirm(
      t('userProfile.messages.reactivateConfirm'),
      `${t('userProfile.messages.reactivateMessage')} "${productName}" ?`,
      async () => {
        try {
          const API_CONFIG = require('../../../config/api.config').default;
          const fetchWithAuth = require('../../../utils/fetchWithAuth').default;

          const response = await fetchWithAuth(
            `${API_CONFIG.BASE_URL}/product/${productId}/reactivate`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la réactivation');
          }

          showSuccess(
            t('userProfile.messages.reactivateSuccess'),
            t('userProfile.messages.reactivateSuccessMessage')
          );
          await refetchUserProducts();
        } catch (error: any) {
          showWarning(
            t('userProfile.messages.reactivateError'),
            error.message || t('userProfile.messages.reactivateError')
          );
        }
      }
    );
  }, [showConfirm, showSuccess, showWarning, refetchUserProducts, t]);

  const handleDeleteProduct = useCallback(async (productId: string, productName: string) => {
    const confirmed = await showDestructive(
      t('userProfile.messages.deleteConfirm'),
      `${t('userProfile.messages.deleteMessage')} "${productName}" ?`,
      async () => {
        try {
          const API_CONFIG = require('../../../config/api.config').default;
          const fetchWithAuth = require('../../../utils/fetchWithAuth').default;

          const response = await fetchWithAuth(
            `${API_CONFIG.BASE_URL}/product/${productId}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erreur lors de la suppression');
          }

          showSuccess(
            t('userProfile.messages.deleteSuccess'),
            t('userProfile.messages.deleteSuccessMessage')
          );

          await refetchUserProducts();
        } catch (error: any) {
          showWarning(
            t('userProfile.messages.deleteError'),
            error.message || 'Une erreur est survenue'
          );
        }
      }
    );
  }, [showDestructive, showSuccess, showWarning, refetchUserProducts, t]);

  if (!isAuthenticated || !user) {
    return <Loading fullScreen message="Chargement du profil..." />;
  }

  if (isLoggingOut) {
    return <Loading fullScreen message="Déconnexion en cours..." />;
  }

  const tabs = [
    { id: 'active' as TabType, label: t('userProfile.tabs.activeProducts'), icon: 'cube-outline', count: pagination?.validatedCount !== undefined ? pagination.validatedCount : activeProducts.length },
    { id: 'expired' as TabType, label: t('userProfile.tabs.expiredProducts'), icon: 'archive-outline', count: pagination?.expiredCount !== undefined ? pagination.expiredCount : expiredProducts.length },
    { id: 'pending' as TabType, label: t('userProfile.tabs.pendingProducts'), icon: 'time-outline', count: userPendingProducts.length },
    { id: 'payments' as TabType, label: t('userProfile.tabs.payments'), icon: 'card-outline', count: null },
    { id: 'profile' as TabType, label: t('userProfile.tabs.profile'), icon: 'person-outline', count: null },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name={i < Math.floor(rating) ? 'star' : 'star-outline'}
            size={16}
            color="#FACC15"
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={[colors.primary]} />
          }
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleAvatarUpload}
              disabled={isUploadingAvatar}
            >
              <View style={styles.avatar}>
                {isUploadingAvatar ? (
                  <ActivityIndicator size="large" color="#FFFFFF" />
                ) : user.avatar && user.avatar !== 'undefined' && user.avatar !== 'null' ? (
                  <Image
                    source={{ uri: getImageUrl(user.avatar, 'avatar') }}
                    style={styles.avatarImage}
                    onError={() => {
                      // Si l'image ne charge pas, on affichera les initiales
                    }}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </Text>
                )}
              </View>
              {!isUploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <Icon name="camera" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, isDark && styles.userNameDark]}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={[styles.userEmail, isDark && styles.userEmailDark]}>
                {user.email}
              </Text>
              {user.location && (
                <Text style={[styles.userLocation, isDark && styles.userLocationDark]}>
                  📍 {user.location}
                </Text>
              )}
              <View style={styles.ratingContainer}>
                {renderStars(userRating)}
                <Text style={[styles.ratingValue, isDark && styles.ratingValueDark]}>
                  {userRating > 0 ? userRating.toFixed(1) : '0.0'}
                </Text>
                <Text style={[styles.ratingCount, isDark && styles.ratingCountDark]}>
                  ({userTotalReviews > 0 ? `${userTotalReviews} ${t('userProfile.stats.reviews')}` : t('userProfile.stats.noReviews')})
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.memberSince, isDark && styles.memberSinceDark]}>
            <Text style={[styles.memberSinceLabel, isDark && styles.memberSinceLabelDark]}>
              {t('userProfile.profile.memberSince')}
            </Text>
            <Text style={[styles.memberSinceDate, isDark && styles.memberSinceDateDark]}>
              {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
          <View style={[styles.tabsList, isDark && styles.tabsListDark]}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Icon name={tab.icon} size={18} color={isActive ? '#2563EB' : isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text
                    style={[
                      styles.tabText,
                      isDark && styles.tabTextDark,
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {tab.count !== null && (
                    <View
                      style={[
                        styles.tabBadge,
                        isDark && styles.tabBadgeDark,
                        isActive && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          isDark && styles.tabBadgeTextDark,
                          isActive && styles.tabBadgeTextActive,
                        ]}
                      >
                        {tab.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Content */}
        <View style={[styles.tabContent, isDark && styles.tabContentDark]}>
          {activeTab === 'active' && (
            <View>
              <View style={styles.tabHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  {t('userProfile.labels.myActiveAds')} ({user?._count?.products || activeProducts.length})
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => (navigation as any).navigate('PostAd')}
                >
                  <Icon name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>{t('userProfile.actions.create')}</Text>
                </TouchableOpacity>
              </View>
              {isLoadingUserProducts && currentPage === 1 ? (
                <View style={styles.productsGrid}>
                  <ProductCardSkeleton count={4} />
                </View>
              ) : activeProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="cube-outline" size={64} color="#9CA3AF" />
                  <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                    {t('userProfile.emptyStates.noActiveAds')}
                  </Text>
                  <Text style={[styles.emptyStateDescription, isDark && styles.emptyStateDescriptionDark]}>
                    {t('userProfile.messages.createFirstAd')}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => (navigation as any).navigate('PostAd')}
                  >
                    <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyStateButtonText}>{t('userProfile.messages.createFirstAdButton')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.productsGrid}>
                    {activeProducts.map((product: any) => {
                      const activeForfait = getActiveForfait(product);
                      const forfaitType = activeForfait?.forfait?.type;
                      
                      return (
                        <View key={product.id} style={[styles.productCard, isDark && styles.productCardDark]}>
                          <Image
                            source={{ 
                              uri: product.images?.[0] 
                                ? getImageUrl(product.images[0], 'product') 
                                : PLACEHOLDER_IMAGE 
                            }}
                            style={styles.productImage}
                          />
                          {/* Badge forfait */}
                          {forfaitType && (
                            <View 
                              style={[
                                styles.forfaitBadge, 
                                { backgroundColor: FORFAIT_COLORS[forfaitType] }
                              ]}
                            >
                              <Icon name="star" size={10} color="#FFFFFF" />
                              <Text style={styles.forfaitBadgeText}>
                                {FORFAIT_LABELS[forfaitType]}
                              </Text>
                            </View>
                          )}
                          <View style={styles.productInfo}>
                            <Text style={[styles.productName, isDark && styles.productNameDark]} numberOfLines={2}>
                              {product.name}
                            </Text>
                            <Text style={[styles.productPrice, isDark && styles.productPriceDark]}>
                              {product.price.toLocaleString()} FCFA
                            </Text>
                            <View style={styles.productActions}>
                              <TouchableOpacity
                                style={styles.productActionButton}
                                onPress={() => {
                                  navigation.navigate('ProductDetails', { productId: product.id });
                                }}
                              >
                                <Icon name="eye-outline" size={18} color={colors.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.productActionButton}
                                onPress={() => {
                                  setEditingProductId(product.id);
                                  setShowEditModal(true);
                                }}
                              >
                                <Icon name="create-outline" size={18} color="#FACC15" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.productActionButton}
                                onPress={() => showDestructive(
                                  t('userProfile.messages.confirmation'),
                                  `${t('userProfile.messages.deleteConfirmText')} "${product.name}" ?`,
                                  async () => {
                                    try {
                                      await deleteUserProduct(product.id);
                                      showSuccess(t('userProfile.messages.success'), t('userProfile.messages.productDeleted'));
                                      await refetchUserProducts();
                                    } catch (error: any) {
                                      showWarning(t('userProfile.messages.error'), error.message || t('userProfile.messages.deleteFailed'));
                                    }
                                  }
                                )}
                              >
                                <Icon name="trash-outline" size={18} color="#EF4444" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.productActionButton}
                                onPress={() => handleBoostProduct(product.id, product.name)}
                                disabled={forfaitType === 'PREMIUM'}
                              >
                                <Icon 
                                  name="rocket-outline" 
                                  size={18} 
                                  color={forfaitType === 'PREMIUM' ? '#9CA3AF' : '#10B981'} 
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={handleLoadMore}
                      disabled={isLoadingUserProducts}
                    >
                      {isLoadingUserProducts ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <>
                          <Icon name="add-circle-outline" size={20} color={colors.primary} />
                          <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                            {language === 'fr' ? 'Charger plus' : 'Load more'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {activeTab === 'expired' && (
            <View>
              <View style={styles.tabHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  {t('userProfile.labels.expiredAds')} ({expiredProducts.length})
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => (navigation as any).navigate('PostAd')}
                >
                  <Icon name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>{t('userProfile.actions.create')}</Text>
                </TouchableOpacity>
              </View>
              {isLoadingUserProducts ? (
                <View style={styles.productsGrid}>
                  <ProductCardSkeleton count={4} />
                </View>
              ) : expiredProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="archive-outline" size={64} color="#9CA3AF" />
                  <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                    {t('userProfile.emptyStates.noExpiredAds')}
                  </Text>
                  <Text style={[styles.emptyStateDescription, isDark && styles.emptyStateDescriptionDark]}>
                    {t('userProfile.messages.noExpiredAdsInfo')}
                  </Text>
                </View>
              ) : (
                <View style={styles.productsGrid}>
                  {expiredProducts.map((product: any) => (
                    <View key={product.id} style={[styles.productCard, isDark && styles.productCardDark]}>
                      <Image
                        source={{ 
                          uri: product.images?.[0] 
                            ? getImageUrl(product.images[0], 'product') 
                            : PLACEHOLDER_IMAGE 
                        }}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productName, isDark && styles.productNameDark]} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text style={[styles.productPrice, isDark && styles.productPriceDark]}>
                          {product.price.toLocaleString()} FCFA
                        </Text>
                        <View style={styles.productActions}>
                          <TouchableOpacity
                            style={styles.productActionButton}
                            onPress={() => {
                              navigation.navigate('ProductDetails', { productId: product.id });
                            }}
                          >
                            <Icon name="eye-outline" size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.productActionButton, { backgroundColor: '#10B981' }]}
                            onPress={() => handleReactivateProduct(product.id, product.name)}
                          >
                            <Icon name="refresh-outline" size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.productActionButton, { backgroundColor: '#EF4444' }]}
                            onPress={() => handleDeleteProduct(product.id, product.name)}
                          >
                            <Icon name="trash-outline" size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'pending' && (
            <View>
              <View style={styles.tabHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  {t('userProfile.labels.pendingAds')} ({userPendingProducts.length})
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => (navigation as any).navigate('PostAd')}
                >
                  <Icon name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>{t('userProfile.actions.create')}</Text>
                </TouchableOpacity>
              </View>
              {isLoadingPendingProducts ? (
                <View style={styles.productsGrid}>
                  <ProductCardSkeleton count={4} />
                </View>
              ) : userPendingProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="time-outline" size={64} color="#9CA3AF" />
                  <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                    {t('userProfile.emptyStates.noPendingAds')}
                  </Text>
                  <Text style={[styles.emptyStateDescription, isDark && styles.emptyStateDescriptionDark]}>
                    {t('userProfile.messages.pendingAdsInfo')}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => (navigation as any).navigate('PostAd')}
                  >
                    <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyStateButtonText}>{t('userProfile.actions.createAd')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.productsGrid}>
                  {userPendingProducts.map((product: any) => (
                    <View key={product.id} style={[styles.productCard, isDark && styles.productCardDark]}>
                      <Image
                        source={{ 
                          uri: product.images?.[0] 
                            ? getImageUrl(product.images[0], 'product') 
                            : PLACEHOLDER_IMAGE 
                        }}
                        style={styles.productImage}
                      />
                      <View style={styles.pendingBadge}>
                        <Icon name="time-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.pendingBadgeText}>{t('userProfile.labels.pending')}</Text>
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={[styles.productName, isDark && styles.productNameDark]} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text style={[styles.productPrice, isDark && styles.productPriceDark]}>
                          {product.price.toLocaleString()} FCFA
                        </Text>
                        <View style={styles.productActions}>
                          <TouchableOpacity
                            style={styles.productActionButton}
                            onPress={() => {
                              navigation.navigate('ProductDetails', { productId: product.id });
                            }}
                          >
                            <Icon name="eye-outline" size={18} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'payments' && (
            <PaymentHistory userId={user.id} />
          )}

          {activeTab === 'profile' && (
            <View>
              <View style={styles.profileHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  {t('userProfile.labels.personalInfo')}
                </Text>
                {!isEditingProfile && (
                  <TouchableOpacity style={styles.editProfileButton} onPress={handleStartEdit}>
                    <Icon name="create-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>

              {isEditingProfile ? (
                <View style={styles.profileForm}>
                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.firstName')}
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.firstName}
                      onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
                      placeholder={t('userProfile.profile.firstName')}
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.lastName')}
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.lastName}
                      onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                      placeholder={t('userProfile.profile.lastName')}
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.email')}
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.email}
                      onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                      placeholder={t('userProfile.profile.email')}
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.profileField}>
                    <PhoneInput
                      label={t('userProfile.profile.phone')}
                      value={profileData.phone}
                      onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                      placeholder="6XX XX XX XX"
                    />
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.location')}
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.location}
                      onChangeText={(text) => setProfileData({ ...profileData, location: text })}
                      placeholder={t('userProfile.profile.locationPlaceholder')}
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </View>

                  <View style={styles.profileActions}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Text style={styles.profileButtonText}>{t('userProfile.actions.saveProfile')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                      <Text style={styles.profileButtonText}>{t('userProfile.actions.cancel')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileForm}>
                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.labels.fullName')}
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.firstName} {user.lastName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.email')}
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.phone')}
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.phone || t('userProfile.messages.notSpecified')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.location')}
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.location || t('userProfile.messages.notSpecified')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      {t('userProfile.profile.memberSince')}
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {formatDate(user.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.settingsSection, isDark && styles.settingsSectionDark]}>
                    <TouchableOpacity 
                      style={[styles.settingsButton, { backgroundColor: colors.primary }]} 
                      onPress={() => navigation.navigate('Settings' as never)}
                    >
                      <Icon name="settings-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.profileButtonText}>{t('userProfile.tabs.settings')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                      <Icon name="log-out-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.profileButtonText}>{t('userProfile.actions.logout')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        </ScrollView>
      </View>

      {/* Modal d'édition */}
      {editingProductId && (
        <EditProductModal
          visible={showEditModal}
          productId={editingProductId}
          onClose={() => {
            setShowEditModal(false);
            setEditingProductId(null);
          }}
          onSuccess={() => {
            refetchUserProducts();
          }}
        />
      )}

      {/* Modals pour le boost */}
      <ForfaitSelectorModal
        visible={showForfaitSelector}
        forfaits={useMemo(() => {
          if (!Array.isArray(forfaits) || !boostingProductId) return forfaits || [];
          
          const product = userProducts.find((p: any) => p.id === boostingProductId);
          if (!product) return forfaits;
          
          const activeForfait = getActiveForfait(product);
          const currentForfaitType = activeForfait?.forfait?.type;
          
          if (!currentForfaitType) return forfaits;
          
          const currentPriority = FORFAIT_PRIORITY[currentForfaitType];
          
          return forfaits.filter((f: any) => {
            const forfaitTypePriority = FORFAIT_PRIORITY[f.type];
            return forfaitTypePriority < currentPriority;
          });
        }, [forfaits, boostingProductId, userProducts])}
        onSelect={handleForfaitSelected}
        onSkip={handleSkipForfait}
        onClose={() => setShowForfaitSelector(false)}
        productName={boostingProductName || 'votre annonce'}
        isLoading={forfaitStatus === 'loading'}
      />

      <PaymentModal
        visible={showPaymentModal}
        productId={boostingProductId}
        forfaitId={selectedForfaitId}
        forfaitType={selectedForfaitType}
        forfaitPrice={selectedForfaitPrice}
        onPaymentInitiated={handlePaymentInitiated}
        onClose={handlePaymentCancel}
      />

      <PaymentStatusModal
        visible={showPaymentStatusModal}
        paymentId={currentPaymentId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onClose={handlePaymentCancel}
      />
    </KeyboardAvoidingView>
  );
};

export default UserProfile;
