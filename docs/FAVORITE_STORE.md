# Favorite Store - Implementation

## Résumé
Le store **favorite** permet aux utilisateurs authentifiés de gérer leurs produits favoris :
- Consulter la liste de leurs favoris
- Ajouter un produit aux favoris
- Retirer un produit des favoris
- Toggle rapide favori/non-favori

## Routes Backend Implémentées

### Toutes Authentifiées (Token requis)
```
GET    /favorite        - Récupère tous les favoris de l'utilisateur
POST   /favorite/add    - Ajoute un produit aux favoris
DELETE /favorite/remove - Retire un produit des favoris
```

## Actions Implémentées

### Authentifiées
1. **getUserFavoritesAction** - Récupère mes favoris
   - Retourne la liste complète avec les détails des produits
   - Filtre automatiquement les produits supprimés

2. **addToFavoritesAction** - Ajoute aux favoris
   - Payload: `{ productId: string }`
   - Vérifie que le produit existe
   - Évite les doublons (contrôle backend)

3. **removeFromFavoritesAction** - Retire des favoris
   - Payload: `{ productId: string }`
   - Supprime l'entrée de la base de données

4. **toggleFavoriteAction** - Toggle favori
   - Payload: `{ productId: string, isCurrentlyFavorite: boolean }`
   - Action composite qui appelle add ou remove selon l'état
   - Optimisée pour boutons favoris dans les listes

## État du Store

```typescript
{
  data: Favorite[]                        // Liste des favoris
  status: LoadingType                     // Statut de chargement liste
  error: string | null                    // Message d'erreur global
  toggleStatus: { [productId: string]: LoadingType }  // Statut par produit
}
```

## Types

### Favorite
```typescript
{
  id: string              // ID du favori
  userId: string          // ID de l'utilisateur
  productId: string       // ID du produit
  product: ProductBasic | null  // Détails du produit (null si supprimé)
  createdAt: string       // Date d'ajout
  updatedAt: string       // Date de mise à jour
}
```

### ProductBasic (simplifié)
```typescript
{
  id: string
  title: string
  description: string
  price: number
  images: string[]
  status: string
  categoryId: string
  cityId: string
  userId: string
  createdAt: string
}
```

## Reducers Personnalisés

Le slice expose des actions pour gérer l'état :
- `resetError()` - Réinitialise l'erreur
- `resetToggleStatus(productId)` - Réinitialise le statut de toggle pour un produit
- `clearFavorites()` - Vide tous les favoris (au logout)

## Utilisation dans l'Application Mobile

### Afficher la liste des favoris
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { getUserFavoritesAction } from '../store/favorite/actions';
import { RootState } from '../store';

const FavoritesScreen = () => {
  const dispatch = useDispatch();
  const { data: favorites, status } = useSelector(
    (state: RootState) => state.favorite
  );
  
  useEffect(() => {
    dispatch(getUserFavoritesAction());
  }, []);
  
  // Filtrer les favoris avec produits valides
  const validFavorites = favorites.filter(fav => fav.product !== null);
  
  if (status === 'loading') return <Loading />;
  
  return (
    <FlatList
      data={validFavorites}
      renderItem={({ item }) => (
        <ProductCard product={item.product!} favoriteId={item.id} />
      )}
      ListEmptyComponent={
        <View>
          <Text>Aucun favori pour le moment</Text>
        </View>
      }
    />
  );
};
```

### Bouton favori avec toggle
```typescript
import { toggleFavoriteAction } from '../store/favorite/actions';

