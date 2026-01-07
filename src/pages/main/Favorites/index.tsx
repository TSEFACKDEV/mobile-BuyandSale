import React, { useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { getUserFavoritesAction } from '../../../store/favorite/actions';
import { selectValidFavorites, LoadingType } from '../../../store/favorite/slice';
import ProductCard from '../../../components/ProductCard';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  
  const validFavorites = useAppSelector(selectValidFavorites);
  const status = useAppSelector((state) => state.favorite.status);

  useEffect(() => {
    dispatch(getUserFavoritesAction());
  }, [dispatch]);

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
      renderItem={({ item }) => {
        if (!item.product) return null;
        return <ProductCard product={item.product} />;
      }}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
      columnWrapperStyle={{ gap: 8 }}
      ListEmptyComponent={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
          <Icon name="heart-outline" size={80} color={colors.textSecondary} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16 }}>
            Aucun favori
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            Les produits que vous ajoutez à vos favoris apparaîtront ici
          </Text>
        </View>
      }
    />
  );
};

export default Favorites;
