import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { AuthUser } from '../../models/user';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUtils';
import createStyles from './style';

interface SellerCardProps {
  seller: AuthUser;
  index?: number;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, index }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleViewProfile = () => {
    const sellerId = seller.slug || seller.id;
    (navigation as any).navigate('SellerDetails', { sellerId });
  };

  // Statistiques (comme la version web React)
  const productCount = seller._count?.products || 0;
  const reviewsCount = seller._count?.reviewsReceived || 0;
  const averageRating = seller.reviewsReceived?.length
    ? seller.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
      seller.reviewsReceived.length
    : 0;

  const avatarUrl = getImageUrl(seller.avatar, 'avatar');
  const hasAvatar = avatarUrl && avatarUrl !== PLACEHOLDER_IMAGE;

  return (
    <TouchableOpacity onPress={handleViewProfile} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {hasAvatar ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar}
                resizeMode="cover"
              />
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

        <Text style={styles.name} numberOfLines={2}>
          {seller.firstName} {seller.lastName}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon name="cube-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {productCount} annonce{productCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {reviewsCount > 0 ? (
            <View style={styles.stat}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCount}>
                ({reviewsCount} avis)
              </Text>
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
  );
};

export default SellerCard;