const FavoriteButton = ({ productId }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorite.data);
  const toggleStatus = useSelector(
    (state: RootState) => state.favorite.toggleStatus[productId]
  );
  
  // Vérifier si le produit est en favoris
  const isFavorite = favorites.some(fav => fav.productId === productId);
  const isLoading = toggleStatus === 'loading';
  
  const handleToggle = () => {
    dispatch(toggleFavoriteAction({
      productId,
      isCurrentlyFavorite: isFavorite,
    }));
  };
  
  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading}
      style={{
        padding: 8,
        borderRadius: 20,
        backgroundColor: isFavorite ? '#ff6b6b' : '#f0f0f0',
      }}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? 'white' : '#666'}
      />
      {isLoading && <ActivityIndicator size="small" />}
    </TouchableOpacity>
  );
};
```

### Ajouter/Retirer manuellement
```typescript
import { addToFavoritesAction, removeFromFavoritesAction } from '../store/favorite/actions';

const ProductDetailScreen = ({ productId }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorite.data);
  
  const isFavorite = favorites.some(fav => fav.productId === productId);
  
  const handleAddToFavorites = () => {
    dispatch(addToFavoritesAction({ productId }));
  };
  
  const handleRemoveFromFavorites = () => {
    dispatch(removeFromFavoritesAction({ productId }));
  };
  
  return (
    <View>
      {isFavorite ? (
        <Button
          title="Retirer des favoris"
          onPress={handleRemoveFromFavorites}
        />
      ) : (
        <Button
          title="Ajouter aux favoris"
          onPress={handleAddToFavorites}
        />
      )}
    </View>
  );
};
```

### Badge de compteur favoris
```typescript
const FavoritesTab = () => {
  const favorites = useSelector((state: RootState) => state.favorite.data);
  const validCount = favorites.filter(fav => fav.product !== null).length;
  
  return (
    <Tab.Screen
      name="Favoris"
      component={FavoritesScreen}
      options={{
        tabBarBadge: validCount > 0 ? validCount : undefined,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="heart-outline" size={size} color={color} />
        ),
      }}
    />
  );
};
```

### Optimisation avec useMemo
```typescript
const FavoritesScreen = () => {
  const favorites = useSelector((state: RootState) => state.favorite.data);
  
  const validFavorites = useMemo(
    () => favorites.filter(fav => fav.product !== null),
    [favorites]
  );
  
  const favoriteProductIds = useMemo(
    () => new Set(favorites.map(fav => fav.productId)),
    [favorites]
  );
  
  const isFavorite = (productId: string) => favoriteProductIds.has(productId);
  
  return (
    // ...
  );
};
```

### Synchronisation au login/logout
```typescript
// App.tsx ou Navigation
import { clearFavorites } from '../store/favorite/slice';

useEffect(() => {
  if (isAuthenticated) {
    // Charger les favoris au login
    dispatch(getUserFavoritesAction());
  } else {
    // Vider les favoris au logout
    dispatch(clearFavorites());
  }
}, [isAuthenticated]);
```

## Backend - Traitement

### Logique Backend
1. **Add**: 
   - Vérifie existence du produit
   - Vérifie unicité (userId + productId)
   - Crée notification pour le vendeur
   - Retourne le favori avec produit complet

2. **Remove**:
   - Supprime l'entrée de la table Favorite
   - Retourne confirmation

3. **Get**:
   - Filtre par userId
   - Inclut les détails du produit
   - Retourne liste complète

### Contraintes Prisma
```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  productId String
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, productId]) // Un utilisateur = 1 favori par produit
}
```

## Cas d'Usage

### 1. Liste de souhaits
```typescript
// Page "Mes favoris"
const validFavorites = favorites.filter(fav => fav.product?.status === 'VALIDATED');
```

### 2. Comparaison de produits
```typescript
const CompareFavorites = () => {
  const favorites = useSelector((state: RootState) => state.favorite.data);
  const selectedIds = useState<string[]>([]);
  
  // Sélectionner jusqu'à 3 favoris pour comparaison
  const selectedProducts = favorites
    .filter(fav => selectedIds.includes(fav.productId))
    .map(fav => fav.product);
};
```

### 3. Notifications de prix
```typescript
// Vérifier si le prix d'un favori a baissé
const checkPriceDrops = () => {
  favorites.forEach(fav => {
    if (fav.product && fav.product.price < fav.originalPrice) {
      // Afficher notification
    }
  });
};
```

### 4. Partage de favoris
```typescript
const shareFavorites = async () => {
  const favoriteLinks = favorites
    .filter(fav => fav.product)
    .map(fav => `buyandsale://product/${fav.productId}`)
    .join('\n');
    
  await Share.share({
    message: `Mes produits favoris:\n${favoriteLinks}`,
  });
};
```

## Gestion des Produits Supprimés

Les favoris pointant vers des produits supprimés ont `product: null` :

```typescript
// Filtrer les favoris invalides
const invalidFavorites = favorites.filter(fav => fav.product === null);

