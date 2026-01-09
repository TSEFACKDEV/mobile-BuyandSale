import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Product } from '../../store/product/actions';
import { getPrimaryForfait } from '../../config/forfaits.config';
import createStyles from './style';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  // Obtenir le forfait avec la plus haute priorité
  const primaryForfait = useMemo(
    () => getPrimaryForfait(product?.productForfaits),
    [product?.productForfaits]
  );

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
      <View style={[styles.container, primaryForfait && styles.containerWithBorder, primaryForfait && { borderColor: primaryForfait.card.borderColor }]}>
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
          
          {/* Badge Forfait */}
          {primaryForfait && (
            <View style={[styles.forfaitBadge, { 
              backgroundColor: primaryForfait.badge.bgColor,
            }]}>
              <Icon name={primaryForfait.icon} size={10} color={primaryForfait.badge.textColor} />
              <Text style={[styles.forfaitText, { color: primaryForfait.badge.textColor }]}>
                {primaryForfait.label}
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