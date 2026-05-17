import React, { useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { AuthUser } from '../../models/user';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUtils';
import { getDisplayName } from '../../helpers/userHelper';
import { useAppSelector } from '../../hooks/store';
import { selectUserAuthenticated } from '../../store/authentification/slice';
import RatingModal from '../RatingModal';
import ReportModal from '../ReportModal';
import ActionSheetModal from '../ActionSheetModal';
import createStyles from './style';

interface SellerCardProps {
  seller: AuthUser;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const authData = useAppSelector(selectUserAuthenticated);
  const isAuthenticated = authData.entities !== null;

  const [sheetVisible, setSheetVisible] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const sellerName = getDisplayName(seller.firstName, seller.lastName);
  const sellerId = seller.slug || seller.id;

  const handleViewProfile = () => {
    (navigation as any).navigate('SellerDetails', { sellerId });
  };

  const handleRequireAuth = () => {
    (navigation as any).navigate('Auth', { screen: 'Login' });
  };

  const sheetItems = [
    {
      label: 'Voir le profil',
      icon: 'person-outline',
      onPress: handleViewProfile,
    },
    {
      label: 'Noter ce vendeur',
      icon: 'star-outline',
      onPress: () => setRatingModalOpen(true),
      requiresAuth: true,
    },
    {
      label: 'Signaler ce vendeur',
      icon: 'flag-outline',
      onPress: () => setReportModalOpen(true),
      requiresAuth: true,
      destructive: true,
    },
  ];

  const productCount = seller._count?.products || 0;
  const reviews = seller.reviewsReceived || [];
  const reviewsCount = Math.max(reviews.length, seller._count?.reviewsReceived || 0);
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const avatarUrl = getImageUrl(seller.avatar, 'avatar');
  const hasAvatar = avatarUrl && avatarUrl !== PLACEHOLDER_IMAGE;

  return (
    <>
      <TouchableOpacity
        onPress={handleViewProfile}
        onLongPress={() => setSheetVisible(true)}
        delayLongPress={350}
        activeOpacity={0.7}
      >
        <View style={styles.container}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {hasAvatar ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <Icon name="person" size={24} color="#FFFFFF" />
              )}
              {seller.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.name} numberOfLines={2}>{sellerName}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Icon name="cube-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{productCount} annonce{productCount !== 1 ? 's' : ''}</Text>
            </View>
            {reviewsCount > 0 ? (
              <View style={styles.stat}>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewCount}>({reviewsCount} avis)</Text>
              </View>
            ) : (
              <View style={styles.stat}>
                <Icon name="star-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.statText}>Nouveau</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleViewProfile}>
            <Text style={styles.buttonText}>Voir profil</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <ActionSheetModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={sellerName}
        items={sheetItems}
        isAuthenticated={isAuthenticated}
        onRequireAuth={handleRequireAuth}
      />
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        sellerId={seller.id}
        sellerName={sellerName}
      />
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        sellerId={seller.id}
        sellerName={sellerName}
      />
    </>
  );
};

export default React.memo(SellerCard, (prevProps, nextProps) => {
  return prevProps.seller.id === nextProps.seller.id;
});
