import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import { useAppSelector, useAppDispatch } from '../../../hooks/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { useProducts } from '../../../hooks/useProducts';
import { useSellerReviews } from '../../../hooks/useSellerReviews';
import { useTheme, useThemeColors } from '../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { logoutAction, getUserProfileAction, updateUserAction } from '../../../store/authentification/actions';
import { LoadingType } from '../../../models/store';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../../utils/imageUtils';
import { normalizePhoneNumber } from '../../../utils/phoneUtils';
import EditProductModal from '../../../components/EditProductModal';
import PaymentHistory from '../../../components/UserProfile/PaymentHistory';
import { Loading, ProductCardSkeleton } from '../../../components/LoadingVariants';
import PhoneInput from '../../../components/PhoneInput';
import { styles } from './styles';

type TabType = 'active' | 'pending' | 'payments' | 'profile';

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const isDark = theme.isDark;

  const authState = useAppSelector((state) => state.authentification);
  const user = authState.auth.entities;
  const isAuthenticated = user !== null;
  const isLoggingOut = authState.auth.status === LoadingType.PENDING && !user;
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ✨ Fonction pour calculer les jours restants d'un forfait
  const calculateRemainingDays = useCallback((expiresAt: string | Date): number => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }, []);

  // ✨ Fonction pour obtenir les forfaits actifs d'un produit triés par priorité
  const getActiveForfaits = useCallback((productForfaits: any[]) => {
    if (!productForfaits || productForfaits.length === 0) return [];

    const now = new Date();
    const FORFAIT_PRIORITY = {
      PREMIUM: 1,
      TOP_ANNONCE: 2,
      URGENT: 3,
    };

    return productForfaits
      .filter((pf: any) => {
        const expiryDate = new Date(pf.expiresAt);
        return pf.isActive && expiryDate > now;
      })
      .sort((a: any, b: any) => {
        const priorityA = FORFAIT_PRIORITY[a.forfait?.type as keyof typeof FORFAIT_PRIORITY] || 999;
        const priorityB = FORFAIT_PRIORITY[b.forfait?.type as keyof typeof FORFAIT_PRIORITY] || 999;
        return priorityA - priorityB;
      });
  }, []);

  // ✨ Composant Badge Forfait
  const ForfaitBadge = useCallback(({ forfait, expiresAt }: { forfait: any, expiresAt: string | Date }) => {
    const remainingDays = calculateRemainingDays(expiresAt);
    const type = forfait?.type;
    
    const badgeConfig = {
      PREMIUM: {
        style: styles.forfaitBadgePremium,
        icon: 'crown',
        label: 'premium',
      },
      TOP_ANNONCE: {
        style: styles.forfaitBadgeTopAnnonce,
        icon: 'trending-up',
        label: 'top',
      },
      URGENT: {
        style: styles.forfaitBadgeUrgent,
        icon: 'flame',
        label: 'urgent',
      },
    };

    const config = badgeConfig[type as keyof typeof badgeConfig];
    if (!config) return null;

    return (
      <View style={[styles.forfaitBadge, config.style]}>
        <Icon name={config.icon} size={12} color="#FFFFFF" />
        <Text style={styles.forfaitBadgeText}>{config.label}</Text>
        {remainingDays > 0 && (
          <Text style={styles.forfaitDaysText}>• {remainingDays}j</Text>
        )}
      </View>
    );
  }, [calculateRemainingDays]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const { products: userProducts, refetch: refetchUserProducts, deleteProduct: deleteUserProduct, isLoading: isLoadingUserProducts } = useProducts(
    'user',
    { userId: user?.id, limit: 12 }
  );

  const { products: userPendingProducts, refetch: refetchPendingProducts, isLoading: isLoadingPendingProducts } = useProducts(
    'pending',
    undefined,
    { autoFetch: true }
  );

  const { userRating, totalReviews: userTotalReviews } = useSellerReviews(user?.id, false);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUserProducts(),
        refetchPendingProducts(),
        dispatch(getUserProfileAction()),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUserProducts, refetchPendingProducts, dispatch]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutAction()).unwrap();
              // Redirection automatique vers Auth/Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as any, params: { screen: 'Login' } }],
              });
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              // En cas d'erreur, on redirige quand même
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as any, params: { screen: 'Login' } }],
              });
            }
          },
        },
      ]
    );
  }, [dispatch, navigation]);

  const handleStartEdit = useCallback(() => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
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
          updates: profileData,
        })
      ).unwrap();

      if (result) {
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        setIsEditingProfile(false);
        // Rafraîchir le profil
        await dispatch(getUserProfileAction());
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour du profil');
    }
  }, [profileData, user?.id, dispatch]);

  const handleAvatarUpload = useCallback(async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie');
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
      formData.append('firstName', user!.firstName);
      formData.append('lastName', user!.lastName);
      formData.append('email', user!.email);
      if (user!.phone) {
        formData.append('phone', user!.phone);
      }

      // TODO: Implémenter updateUserAvatarAction dans le store mobile
      // Pour l'instant, on fait l'appel direct
      const API_CONFIG = require('../../../config/api.config').default;
      const API_ENDPOINTS = require('../../../helpers/api').default;
      const fetchWithAuth = require('../../../utils/fetchWithAuth').default;

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_UPDATE.replace(':id', user!.id)}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Échec de la mise à jour de l\'avatar');
      }

      Alert.alert('Succès', 'Avatar mis à jour avec succès');
      await dispatch(getUserProfileAction());
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour de l\'avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, dispatch]);

  if (!isAuthenticated || !user) {
    return <Loading fullScreen message="Chargement du profil..." />;
  }

  if (isLoggingOut) {
    return <Loading fullScreen message="Déconnexion en cours..." />;
  }

  const tabs = [
    { id: 'active' as TabType, label: 'Actifs', icon: 'cube-outline', count: userProducts.length },
    { id: 'pending' as TabType, label: 'En attente', icon: 'time-outline', count: userPendingProducts.length },
    { id: 'payments' as TabType, label: 'Paiements', icon: 'card-outline', count: null },
    { id: 'profile' as TabType, label: 'Profil', icon: 'person-outline', count: null },
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
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={[colors.primary]} />
        }
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
              <View style={styles.ratingContainer}>
                {renderStars(userRating)}
                <Text style={[styles.ratingValue, isDark && styles.ratingValueDark]}>
                  {userRating > 0 ? userRating.toFixed(1) : '0.0'}
                </Text>
                <Text style={[styles.ratingCount, isDark && styles.ratingCountDark]}>
                  ({userTotalReviews > 0 ? `${userTotalReviews} avis` : 'Aucun avis'})
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.memberSince, isDark && styles.memberSinceDark]}>
            <Text style={[styles.memberSinceLabel, isDark && styles.memberSinceLabelDark]}>
              Membre depuis
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
                  Mes annonces actives ({userProducts.length})
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => (navigation as any).navigate('PostAd')}
                >
                  <Icon name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Créer</Text>
                </TouchableOpacity>
              </View>
              {isLoadingUserProducts ? (
                <View style={styles.productsGrid}>
                  <ProductCardSkeleton count={4} />
                </View>
              ) : userProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="cube-outline" size={64} color="#9CA3AF" />
                  <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                    Aucune annonce active
                  </Text>
                  <Text style={[styles.emptyStateDescription, isDark && styles.emptyStateDescriptionDark]}>
                    Créez votre première annonce pour commencer à vendre
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => (navigation as any).navigate('PostAd')}
                  >
                    <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyStateButtonText}>Créer ma première annonce</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.productsGrid}>
                  {userProducts.map((product: any) => {
                    // Trouver le forfait actif s'il existe
                    const activeForfait = product.productForfaits?.find(
                      (pf: any) => pf.isActive && new Date(pf.expiresAt) > new Date()
                    );
                    const forfaitType = activeForfait?.forfait?.type;
                    
                    // Configuration des couleurs de forfait
                    const forfaitColors: Record<string, string> = {
                      PREMIUM: '#9333ea',
                      TOP_ANNONCE: '#3b82f6',
                      URGENT: '#ef4444',
                    };
                    
                    const forfaitLabels: Record<string, string> = {
                      PREMIUM: 'Premium',
                      TOP_ANNONCE: 'Top',
                      URGENT: 'Urgent',
                    };
                    
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
                              { backgroundColor: forfaitColors[forfaitType] }
                            ]}
                          >
                            <Icon name="star" size={10} color="#FFFFFF" />
                            <Text style={styles.forfaitBadgeText}>
                              {forfaitLabels[forfaitType]}
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
                              onPress={() => Alert.alert(
                                'Confirmation',
                                `Voulez-vous supprimer "${product.name}" ?`,
                                [
                                  { text: 'Annuler', style: 'cancel' },
                                  { 
                                    text: 'Supprimer', 
                                    style: 'destructive',
                                    onPress: async () => {
                                      try {
                                        await deleteUserProduct(product.id);
                                        Alert.alert('Succès', 'Produit supprimé avec succès');
                                        await refetchUserProducts();
                                      } catch (error: any) {
                                        Alert.alert('Erreur', error.message || 'Échec de la suppression');
                                      }
                                    }
                                  }
                                ]
                              )}
                            >
                              <Icon name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.productActionButton}
                              onPress={() => Alert.alert('Info', `Booster le produit ${product.name}`)}
                            >
                              <Icon name="rocket-outline" size={18} color="#10B981" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {activeTab === 'pending' && (
            <View>
              <View style={styles.tabHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  Annonces en attente ({userPendingProducts.length})
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => (navigation as any).navigate('PostAd')}
                >
                  <Icon name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Créer</Text>
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
                    Aucune annonce en attente
                  </Text>
                  <Text style={[styles.emptyStateDescription, isDark && styles.emptyStateDescriptionDark]}>
                    Vos annonces en cours de modération apparaîtront ici
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => (navigation as any).navigate('PostAd')}
                  >
                    <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyStateButtonText}>Créer une annonce</Text>
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
                        <Text style={styles.pendingBadgeText}>En attente</Text>
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
                  Informations personnelles
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
                      Prénom
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.firstName}
                      onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
                      placeholder="Prénom"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      Nom
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.lastName}
                      onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                      placeholder="Nom"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      Email
                    </Text>
                    <TextInput
                      style={[styles.profileInput, isDark && styles.profileInputDark]}
                      value={profileData.email}
                      onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                      placeholder="Email"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.profileField}>
                    <PhoneInput
                      label="Téléphone"
                      value={profileData.phone}
                      onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                      placeholder="6XX XX XX XX"
                    />
                  </View>

                  <View style={styles.profileActions}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Text style={styles.profileButtonText}>Enregistrer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                      <Text style={styles.profileButtonText}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileForm}>
                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      Nom complet
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.firstName} {user.lastName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      Email
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      Téléphone
                    </Text>
                    <View style={[styles.profileValue, isDark && styles.profileValueDark]}>
                      <Text style={[styles.profileValueText, isDark && styles.profileValueTextDark]}>
                        {user.phone || 'Non renseigné'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileField}>
                    <Text style={[styles.profileLabel, isDark && styles.profileLabelDark]}>
                      Membre depuis
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
                      <Text style={styles.profileButtonText}>Paramètres</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                      <Icon name="log-out-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.profileButtonText}>Se déconnecter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

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
    </View>
  );
};

export default UserProfile;
