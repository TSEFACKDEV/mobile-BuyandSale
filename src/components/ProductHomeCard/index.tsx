import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Product } from '../../store/product/actions';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 130; // Largeur légèrement agrandie

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  // Obtenir le forfait avec la priorité la plus haute
  const topForfait = useMemo(() => {
    const productForfaits = product?.productForfaits;
    if (!productForfaits || !Array.isArray(productForfaits)) return null;

    const now = new Date();
    const activeForfaits = productForfaits.filter((pf: any) => {
      const expiryDate = new Date(pf.expiresAt);
      return pf.isActive && expiryDate > now && pf.forfait?.type;
    });

    if (activeForfaits.length === 0) return null;

    // Priorités: PREMIUM(1) > TOP_ANNONCE(2) > URGENT(3)
    const priorityMap: Record<string, number> = {
      PREMIUM: 1,
      TOP_ANNONCE: 2,
      URGENT: 3,
    };

    const sorted = activeForfaits.sort((a: any, b: any) => {
      const priorityA = priorityMap[a.forfait.type] || 999;
      const priorityB = priorityMap[b.forfait.type] || 999;
      return priorityA - priorityB;
    });

    return sorted[0]?.forfait.type;
  }, [product?.productForfaits]);

  // Configuration des forfaits (exactement comme le web)
  const forfaitConfig = {
    PREMIUM: { 
      bgColor: '#A78BFA',      // purple-400
      borderColor: '#C4B5FD',  // purple-300
      textColor: '#FFFFFF',
      label: 'premium',
      icon: 'star'
    },
    TOP_ANNONCE: { 
      bgColor: '#60A5FA',      // blue-400
      borderColor: '#93C5FD',  // blue-300
      textColor: '#FFFFFF',
      label: 'top',
      icon: 'trending-up'
    },
    URGENT: { 
      bgColor: '#F87171',      // red-400
      borderColor: '#FCA5A5',  // red-300
      textColor: '#FFFFFF',
      label: 'urgent',
      icon: 'flame'
    },
  };

  const forfait = topForfait ? forfaitConfig[topForfait as keyof typeof forfaitConfig] : null;

  // Première image du produit
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      (navigation as any).navigate('ProductDetails', { productId: product.id });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return `${price}`;
  };

  const styles = StyleSheet.create({
    container: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.6, // Hauteur fixe pour uniformité
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginRight: 8,
      overflow: 'hidden',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      borderWidth: forfait ? 2 : 0,
      borderColor: forfait?.bgColor || 'transparent',
    },
    imageContainer: {
      width: '100%',
      height: CARD_WIDTH * 0.9, // Hauteur fixe
      backgroundColor: colors.border,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.border,
    },
    forfaitBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 12,
      gap: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },
    forfaitText: {
      fontSize: 9,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    contentContainer: {
      padding: 8,
    },
    name: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      height: 32, // Hauteur fixe pour 2 lignes
      lineHeight: 16,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginBottom: 4,
      height: 14, // Hauteur fixe
    },
    location: {
      fontSize: 10,
      color: colors.textSecondary,
      flex: 1,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    price: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    viewsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    viewsText: {
      fontSize: 9,
      color: colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
          
          {/* Badge Forfait - Style identique au web */}
          {forfait && (
            <View style={[styles.forfaitBadge, { 
              backgroundColor: forfait.bgColor,
            }]}>
              <Icon name={forfait.icon} size={10} color={forfait.textColor} />
              <Text style={[styles.forfaitText, { color: forfait.textColor }]}>
                {forfait.label}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {product.name}
          </Text>

          {product.city && (
            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={9} color={colors.textSecondary} />
              <Text style={styles.location} numberOfLines={1}>
                {product.city.name}
              </Text>
            </View>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.viewCount !== undefined && (
              <View style={styles.viewsContainer}>
                <Icon name="eye-outline" size={9} color={colors.textSecondary} />
                <Text style={styles.viewsText}>{product.viewCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;