// Nettoyer les favoris invalides
const cleanupInvalidFavorites = async () => {
  for (const fav of invalidFavorites) {
    await dispatch(removeFromFavoritesAction({ productId: fav.productId }));
  }
};
```

## Performance et Optimisation

### 1. Debounce Toggle
```typescript
import { debounce } from 'lodash';

const debouncedToggle = useMemo(
  () => debounce((productId, isFavorite) => {
    dispatch(toggleFavoriteAction({ productId, isCurrentlyFavorite: isFavorite }));
  }, 300),
  [dispatch]
);
```

### 2. Cache Local
```typescript
// Sauvegarder favoriteIds dans AsyncStorage pour accès rapide
useEffect(() => {
  const favoriteIds = favorites.map(fav => fav.productId);
  AsyncStorage.setItem('favoriteIds', JSON.stringify(favoriteIds));
}, [favorites]);
```

### 3. Optimistic Updates
```typescript
// Mettre à jour UI immédiatement, rollback si erreur
const optimisticToggle = (productId: string) => {
  const isFavorite = favorites.some(fav => fav.productId === productId);
  
  // UI update immédiat
  if (isFavorite) {
    // Retirer visuellement
  } else {
    // Ajouter visuellement
  }
  
  // Requête backend
  dispatch(toggleFavoriteAction({ productId, isCurrentlyFavorite: isFavorite }))
    .unwrap()
    .catch(() => {
      // Rollback en cas d'erreur
    });
};
```

## Notifications Backend

Lors de l'ajout aux favoris, une notification est créée pour le vendeur :

```typescript
// Backend crée automatiquement:
{
  type: 'FAVORITE_ADDED',
  title: 'Nouveau favori',
  message: '{userName} a ajouté votre produit "{productTitle}" à ses favoris',
  link: '/product/{productId}'
}
```

## Routes Admin Non Implémentées

Aucune route admin pour les favoris. Les statistiques de favoris par produit sont accessibles via les endpoints produits.

## Notes Importantes

1. **Authentification** : Toutes les actions nécessitent un token valide
2. **Unicité** : Un utilisateur ne peut ajouter qu'une fois le même produit (contrainte BDD)
3. **Cascade Delete** : Si un produit est supprimé, les favoris associés le sont aussi
4. **Notification** : Le vendeur reçoit une notification quand son produit est ajouté
5. **Performance** : Utiliser `toggleStatus` pour éviter les doubles clics

## Cohérence avec le Frontend React

✅ Types identiques au frontend React  
✅ Même structure de state avec `toggleStatus`  
✅ Mêmes actions (get, add, remove, toggle)  
✅ Même gestion des produits supprimés (product: null)  
✅ Action `clearFavorites` au logout  

## Cohérence avec le Backend

✅ Routes authentifiées correctement identifiées  
✅ Token AsyncStorage utilisé  
✅ Payloads conformes (productId)  
✅ Gestion cascade delete  
✅ Contrainte unicité respectée  

## Améliorations Futures

1. **Tri et Filtres**
   - Par prix
   - Par catégorie
   - Par date d'ajout

2. **Collections**
   - Créer des dossiers de favoris
   - Partager des collections

3. **Alertes Prix**
   - Notification si baisse de prix
   - Seuil personnalisable

4. **Statistiques**
   - Prix moyen des favoris
   - Catégories favorites

5. **Export**
   - PDF de la liste de souhaits
   - Partage par email
