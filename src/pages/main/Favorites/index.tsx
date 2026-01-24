import React, { useEffect, useCallback } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { getUserFavoritesAction } from '../../../store/favorite/actions';
import { selectValidFavorites, LoadingType } from '../../../store/favorite/slice';
import ProductCard from '../../../components/ProductCard';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { t } = useTranslation();
  
  const validFavorites = useAppSelector(selectValidFavorites);
  const status = useAppSelector((state) => state.favorite.status);

  useEffect(() => {
    dispatch(getUserFavoritesAction());
  }, [dispatch]);

  // Mémoriser le renderItem
  const renderItem = useCallback(({ item }: { item: any }) => {
    if (!item.product) return null;
    return <ProductCard product={item.product} />;
  }, []);

  // Mémoriser le keyExtractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Optimisation: définir la hauteur fixe des items
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: 220,
      offset: 220 * Math.floor(index / 2),
      index,
    }),
    []
  );

  if (status === LoadingType.LOADING && validFavorites.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      key="favorites-grid"
      data={validFavorites}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
      columnWrapperStyle={{ gap: 8 }}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={100}
      windowSize={10}
      initialNumToRender={12}
      ListEmptyComponent={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
          <Icon name="heart-outline" size={80} color={colors.textSecondary} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16 }}>
            {t('favorites.noFavorites')}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {t('favorites.noFavoritesMessage')}
          </Text>
        </View>
      }
    />
  );
};

export default Favorites;
