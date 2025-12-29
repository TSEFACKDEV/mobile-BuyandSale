import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Product } from '../../store/product/actions';
import createStyles from './style';

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

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.container, forfait && styles.containerWithBorder, forfait && { borderColor: forfait.bgColor }]}>
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