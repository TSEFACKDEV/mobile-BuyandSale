import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Share,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { toggleFavoriteAction } from '../../../store/favorite/actions';
import { 
  recordProductViewAction, 
  getProductByIdAction 
} from '../../../store/product/actions';
import { 
  selectCurrentProduct, 
  selectCurrentProductStatus,
  clearCurrentProduct 
} from '../../../store/product/slice';
import { getImageUrl } from '../../../utils/imageUtils';
import { normalizePhoneForWhatsApp } from '../../../utils/phoneUtils';
import { HomeStackParamList } from '../../../types/navigation';
import createStyles from './style';

type ProductDetailsRouteProp = RouteProp<HomeStackParamList, 'ProductDetails'>;

const { width } = Dimensions.get('window');

const ProductDetails = () => {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ProductDetailsRouteProp>();
  const dispatch = useAppDispatch();

  const styles = createStyles(theme);

  const { productId } = route.params;

  // États locaux
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const carouselRef = useRef<ScrollView>(null);
  const modalCarouselRef = useRef<ScrollView>(null);

  // Récupérer le produit depuis le store
  const product = useAppSelector(selectCurrentProduct);
  const productStatus = useAppSelector(selectCurrentProductStatus);
  const allFavorites = useAppSelector((state) => state.favorite.data || []);

  // Si erreur d'authentification, rediriger vers login
  useEffect(() => {
    if (productStatus === 'failed' && !product) {
      Alert.alert(
        t('productDetails.sessionExpired'),
        t('productDetails.sessionExpiredMessage'),
        [
          {
            text: t('productDetails.reconnect'),
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as never }],
              });
            }
          }
        ]
      );
    }
  }, [productStatus, product, navigation, t]);

  const isFavorite = product?.id
    ? allFavorites.some((fav) => fav.productId === product.id)
    : false;

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = useAppSelector((state) => state.authentification.auth.entities !== null);

  // Charger le produit au montage SEULEMENT si l'utilisateur est authentifié
  useEffect(() => {
    if (productId && isAuthenticated) {
      dispatch(getProductByIdAction(productId));
    }

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, isAuthenticated, dispatch]);

  // Helpers
  const formatPrice = (price: number) => {
    return `${price.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return t('productDetails.today');
    if (diffInDays === 1) return t('productDetails.yesterday');
    if (diffInDays < 7) return t('productDetails.daysAgo').replace('{days}', diffInDays.toString());
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' });
  };

  const formatState = (state: string) => {
    const stateMap: { [key: string]: string } = {
      'Neuf': 'productDetails.stateNew',
      'Occasion': 'productDetails.stateUsed',
      'Correct': 'productDetails.stateFair',
      'new': 'productDetails.stateNew',
      'used': 'productDetails.stateUsed',
      'fair': 'productDetails.stateFair'
    };
    return stateMap[state] ? t(stateMap[state]) : state;
  };

  // Handlers
  const handleToggleFavorite = async () => {
    if (!product?.id || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      await dispatch(
        toggleFavoriteAction({
          productId: product.id,
          isCurrentlyFavorite: isFavorite,
        })
      ).unwrap();
    } catch (error) {
      Alert.alert(t('productDetails.favoriteError'), '');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `${product.name} - ${formatPrice(product.price)}\n\n${product.description}`,
      });
    } catch (error) {
      // TODO: Implémenter système de logging
    }
  };

  const handleContactSeller = () => {
    const phoneNumber = product?.telephone || product?.user.phone;
    if (!phoneNumber) return;

    const normalizedPhone = normalizePhoneForWhatsApp(phoneNumber);
    const message = encodeURIComponent(
      `${t('productDetails.interestedMessage')} "${product.name}"`
    );
    const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${message}`;

    Linking.openURL(whatsappUrl)
      .catch(() => Alert.alert(t('productDetails.whatsappError'), ''));
  };

  const handleCallSeller = () => {
    const phoneNumber = product?.telephone || product?.user?.phone;
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleGoToSeller = () => {
    if (!product?.user) return;
    (navigation as any).navigate('SellerDetails', { sellerId: product.user.id });
  };

  // Enregistrer la vue du produit pour les utilisateurs connectés
  useEffect(() => {
    if (!product?.id) return;

    const timer = setTimeout(async () => {
      try {
        await dispatch(recordProductViewAction(product.id));
      } catch (error) {
        // Silently fail - ne pas bloquer l'affichage si l'enregistrement échoue
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, product?.id]);

  // Affichage du chargement
  if (productStatus === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={styles.errorContainer}>
          <View style={styles.errorHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContent}>
            <Icon name="time-outline" size={64} color={theme.colors.primary} />
            <Text style={styles.errorText}>{t('productDetails.loading')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Si produit introuvable
  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={styles.errorContainer}>
          <View style={styles.errorHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContent}>
            <Icon name="alert-circle-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.errorText}>{t('productDetails.notFound')}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>{t('productDetails.back')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Images carousel avec boutons overlay */}
          <View style={styles.carouselContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
                style={styles.carouselScrollView}
              >
                {product.images.map((imagePath: string, index: number) => {
                  const imageUrl = getImageUrl(imagePath, 'product');
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.9}
                      onPress={() => {
                        setModalImageIndex(index);
                        setIsImageModalVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Thumbnails en dessous du carousel */}
              {product.images.length > 1 && (
                <View style={styles.thumbnailsContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {product.images.map((imagePath: string, index: number) => {
                      const thumbnailUrl = getImageUrl(imagePath, 'product');
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            carouselRef.current?.scrollTo({ x: width * index, animated: true });
                            setCurrentImageIndex(index);
                          }}
                          style={[
                            styles.thumbnailButton,
                            { borderColor: currentImageIndex === index ? '#EA580C' : '#D1D5DB' }
                          ]}
                        >
                          <Image
                            source={{ uri: thumbnailUrl }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="image-outline" size={48} color="#9CA3AF" />
              <Text style={styles.placeholderText}>{t('productDetails.noImage')}</Text>
            </View>
          )}

          {/* Boutons overlay sur l'image */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayButton}>
              <Icon name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.overlayActions}>
              <TouchableOpacity onPress={handleShare} style={styles.overlayButton}>
                <Icon name="share-outline" size={24} color="#1F2937" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.overlayButton}
                disabled={isTogglingFavorite}
              >
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? '#EF4444' : '#1F2937'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {product.category && (
              <View style={[styles.badge, styles.badgeCategory]}>
                <Icon name="pricetag" size={14} color="#D97706" />
                <Text style={[styles.badgeText, { color: '#D97706' }]}>
                  {t(`categories.${product.category.name}`)}
                </Text>
              </View>
            )}

            {product.city && (
              <View style={[styles.badge, styles.badgeCity]}>
                <Icon name="location" size={14} color="#6B7280" />
                <Text style={[styles.badgeText, { color: '#6B7280' }]}>
                  {product.city.name}
                </Text>
              </View>
            )}

            <View style={[styles.badge, styles.badgeDate]}>
              <Icon name="calendar" size={14} color="#059669" />
              <Text style={[styles.badgeText, { color: '#059669' }]}>
                {formatDate(product.createdAt)}
              </Text>
            </View>
          </View>

          {/* Titre */}
          <Text style={styles.title}>
            {product.name}
          </Text>

          {/* Prix et Favoris */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(product.price)}
            </Text>

            <TouchableOpacity
              onPress={handleToggleFavorite}
              disabled={isTogglingFavorite}
              style={[
                styles.favoriteButton,
                isFavorite ? styles.favoriteButtonActive : styles.favoriteButtonInactive
              ]}
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#EF4444' : theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>
              {t('productDetails.description')}
            </Text>
            <Text style={styles.descriptionText}>
              {product.description}
            </Text>
          </View>

          {/* Caractéristiques et avertissement */}
          <View style={styles.specsContainer}>
            <View style={styles.specsRow}>
              {/* État et Vues - Côté gauche */}
              <View style={styles.specsLeft}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>{t('productDetails.state')}</Text>
                  <Text style={styles.specValue}>
                    {product.etat ? formatState(product.etat) : t('productDetails.notSpecified')}
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>{t('productDetails.views')}</Text>
                  <Text style={styles.specValue}>
                    {product.viewCount || 0}
                  </Text>
                </View>
              </View>

              {/* Message d'avertissement - Côté droit */}
              <View style={styles.warningBox}>
                <View style={styles.warningHeader}>
                  <Icon name="shield-checkmark" size={16} color="#EA580C" />
                  <Text style={styles.warningTitle}>
                    {t('productDetails.security')}
                  </Text>
                </View>
                <Text style={styles.warningText}>
                  • {t('productDetails.securityTip1')}{'\n'}
                  • {t('productDetails.securityTip2')}{'\n'}
                  • {t('productDetails.securityTip3')}{'\n'}
                  • {t('productDetails.securityTip4')}
                </Text>
              </View>
            </View>
          </View>

          {/* Vendeur */}
          {product.user && (
            <View style={styles.sellerContainer}>
              <TouchableOpacity onPress={handleGoToSeller} activeOpacity={0.7}>
                <View style={styles.sellerInfo}>
                  <View style={styles.sellerAvatar}>
                    {product.user.avatar ? (
                      <Image
                        source={{ uri: getImageUrl(product.user.avatar, 'avatar') }}
                        style={styles.sellerAvatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.sellerAvatarText}>
                        {product.user.firstName.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.sellerDetails}>
                    <Text style={styles.sellerName}>
                      {product.user.firstName} {product.user.lastName}
                    </Text>
                    <Text style={styles.sellerRole}>
                      {t('productDetails.seller')}
                    </Text>
                  </View>

                  <Icon name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>

              {/* Boutons de contact */}
              {(product.telephone || product.user.phone) && (
                <View style={styles.contactButtons}>
                  {!showPhoneNumber ? (
                    <TouchableOpacity
                      style={[styles.contactButton, styles.phoneButton]}
                      onPress={() => setShowPhoneNumber(true)}
                    >
                      <Icon name="call-outline" size={17} color={theme.colors.text} />
                      <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                        {t('productDetails.showNumber')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.contactButton, styles.phoneButtonActive]}
                      onPress={handleCallSeller}
                    >
                      <Icon name="call" size={17} color="#10B981" />
                      <Text style={[styles.buttonText, { color: '#10B981' }]}>
                        {product.telephone || product.user.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.contactButton, styles.whatsappButton]}
                    onPress={handleContactSeller}
                  >
                    <Icon name="logo-whatsapp" size={17} color="#FFFFFF" />
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                      {t('productDetails.whatsapp')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      {/* Modal plein écran pour les images */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header du modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalCounter}>
                {modalImageIndex + 1} / {product.images?.length || 0}
              </Text>
              <TouchableOpacity
                onPress={() => setIsImageModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={36} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Carousel plein écran */}
            <View style={styles.modalImageContainer}>
              <ScrollView
                ref={modalCarouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setModalImageIndex(index);
                }}
                scrollEventThrottle={16}
                contentOffset={{ x: modalImageIndex * width, y: 0 }}
              >
                {product.images?.map((imagePath: string, index: number) => {
                  const imageUrl = getImageUrl(imagePath, 'product');
                  return (
                    <View key={index} style={styles.modalImageWrapper}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                  );
                })}
              </ScrollView>

              {/* Indicateurs */}
              {product.images && product.images.length > 1 && (
                <View style={styles.modalIndicators}>
                  {product.images.map((_: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.modalIndicatorDot,
                        {
                          width: modalImageIndex === index ? 24 : 8,
                          backgroundColor: modalImageIndex === index ? '#EA580C' : 'rgba(255,255,255,0.5)',
                        }
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;