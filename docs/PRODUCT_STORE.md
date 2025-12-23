# 📦 PRODUCT STORE - Documentation Complète

## Vue d'ensemble

Le **Product Store** est le cœur de l'application marketplace BuyandSale. Il gère toutes les opérations liées aux produits : affichage, recherche, filtrage, création, modification, suppression, vues et statistiques.

---

## 🎯 Fonctionnalités

### Routes Publiques (Sans authentification)
1. ✅ **Liste produits validés** - Marketplace avec filtres avancés
2. ✅ **Produits par catégorie** - Filtrage par catégorie avec pagination
3. ✅ **Statistiques de vues** - Nombre de vues d'un produit (public)

### Routes Authentifiées
4. ✅ **Détails produit** - Voir un produit par ID/slug (auth requise)
5. ✅ **Produits d'un vendeur** - Profil vendeur avec ses annonces
6. ✅ **Produits d'un utilisateur** - Profil utilisateur avec ses annonces
7. ✅ **Mes produits en attente** - Annonces en attente de validation
8. ✅ **Créer un produit** - Upload d'images + FormData
9. ✅ **Modifier un produit** - Mise à jour avec/sans nouvelles images
10. ✅ **Supprimer un produit** - Suppression complète (images + cascade)
11. ✅ **Enregistrer une vue** - Tracking unique par utilisateur

---

## 📋 Actions Redux

### 1. getValidatedProductsAction (Public)
Récupère tous les produits validés de la marketplace avec filtres avancés.

**Backend:** `GET /product`

**Paramètres:**
```typescript
{
  search?: string;          // Recherche par nom
  categoryId?: string;      // Filtrer par catégorie
  cityId?: string;          // Filtrer par ville
  priceMin?: number;        // Prix minimum
  priceMax?: number;        // Prix maximum
  etat?: 'NEUF' | 'OCCASION' | 'CORRECT';
  page?: number;            // Page (défaut: 1)
  limit?: number;           // Limite (défaut: 10)
}
```

**Réponse:**
```typescript
{
  products: Product[];
  links: {
    perpage: number;
    prevPage: number | null;
    currentPage: number;
    nextPage: number | null;
    totalPage: number;
    total: number;
  };
}
```

**État Redux:**
- `validatedProducts`: Product[]
- `validatedProductsStatus`: LoadingType
- `validatedProductsError`: string | null
- `validatedProductsPagination`: links

**Usage:**
```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getValidatedProductsAction } from '../store/product/actions';

const ProductListScreen = () => {
  const dispatch = useAppDispatch();
  const { validatedProducts, validatedProductsStatus } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getValidatedProductsAction({
      page: 1,
      limit: 20,
      categoryId: 'electronics',
      priceMax: 500000,
      etat: 'NEUF'
    }));
  }, []);

  if (validatedProductsStatus === 'loading') return <Loader />;
  
  return (
    <FlatList
      data={validatedProducts}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
};
```

---

### 2. getCategoryProductsAction (Public)
Récupère les produits d'une catégorie spécifique.

**Backend:** `GET /product/category/:categoryId/products`

**Paramètres:**
```typescript
{
  categoryId: string;       // ID de la catégorie
  filters?: {
    search?: string;
    cityId?: string;
    priceMin?: number;
    priceMax?: number;
    etat?: 'NEUF' | 'OCCASION' | 'CORRECT';
    page?: number;
    limit?: number;
  };
}
```

**Réponse:**
```typescript
{
  products: Product[];
  links: { ... };
  category: {
    id: string;
    name: string;
    description?: string;
  };
}
```

**État Redux:**
- `categoryProducts`: Product[]
- `categoryProductsStatus`: LoadingType
- `currentCategory`: { id, name, description }

**Usage:**
```typescript
dispatch(getCategoryProductsAction({
  categoryId: 'electronics-123',
  filters: {
    cityId: 'douala',
    page: 1,
    limit: 15
  }
}));
```

---

### 3. getProductByIdAction (Auth)
Récupère les détails d'un produit par ID ou slug (authentification requise).

**Backend:** `GET /product/:id`

**Paramètres:** `productId: string` (ID ou slug)

**Réponse:** `Product` (avec user, category, city)

**État Redux:**
- `currentProduct`: Product | null
- `currentProductStatus`: LoadingType

