import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle, Share } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { toggleFavoriteAction } from '../../store/favorite/actions';
import { selectValidFavorites } from '../../store/favorite/slice';
import { selectUserAuthenticated } from '../../store/authentification/slice';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Product } from '../../store/product/actions';
import { getPrimaryForfait } from '../../config/forfaits.config';
import { formatPrice, formatRelativeShort } from '../../utils/formatUtils';
import ForfaitCardWrapper from '../ForfaitCardWrapper';
import ActionSheetModal from '../ActionSheetModal';
import styles from './style';

interface ProductCardProps {
  product: Product;
  containerStyle?: ViewStyle;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, containerStyle }) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const theme = useThemeColors();
  const isTogglingRef = useRef(false);

  const [sheetVisible, setSheetVisible] = useState(false);

  const favorites = useAppSelector(selectValidFavorites);
  const authData = useAppSelector(selectUserAuthenticated);
  const isAuthenticated = authData.entities !== null;

  const isFavorite = useMemo(
    () => favorites.some((fav) => fav.productId === product.id),
    [favorites, product.id]
  );

  const firstImage = useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    const img = product.images[0];
    if (typeof img === 'string') return img;
    return (img as any).imagePath || 'https://via.placeholder.com/400x300?text=No+Image';
  }, [product.images]);

  const primaryForfait = useMemo(
    () => getPrimaryForfait(product.productForfaits),
    [product.productForfaits]
  );

  const handlePress = () => {
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
      await Share.share({
        message: `${product.name} — ${formatPrice(product.price)}\nDécouvrez cette annonce sur BuyAndSale`,
        title: product.name,
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
      onPress: handlePress,
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

  return (
    <>
      <ForfaitCardWrapper
        forfaitType={primaryForfait?.type ?? null}
        borderRadius={12}
        backgroundColor={theme.surface}
        style={[{
          width: '48.5%',
          marginBottom: 12,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }, containerStyle]}
      >
        <TouchableOpacity
          style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.surface }}
          onPress={handlePress}
          onLongPress={() => setSheetVisible(true)}
          delayLongPress={350}
          activeOpacity={0.7}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: firstImage }} style={styles.image} resizeMode="cover" />

            {/* Badge forfait */}
            {primaryForfait && (
              <View style={[styles.forfaitBadge, { backgroundColor: primaryForfait.badge.bgColor }]}>
                <Icon name={primaryForfait.icon} size={9} color={primaryForfait.badge.textColor} />
                <Text style={[styles.forfaitText, { marginLeft: 3, color: primaryForfait.badge.textColor }]}>
                  {primaryForfait.label.toUpperCase()}
                </Text>
              </View>
            )}

            {/* Prix */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
            </View>

            {/* Bouton favori */}
            <TouchableOpacity
              style={[styles.favoriteButton, { backgroundColor: isFavorite ? '#EF4444' : 'rgba(255,255,255,0.9)' }]}
              onPress={isAuthenticated ? handleToggleFavorite : handleRequireAuth}
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#FFF' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>

          {/* Contenu */}
          <View style={styles.content}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="location-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {product.city?.name || 'Ville non spécifiée'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {formatRelativeShort(product.createdAt)}
                </Text>
              </View>
            </View>

            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
              {product.name || 'Produit sans nom'}
            </Text>

            <View style={styles.footer}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <Text style={[styles.categoryText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {product.category.name}
                </Text>
              </View>
              <View style={styles.viewsContainer}>
                <Icon name="eye-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.viewsText, { color: theme.textSecondary }]}>
                  {product.viewCount || 0}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ForfaitCardWrapper>

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

export default React.memo(
  ProductCard,
  (prevProps, nextProps) =>
    prevProps.product.id === nextProps.product.id &&
    prevProps.containerStyle === nextProps.containerStyle
);
