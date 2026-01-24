import React, { useMemo, useRef } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { toggleFavoriteAction } from '../../store/favorite/actions';
import { selectValidFavorites } from '../../store/favorite/slice';
import { selectUserAuthenticated } from '../../store/authentification/slice';
import { useThemeColors } from '../../contexts/ThemeContext';
import type { Product } from '../../store/product/actions';
import { getPrimaryForfait } from '../../config/forfaits.config';
import styles from './style';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const theme = useThemeColors();
  const isTogglingRef = useRef(false);

  const favorites = useAppSelector(selectValidFavorites);
  const authData = useAppSelector(selectUserAuthenticated);
  const isAuthenticated = authData.entities !== null;

  // Vérifier si le produit est favori
  const isFavorite = useMemo(
    () => favorites.some((fav) => fav.productId === product.id),
    [favorites, product.id]
  );

  // Obtenir la première image
  const firstImage = useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    const img = product.images[0];
    // Support pour string ou objet { imagePath: string }
    if (typeof img === 'string') {
      return img;
    }
    // Type assertion pour gérer le cas objet
    return (img as any).imagePath || 'https://via.placeholder.com/400x300?text=No+Image';
  }, [product.images]);

  // Obtenir le forfait avec la plus haute priorité
  const primaryForfait = useMemo(
    () => getPrimaryForfait(product.productForfaits),
    [product.productForfaits]
  );

  const borderColor = primaryForfait?.card.borderColor || theme.border;
  const borderWidth = primaryForfait?.card.borderWidth || 1;

  // Formater le prix
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  };

  // Formater la date relative
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Gérer le toggle favori
  const handleToggleFavorite = async () => {
    if (isTogglingRef.current) return;

    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    isTogglingRef.current = true;
    try {
      await dispatch(
        toggleFavoriteAction({
          productId: product.id,
          isCurrentlyFavorite: isFavorite,
        })
      ).unwrap();
    } catch (error) {
      console.error('Erreur toggle favori:', error);
    } finally {
      isTogglingRef.current = false;
    }
  };

  // Gérer le clic sur la carte
  const handlePress = () => {
    // Utiliser CommonActions.navigate pour naviguer depuis n'importe quel contexte
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTab',
        params: {
          screen: 'HomeTab',
          params: {
            screen: 'ProductDetails',
            params: { productId: product.id },
          },
        },
      })
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: borderColor,
          borderWidth: borderWidth,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: firstImage }} 
          style={styles.image} 
          resizeMode="cover"
        />

        {/* Badge forfait */}
        {primaryForfait && (
          <View
            style={[
              styles.forfaitBadge,
              {
                backgroundColor: primaryForfait.badge.bgColor,
              },
            ]}
          >
            <Ionicons name={primaryForfait.icon as any} size={9} color={primaryForfait.badge.textColor} />
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
          style={[
            styles.favoriteButton,
            {
              backgroundColor: isFavorite ? '#EF4444' : 'rgba(255, 255, 255, 0.9)',
            },
          ]}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#FFF' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {/* Localisation et date */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
              {product.city?.name || 'Ville non spécifiée'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {formatRelativeDate(product.createdAt)}
            </Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {product.name || 'Produit sans nom'}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.categoryText, { color: theme.textSecondary }]} numberOfLines={1}>
              {product.category.name}
            </Text>
          </View>

          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={12} color={theme.textSecondary} />
            <Text style={[styles.viewsText, { color: theme.textSecondary }]}>
              {product.viewCount || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ProductCard, (prevProps, nextProps) => {
  // Ne re-render que si l'ID du produit change
  return prevProps.product.id === nextProps.product.id;
});
