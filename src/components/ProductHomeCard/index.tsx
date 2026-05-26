import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Share } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Product } from '../../store/product/actions';
import { getPrimaryForfait } from '../../config/forfaits.config';
import { formatPrice } from '../../utils/formatUtils';
import ForfaitCardWrapper from '../ForfaitCardWrapper';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { toggleFavoriteAction } from '../../store/favorite/actions';
import { selectValidFavorites } from '../../store/favorite/slice';
import { selectUserAuthenticated } from '../../store/authentification/slice';
import ActionSheetModal from '../ActionSheetModal';
import createStyles from './style';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isTogglingRef = useRef(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  const favorites = useAppSelector(selectValidFavorites);
  const authData = useAppSelector(selectUserAuthenticated);
  const isAuthenticated = authData.entities !== null;

  const primaryForfait = useMemo(
    () => getPrimaryForfait(product?.productForfaits),
    [product?.productForfaits]
  );

  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : null;

  const isFavorite = useMemo(
    () => favorites.some((fav) => fav.productId === product.id),
    [favorites, product.id]
  );

  const navigateToDetails = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTab',
        params: {
          screen: 'HomeTab',
          params: { screen: 'ProductDetails', params: { productId: product.id } },
        },
      })
    );
  };

  const handlePress = () => {
    if (onPress) onPress();
    else navigateToDetails();
  };

  const handleToggleFavorite = async () => {
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    try {
      await dispatch(
        toggleFavoriteAction({ productId: product.id, isCurrentlyFavorite: isFavorite })
      ).unwrap();
    } catch (error) {
      console.error('Erreur toggle favori:', error);
    } finally {
      isTogglingRef.current = false;
    }
  };

  const handleShare = async () => {
    try {
      const productUrl = (product as any).slug
        ? `https://www.buyandsale.cm/produit/${(product as any).slug}`
        : `https://www.buyandsale.cm/produit/${product.id}`;
      await Share.share({
        message: `${product.name} — ${formatPrice(product.price)}\n${productUrl}`,
        title: product.name,
        url: productUrl, // iOS : active l'aperçu OG
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleRequireAuth = () => {
    (navigation as any).navigate('Auth', { screen: 'Login' });
  };

  const sheetItems = [
    {
      label: 'Voir les détails',
      icon: 'eye-outline',
      onPress: navigateToDetails,
    },
    {
      label: isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
      icon: isFavorite ? 'heart' : 'heart-outline',
      onPress: handleToggleFavorite,
      requiresAuth: true,
    },
    {
      label: 'Partager cette annonce',
      icon: 'share-social-outline',
      onPress: handleShare,
    },
  ];

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={() => setSheetVisible(true)}
        activeOpacity={0.7}
        delayLongPress={350}
      >
        <ForfaitCardWrapper
          forfaitType={primaryForfait?.type ?? null}
          borderRadius={8}
          backgroundColor={colors.surface}
          style={styles.container}
        >
          <View style={{ flex: 1 }}>
            {/* Image */}
            <View style={styles.imageContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Icon name="image-outline" size={24} color={colors.textSecondary} />
                </View>
              )}

              {/* Badge Forfait */}
              {primaryForfait && (
                <View style={[styles.forfaitBadge, { backgroundColor: primaryForfait.badge.bgColor }]}>
                  <Icon name={primaryForfait.icon} size={10} color={primaryForfait.badge.textColor} />
                  <Text style={[styles.forfaitText, { color: primaryForfait.badge.textColor }]}>
                    {primaryForfait.label.toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Badge Prix */}
              <View style={styles.priceBadge}>
                <Text style={styles.priceText} numberOfLines={1}>{formatPrice(product.price)}</Text>
              </View>

              {/* Bouton favori */}
              <TouchableOpacity
                style={[styles.favoriteButton, { backgroundColor: isFavorite ? '#EF4444' : 'rgba(255,255,255,0.9)' }]}
                onPress={isAuthenticated ? handleToggleFavorite : handleRequireAuth}
              >
                <Icon name={isFavorite ? 'heart' : 'heart-outline'} size={14} color={isFavorite ? '#FFF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                {product.name}
              </Text>

              <View style={styles.bottomRow}>
                {product.city && (
                  <View style={styles.metaLeft}>
                    <Icon name="location-outline" size={9} color={colors.textSecondary} />
                    <Text style={styles.cityText} numberOfLines={1}>{product.city.name}</Text>
                  </View>
                )}
                {product.viewCount !== undefined && (
                  <View style={styles.viewsContainer}>
                    <Icon name="eye-outline" size={9} color={colors.textSecondary} />
                    <Text style={styles.viewsText}>{product.viewCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ForfaitCardWrapper>
      </TouchableOpacity>

      <ActionSheetModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={product.name}
        subtitle={formatPrice(product.price)}
        items={sheetItems}
        isAuthenticated={isAuthenticated}
        onRequireAuth={handleRequireAuth}
      />
    </>
  );
};

export default ProductCard;