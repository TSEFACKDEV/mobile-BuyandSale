import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useProducts } from '../../../hooks/useProducts';
import { useSellerReviews } from '../../../hooks/useSellerReviews';
import { useAppSelector } from '../../../hooks/store';
import { selectUserAuthenticated } from '../../../store/authentification/slice';
import { selectUserReviewForSeller } from '../../../store/review/slice';
import ProductCard from '../../../components/ProductHomeCard';
import SellerRatings from '../../../components/SellerRatings';
import RatingModal from '../../../components/RatingModal';
import ReportModal from '../../../components/ReportModal';
import { getImageUrl } from '../../../utils/imageUtils';
import { normalizePhoneForWhatsApp, formatPhoneForDisplay } from '../../../utils/phoneUtils';
import createStyles from './style';
import type { HomeStackParamList } from '../../../types/navigation';
import type { Product } from '../../../store/product/actions';

// Dummy translation function for now
const t = (key: string, params?: any): string => {
  const translations: Record<string, string> = {
    'common.loading': 'Chargement...',
    'sellerProfile.noPhone': 'Aucun numéro de téléphone',
    'sellerProfile.checkOut': 'Découvrez',
    'sellerProfile.reportSuccess': 'Signalement envoyé',
    'sellerProfile.locationNotSpecified': 'Localisation non précisée',
    'sellerProfile.memberSinceRecently': 'Membre récemment',
    'sellerProfile.contactInfo': 'Informations de contact',
    'sellerProfile.noProducts': 'Aucun produit',
    'sellerProfile.actions.rate': 'Noter',
    'sellerProfile.actions.report': 'Signaler',
    'sellerProfile.actions.contact': 'Contacter',
    'sellerProfile.actions.share': 'Partager',
  };
  if (key === 'sellerProfile.productsSection') {
    return `Produits de ${params?.name || ''} (${params?.count || 0})`;
  }
  return translations[key] || key;
};

type SellerDetailsRouteProp = RouteProp<HomeStackParamList, 'SellerDetails'>;

interface SellerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

const SellerDetails: React.FC = () => {
  const route = useRoute<SellerDetailsRouteProp>();
  const navigation = useNavigation();
  const theme = useThemeColors();
  const styles = createStyles(theme);

  const { sellerId } = route.params;

  // Current authenticated user (NOT the seller being viewed)
  const authData = useAppSelector(selectUserAuthenticated);
  const currentUser = authData.entities;

  // Use hooks like React
  const {
    products: sellerProducts,
    metadata,
    isLoading: isSellerProductsLoading,
  } = useProducts('seller', { sellerId, limit: 12 });

  const { ratingStats, refreshReviews } = useSellerReviews(sellerId, true);
  const userReview = useAppSelector((state) =>
    selectUserReviewForSeller(state, sellerId)
  );

  // Seller info from metadata (like React)
  const seller = metadata as unknown as SellerInfo | null;

  // Modals
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Handlers
  const handleContactSeller = () => {
    if (!seller?.phone) {
      Alert.alert(t('sellerProfile.noPhone'));
      return;
    }
    
    const normalizedPhone = normalizePhoneForWhatsApp(seller.phone);
    const message = encodeURIComponent(
      `Bonjour ${seller.firstName || ''}, je souhaite vous contacter.`
    );
    const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${message}`;

    Linking.openURL(whatsappUrl)
      .catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp'));
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `${t('sellerProfile.checkOut')} ${seller?.firstName} ${seller?.lastName}`,
      });
    } catch (error) {
      // Silently handle share cancellation
    }
  };

  const handleRatingSuccess = () => {
    setShowRatingModal(false);
    refreshReviews();
  };

  const handleReportSuccess = () => {
    setShowReportModal(false);
    Alert.alert(t('sellerProfile.reportSuccess'));
  };

  if (!seller) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sellerName = `${seller.firstName} ${seller.lastName}`;
  const count = sellerProducts?.length || 0;
  const plural = count > 1 ? 's' : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Gradient Header Background */}
        <LinearGradient
          colors={['#F97316', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          {/* Share button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareProfile}
          >
            <Icon name="share-social-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Card with negative margin */}
        <View style={styles.profileCard}>
          {/* Avatar with double gradient border */}
          <LinearGradient
            colors={['#FB923C', '#F472B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <View style={styles.avatarContainer}>
              {seller.avatar ? (
                <Image
                  source={{ uri: getImageUrl(seller.avatar, 'avatar') }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>
                    {seller.firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Seller Name */}
          <Text style={styles.sellerName}>{sellerName}</Text>

          {/* Info Row (Location + Member Since) */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="location-outline" size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>
                {t('sellerProfile.locationNotSpecified')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>
                {t('sellerProfile.memberSinceRecently')}
              </Text>
            </View>
          </View>

          {/* Rating and Product Count */}
          <View style={styles.statsRow}>
            <SellerRatings statistics={ratingStats} showDetails={false} />
            <View style={styles.productCount}>
              <Icon name="cube-outline" size={16} color={theme.textSecondary} />
              <Text style={styles.productCountText}>
                {count} produit{plural}
              </Text>
            </View>
          </View>

          {/* Actions - Single Horizontal Row */}
          {currentUser?.id !== sellerId && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Icon name="star" size={20} color={theme.primary} />
                <Text style={styles.actionButtonText}>
                  {t('sellerProfile.actions.rate')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowReportModal(true)}
              >
                <Icon name="flag" size={20} color={theme.error} />
                <Text style={styles.actionButtonText}>
                  {t('sellerProfile.actions.report')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* WhatsApp Button */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSeller}
          >
            <Icon name="logo-whatsapp" size={16} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>
              WhatsApp
            </Text>
          </TouchableOpacity>

          {/* Contact Info INSIDE profile card */}
          {seller.phone && (
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>{t('sellerProfile.contactInfo')}</Text>
              <View style={styles.contactGrid}>
                <View style={styles.contactItem}>
                  <Icon name="call-outline" size={20} color={theme.primary} />
                  <Text style={styles.contactText}>
                    {formatPhoneForDisplay(seller.phone)}
                  </Text>
                </View>
                <View style={styles.contactItem}>
                  <Icon name="mail-outline" size={20} color={theme.primary} />
                  <Text style={styles.contactText}>{seller.email}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Products Section - Separate Card */}
        <View style={styles.productsCard}>
          <Text style={styles.productsTitle}>
            {t('sellerProfile.productsSection', { name: seller.firstName, count })}
          </Text>

          {isSellerProductsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : sellerProducts && sellerProducts.length > 0 ? (
            <View style={styles.productsList}>
              {sellerProducts.map((product: Product) => (
                <View key={product.id} style={styles.productItem}>
                  <ProductCard
                    product={product}
                    onPress={() => {}}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="cube-outline" size={48} color={theme.textSecondary} />
              <Text style={styles.emptyText}>{t('sellerProfile.noProducts')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      {showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          sellerId={sellerId}
          sellerName={sellerName}
          onSuccess={handleRatingSuccess}
        />
      )}

      {currentUser && showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          sellerId={sellerId}
          sellerName={sellerName}
          onSuccess={handleReportSuccess}
        />
      )}
    </SafeAreaView>
  );
};

export default SellerDetails;
