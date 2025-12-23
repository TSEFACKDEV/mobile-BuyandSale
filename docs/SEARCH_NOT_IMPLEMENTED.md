# 🔍 SEARCH - NON IMPLÉMENTÉ COMME STORE SÉPARÉ

**Date:** 23 décembre 2025  
**Décision:** Fonctionnalité intégrée dans Product Store

---

## ❓ POURQUOI PAS DE STORE SEARCH ?

### Analyse Backend

Le backend ne possède **aucune route `/search`** dédiée. La fonctionnalité de recherche est intégrée directement dans les routes product existantes:

```typescript
// product.controller.ts
GET /products?search=iPhone
GET /products/category/:id?search=Samsung
GET /products/seller/:id?search=...
```

**Paramètres disponibles:**
- `search` - Recherche par nom de produit (contains)
- `categoryId` - Filtre par catégorie
- `cityId` - Filtre par ville
- `priceMin` / `priceMax` - Fourchette de prix
- `etat` - État du produit (NEUF, OCCASION, CORRECT)
- `page` / `limit` - Pagination

---

## ✅ SOLUTION ADOPTÉE

### Product Store contient déjà la recherche

```typescript
// mobile-BuyandSale/src/store/product/actions.ts

export interface ProductFilters {
  search?: string;        // ✅ Recherche par nom
  categoryId?: string;    // ✅ Filtre catégorie
  cityId?: string;        // ✅ Filtre ville
  priceMin?: number;      // ✅ Prix minimum
  priceMax?: number;      // ✅ Prix maximum
  etat?: 'NEUF' | 'OCCASION' | 'CORRECT'; // ✅ État
  page?: number;          // ✅ Pagination
  limit?: number;         // ✅ Limite
}

// Action avec recherche intégrée
export const getValidatedProductsAction = createAsyncThunk<
  ProductListResponse,
  ProductFilters,
  { rejectValue: string }
>('product/getValidatedProducts', async (filters, { rejectWithValue }) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.cityId) params.append('cityId', filters.cityId);
  // ...
  
  const response = await apiRequest<ProductListResponse>(
    `/products?${params.toString()}`
  );
  return response;
});
```

---

## 💡 UTILISATION DE LA RECHERCHE

### Exemple: Page de recherche

```tsx
import React, { useState } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getValidatedProductsAction } from '../store/product/actions';

const SearchScreen = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { marketplaceProducts, loading } = useSelector((state) => state.product);

  const handleSearch = () => {
    dispatch(getValidatedProductsAction({
      search: searchQuery,
      page: 1,
      limit: 20
    }));
  };

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Rechercher un produit..."
        onSubmitEditing={handleSearch}
      />
      
      <FlatList
        data={marketplaceProducts}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};
```

### Exemple: Recherche avec filtres multiples

```tsx
const AdvancedSearchScreen = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    cityId: '',
    priceMin: 0,
    priceMax: 1000000,
    etat: undefined,
  });

  const handleSearch = () => {
    dispatch(getValidatedProductsAction(filters));
  };

  return (
    <View>
      {/* Search input */}
      <TextInput
        value={filters.search}
        onChangeText={(text) => setFilters({ ...filters, search: text })}
        placeholder="Rechercher..."
      />
      
      {/* Category filter */}
      <Picker
        selectedValue={filters.categoryId}
        onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
      >
        <Picker.Item label="Toutes les catégories" value="" />
        {/* ... */}
      </Picker>
      
      {/* Price range */}
      <View>
        <TextInput
          value={String(filters.priceMin)}
          onChangeText={(text) => setFilters({ ...filters, priceMin: Number(text) })}
          placeholder="Prix min"
          keyboardType="numeric"
        />
        <TextInput
          value={String(filters.priceMax)}
          onChangeText={(text) => setFilters({ ...filters, priceMax: Number(text) })}
          placeholder="Prix max"
          keyboardType="numeric"
        />
      </View>
      
      <Button title="Rechercher" onPress={handleSearch} />
    </View>
  );
};
```

---

## 🎯 FONCTIONNALITÉS DISPONIBLES

### 1. Recherche textuelle
```typescript
dispatch(getValidatedProductsAction({ search: 'iPhone' }))
```

### 2. Recherche par catégorie
```typescript
dispatch(getCategoryProductsAction(categoryId, { search: 'Samsung' }))
```

### 3. Recherche avec fourchette de prix
```typescript
dispatch(getValidatedProductsAction({
  search: 'Voiture',
  priceMin: 1000000,
  priceMax: 5000000
}))
```

### 4. Recherche par ville + catégorie
```typescript
dispatch(getValidatedProductsAction({
  cityId: 'douala-uuid',
  categoryId: 'electronics-uuid',
  search: 'TV'
}))
```

### 5. Recherche par état
```typescript
dispatch(getValidatedProductsAction({
  search: 'MacBook',
  etat: 'NEUF'
}))
```

---

## 📋 BACKEND ENDPOINTS UTILISÉS

| Endpoint | Paramètres Search | Store Action |
|----------|-------------------|--------------|
| `GET /products` | search, categoryId, cityId, priceMin/Max, etat, page, limit | getValidatedProductsAction |
| `GET /products/category/:id` | search, cityId, priceMin/Max, etat, page, limit | getCategoryProductsAction |
| `GET /products/seller/:id` | search, page, limit | getSellerProductsAction |
| `GET /products/user/:id` | search, page, limit | getUserProductsAction |

**Tous les endpoints product supportent le paramètre `search`**

---

## ✅ CONCLUSION

### Pas besoin de store search séparé car:

1. ✅ **Backend:** Aucune route `/search` dédiée
2. ✅ **Intégration:** Recherche déjà dans ProductFilters
3. ✅ **Flexibilité:** Combinaison search + filtres multiples
4. ✅ **Performance:** Même endpoint, pas de requêtes supplémentaires
5. ✅ **Maintenance:** Pas de duplication de code

### Ce qui est disponible:

- ✅ Recherche par nom de produit (contains)
- ✅ Filtres combinés (catégorie, ville, prix, état)
- ✅ Pagination des résultats
- ✅ Recherche sur tous les endpoints product
- ✅ État Redux unifié (product store)

---

**La recherche est COMPLÈTE et FONCTIONNELLE via le Product Store! ✅**  
**Aucun store search séparé n'est nécessaire.**