**Usage:**
```typescript
const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const { currentProduct, currentProductStatus } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getProductByIdAction(productId));
  }, [productId]);

  if (currentProductStatus === 'loading') return <Loader />;
  if (!currentProduct) return <NotFound />;

  return <ProductDetails product={currentProduct} />;
};
```

---

### 4. getSellerProductsAction (Auth)
Récupère les produits d'un vendeur spécifique.

**Backend:** `GET /product/seller/:sellerId`

**Paramètres:**
```typescript
{
  sellerId: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

**Réponse:**
```typescript
{
  products: Product[];
  links: { ... };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
}
```

**État Redux:**
- `sellerProducts`: Product[]
- `currentSeller`: seller info

---

### 5. getUserProductsAction (Auth)
Récupère les produits validés d'un utilisateur.

**Backend:** `GET /product/user/:userId`

**Usage similaire à getSellerProductsAction**

---

### 6. getMyPendingProductsAction (Auth)
Récupère les produits en attente de validation de l'utilisateur connecté.

**Backend:** `GET /product/my-pending`

**Paramètres:** Aucun

**Réponse:**
```typescript
{
  products: Product[];  // Status = PENDING
  links: { total: number };
}
```

**État Redux:**
- `myPendingProducts`: Product[]
- `myPendingProductsStatus`: LoadingType

**Usage:**
```typescript
const MyPendingScreen = () => {
  const dispatch = useAppDispatch();
  const { myPendingProducts } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(getMyPendingProductsAction());
  }, []);

  return (
    <View>
      <Text>Produits en attente de validation: {myPendingProducts.length}</Text>
      <FlatList data={myPendingProducts} ... />
    </View>
  );
};
```

---

### 7. createProductAction (Auth) ⚠️ FormData
Crée un nouveau produit avec upload d'images.

**Backend:** `POST /product`

**Paramètres:**
```typescript
{
  name: string;
  price: number;
  quantity: number;
  description: string;
  categoryId: string;
  cityId: string;
  etat: 'NEUF' | 'OCCASION' | 'CORRECT';
  quartier?: string;
  telephone?: string;
  images: Array<{           // React Native Image Picker
    uri: string;
    type: string;
    fileName: string;
  }>;
}
```

**Réponse:** `{ product: Product }`

**État Redux:**
- `createProductStatus`: LoadingType
- `createProductError`: string | null
- Ajoute le produit à `myPendingProducts`

**Usage avec React Native Image Picker:**
```typescript
import * as ImagePicker from 'expo-image-picker';

