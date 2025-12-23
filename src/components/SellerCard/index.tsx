import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { AuthUser } from '../../store/user/actions';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUtils';

interface SellerCardProps {
  seller: AuthUser & {
    _count?: {
      products?: number;
      reviewsReceived?: number;
    };
    averageRating?: number;
  };
  onPress?: () => void;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, onPress }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  const productCount = seller._count?.products || 0;
  const reviewsCount = seller._count?.reviewsReceived || 0;
  const averageRating = seller.averageRating || 0;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      (navigation as any).navigate('SellerProfile', { sellerId: seller.id });
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: 120,
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 10,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      padding: 1.5,
      backgroundColor: '#FB923C',
      alignSelf: 'center',
      marginBottom: 6,
    },
    avatarContainer: {
      width: 37,
      height: 37,
      borderRadius: 18.5,
      backgroundColor: '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
    },
    avatar: {
      width: 37,
      height: 37,
      borderRadius: 18.5,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    name: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 5,
      textAlign: 'center',
    },
    statsContainer: {
      gap: 3,
      marginBottom: 8,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    statText: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginBottom: 1,
    },
    ratingValue: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    reviewCount: {
      fontSize: 9,
      color: colors.textSecondary,
    },
    button: {
      backgroundColor: '#EA580C',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  // Utiliser la même logique que le web pour générer l'URL de l'avatar
  const avatarUrl = getImageUrl(seller.avatar, 'avatar');
  const hasAvatar = avatarUrl && avatarUrl !== PLACEHOLDER_IMAGE;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        {/* Avatar avec badge vérifié */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {hasAvatar ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <Icon name="person" size={20} color="#FFFFFF" />
            )}
            {seller.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={{ fontSize: 10, color: '#FFFFFF' }}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nom */}
        <Text style={styles.name} numberOfLines={2}>
          {seller.firstName} {seller.lastName}
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon name="cube-outline" size={10} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {productCount} annonce{productCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {reviewsCount > 0 ? (
            <View style={styles.stat}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={10} color="#FFD700" />
                <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCount}>
                ({reviewsCount} avis)
              </Text>
            </View>
          ) : (
            <View style={styles.stat}>
              <Icon name="star-outline" size={10} color={colors.textSecondary} />
              <Text style={styles.statText}>Nouveau</Text>
            </View>
          )}
        </View>

        {/* Bouton voir profil */}
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Voir profil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default SellerCard;