const CreateProductScreen = () => {
  const dispatch = useAppDispatch();
  const { createProductStatus, createProductError } = useAppSelector(
    (state) => state.product
  );
  const [images, setImages] = useState([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleSubmit = async () => {
    const formattedImages = images.map((img) => ({
      uri: img.uri,
      type: 'image/jpeg',
      fileName: img.fileName || 'image.jpg',
    }));

    await dispatch(createProductAction({
      name: 'PC Gamer ASUS ROG',
      price: 500000,
      quantity: 1,
      description: 'PC ultra performant',
      categoryId: 'electronics-id',
      cityId: 'douala-id',
      etat: 'NEUF',
      quartier: 'Akwa',
      telephone: '+237670000000',
      images: formattedImages,
    }));

    if (createProductStatus === 'succeeded') {
      navigation.navigate('MyProducts');
    }
  };

  return (
    <View>
      <Button title="Choisir images" onPress={pickImages} />
      <Text>{images.length} images sélectionnées</Text>
      
      {/* Formulaire */}
      
      <Button 
        title="Publier l'annonce" 
        onPress={handleSubmit}
        loading={createProductStatus === 'loading'}
      />
      
      {createProductError && <Text style={styles.error}>{createProductError}</Text>}
    </View>
  );
};
```

---

### 8. updateProductAction (Auth)
Met à jour un produit existant (avec ou sans nouvelles images).

**Backend:** `PUT /product/:id`

**Paramètres:**
```typescript
{
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
  categoryId?: string;
  cityId?: string;
  images?: Array<{ uri, type, fileName }>;  // Optionnel
}
```

**Réponse:** `{ product: Product }`

**État Redux:**
- `updateProductStatus`: LoadingType
- Met à jour le produit dans toutes les listes (currentProduct, myPendingProducts, etc.)

**Usage:**
```typescript
const handleUpdate = async () => {
  await dispatch(updateProductAction({
    id: productId,
    name: 'Nouveau titre',
    price: 450000,
    // Pas d'images = garde les anciennes
  }));
};
```

---

### 9. deleteProductAction (Auth)
Supprime un produit et toutes ses relations (images, favoris, vues).

**Backend:** `DELETE /product/:id`

**Paramètres:** `productId: string`

**Réponse:** `{ productId: string }`

**État Redux:**
- `deleteProductStatus`: LoadingType
- Retire le produit de toutes les listes

**Usage:**
```typescript
const handleDelete = async () => {
  Alert.alert(
    'Confirmer la suppression',
    'Êtes-vous sûr de vouloir supprimer ce produit ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteProductAction(productId));
          navigation.goBack();
        },
      },
    ]
  );
};
```

---

### 10. recordProductViewAction (Auth)
Enregistre une vue unique de produit (1 vue max par utilisateur).

**Backend:** `POST /product/:productId/view`

**Paramètres:** `productId: string`

**Réponse:**
```typescript
{
  isNewView: boolean;    // true si première vue
  viewCount: number;     // Nombre total de vues
}
```

**État Redux:**
- `recordViewStatus`: LoadingType
- `lastViewResponse`: { isNewView, viewCount }
- Met à jour `currentProduct.viewCount`

**Usage:**
```typescript
const ProductDetailScreen = ({ productId }) => {
  useEffect(() => {
    // Enregistrer la vue automatiquement
    dispatch(recordProductViewAction(productId));
  }, [productId]);

  // ...
};
```

---

### 11. getProductViewStatsAction (Public)
Récupère les statistiques de vues d'un produit.

**Backend:** `GET /product/:productId/stats`

**Paramètres:** `productId: string`

**Réponse:**
```typescript
{
  productId: string;
  totalViews: number;
  uniqueViews: number;
  viewsByDate: Array<{
    date: string;
    count: number;
  }>;
}
```

**État Redux:**
- `productStats`: ProductStatsResponse
- `productStatsStatus`: LoadingType

**Usage:**
```typescript
const ProductStatsScreen = ({ productId }) => {
  const dispatch = useAppDispatch();
  const { productStats } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(getProductViewStatsAction(productId));
  }, [productId]);

  return (
    <View>
      <Text>Vues totales: {productStats?.totalViews}</Text>
      <Text>Vues uniques: {productStats?.uniqueViews}</Text>
      <LineChart data={productStats?.viewsByDate} />
    </View>
  );
};
```

---

## 🛠️ Reducers Locaux

### clearValidatedProducts()
Réinitialise la liste des produits validés.

```typescript
dispatch(clearValidatedProducts());
```

### clearCurrentProduct()
Réinitialise le produit courant.

```typescript
useEffect(() => {
  return () => {
    dispatch(clearCurrentProduct()); // Cleanup on unmount
  };
}, []);
```

### clearCreateProductError()
Réinitialise les erreurs de création.

### clearUpdateProductError()
Réinitialise les erreurs de mise à jour.

---

## 📊 Structure du State

```typescript
{
  // Marketplace
  validatedProducts: Product[];
  validatedProductsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  validatedProductsError: string | null;
  validatedProductsPagination: { page, total, ... };

  // Catégorie
  categoryProducts: Product[];
  categoryProductsStatus: LoadingType;
  currentCategory: { id, name, description };

  // Détails
  currentProduct: Product | null;
  currentProductStatus: LoadingType;

  // Vendeur
  sellerProducts: Product[];
  currentSeller: { id, name, avatar, ... };

  // Utilisateur
  userProducts: Product[];
  userProductsPagination: { ... };

  // Mes produits en attente
  myPendingProducts: Product[];
  myPendingProductsStatus: LoadingType;

  // CRUD
  createProductStatus: LoadingType;
  createProductError: string | null;
  updateProductStatus: LoadingType;
  deleteProductStatus: LoadingType;

  // Vues
  recordViewStatus: LoadingType;
  lastViewResponse: { isNewView, viewCount };
  productStats: { totalViews, uniqueViews, viewsByDate };
}
```

---

## 🎨 Exemples d'Écrans

### Marketplace (Home)
```typescript
const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const { validatedProducts, validatedProductsStatus, validatedProductsPagination } = 
    useAppSelector((state) => state.product);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(getValidatedProductsAction({
      page,
      limit: 20,
      ...filters,
    }));
  }, [page, filters]);

  const loadMore = () => {
    if (validatedProductsPagination?.nextPage) {
      setPage(validatedProductsPagination.nextPage);
    }
  };

  return (
    <FlatList
      data={validatedProducts}
      renderItem={({ item }) => <ProductCard product={item} />}
      onEndReached={loadMore}
      ListHeaderComponent={<FilterBar onFilter={setFilters} />}
      refreshing={validatedProductsStatus === 'loading'}
    />
  );
};
```

### Catégorie
```typescript
const CategoryScreen = ({ route }) => {
  const { categoryId } = route.params;
  const { categoryProducts, currentCategory } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getCategoryProductsAction({
      categoryId,
      filters: { page: 1, limit: 20 },
    }));
  }, [categoryId]);

  return (
    <View>
      <Text style={styles.title}>{currentCategory?.name}</Text>
      <ProductGrid products={categoryProducts} />
    </View>
  );
};
```

### Profil Vendeur
```typescript
const SellerProfileScreen = ({ route }) => {
  const { sellerId } = route.params;
  const { sellerProducts, currentSeller } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getSellerProductsAction({ sellerId }));
  }, [sellerId]);

  return (
    <View>
      <SellerCard seller={currentSeller} />
      <ProductList products={sellerProducts} />
    </View>
  );
};
```

---

## ⚠️ Points Importants

### Upload d'Images
- **Utilise FormData** pour createProduct et updateProduct
- **Ne pas définir Content-Type** pour FormData (auto-détecté)
- **React Native Image Picker** requis
- **Format attendu:** `{ uri, type, fileName }`

### Authentification
- **Routes publiques:** getValidatedProducts, getCategoryProducts, getProductViewStats
- **Routes authentifiées:** Toutes les autres (token AsyncStorage requis)

### Cascade Delete
- Supprime automatiquement : images, favoris, vues, forfaits
- Conserve : notifications (nettoyage auto après 5 jours)

### Pagination
- **Défaut:** page=1, limit=10
- **Backend:** Tri par forfait (PREMIUM → TOP_ANNONCE → URGENT) puis date
- **Frontend:** Gestion pagination manuelle

### Gestion d'État
- **Mise à jour produit:** Synchronise currentProduct, myPendingProducts, validatedProducts
- **Suppression produit:** Retire de toutes les listes
- **Vues produit:** Met à jour viewCount automatiquement

---

## 🔗 Intégration Backend

### Endpoints Utilisés
```
GET    /product                         → getValidatedProducts
GET    /product/category/:id/products   → getCategoryProducts
GET    /product/:id                     → getProductById (auth)
GET    /product/seller/:id              → getSellerProducts (auth)
GET    /product/user/:id                → getUserProducts (auth)
GET    /product/my-pending              → getMyPendingProducts (auth)
POST   /product                         → createProduct (auth + FormData)
PUT    /product/:id                     → updateProduct (auth)
DELETE /product/:id                     → deleteProduct (auth)
POST   /product/:id/view                → recordProductView (auth)
GET    /product/:id/stats               → getProductViewStats
```

### Permissions Backend
- `PRODUCT_CREATE` → createProduct
- `PRODUCT_UPDATE` → updateProduct
- `PRODUCT_DELETE` → deleteProduct
- Rôle USER requis pour routes auth

---

## 📝 Next Steps

1. ✅ **Store implémenté** - 11 actions + 4 reducers
2. ⏭️ **Configuration React Native Image Picker**
3. ⏭️ **Tests d'upload d'images**
4. ⏭️ **Deep linking** pour produits (slug SEO)
5. ⏭️ **Filtres avancés UI**
6. ⏭️ **Tri par forfait** (affichage badges)
7. ⏭️ **Statistiques graphiques** (Chart.js mobile)

---

**Créé le:** 23 décembre 2025  
**Auteur:** GitHub Copilot (Claude Sonnet 4.5)  
**Version:** 1.0
