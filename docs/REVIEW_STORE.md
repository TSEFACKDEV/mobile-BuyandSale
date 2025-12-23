# Review Store - Implementation

## Résumé
Le store **review** permet aux utilisateurs de :
- Consulter les reviews d'un vendeur (public)
- Créer, modifier et supprimer leurs propres reviews (authentifié)
- Consulter une review spécifique par ID (public)
- Consulter la liste de leurs reviews (authentifié)

## Routes Backend Implémentées

### Routes Publiques (Pas d'authentification requise)
```
GET /review/seller/:userId - Récupère toutes les reviews d'un vendeur avec statistiques
GET /review/:id - Récupère une review spécifique par son ID
```

### Routes Authentifiées (Token requis)
```
GET /review/my-reviews - Récupère toutes les reviews de l'utilisateur connecté
POST /review - Crée une nouvelle review
PUT /review/:id - Met à jour une review existante
DELETE /review/:id - Supprime une review
```

## Actions Implémentées

### Public
1. **getSellerReviewsAction** - Récupère les reviews d'un vendeur
   - Retourne les reviews, les statistiques (moyenne, distribution) et les infos du vendeur
   - Utilisé pour afficher le profil d'un vendeur

2. **getReviewByIdAction** - Récupère une review spécifique
   - Retourne les détails complets d'une review (auteur, utilisateur noté, rating)

### Authentifié
3. **getMyReviewsAction** - Récupère mes reviews
   - Liste toutes les reviews créées par l'utilisateur connecté

4. **createReviewAction** - Crée une review
   - Payload: `{ userId: string, rating: number }`
   - Rating entre 1 et 5

5. **updateReviewAction** - Met à jour une review
   - Payload: `{ id: string, rating: number }`
   - Permet de modifier uniquement le rating

6. **deleteReviewAction** - Supprime une review
   - Nécessite l'ID de la review à supprimer

## État du Store

```typescript
{
  myReviews: Review[]                    // Reviews créées par l'utilisateur
  sellerReviews: SellerReviewsResponse   // Reviews d'un vendeur avec statistiques
  selectedReview: Review | null          // Review sélectionnée pour affichage détaillé
  error: string | null                   // Message d'erreur global
  
  // Status de chargement pour chaque opération
  createStatus: LoadingType
  updateStatus: LoadingType
  deleteStatus: LoadingType
  sellerStatus: LoadingType
  myReviewsStatus: LoadingType
  selectedReviewStatus: LoadingType
}
```

## Types

### Review
```typescript
{
  id: string
  rating: number
  userId: string      // ID de l'utilisateur noté
  authorId: string    // ID de l'auteur de la review
  createdAt: string
  user: {             // Utilisateur noté
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
  author: {           // Auteur de la review
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
}
```

### SellerReviewsResponse
```typescript
{
  seller: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
  reviews: Review[]
  statistics: {
    totalReviews: number
    averageRating: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      3: number
      1: number
    }
  }
}
```

## Reducers Personnalisés

Le slice expose des actions pour gérer l'état :
- `clearReviewError()` - Réinitialise les erreurs
- `resetCreateStatus()` - Réinitialise le statut de création
- `resetUpdateStatus()` - Réinitialise le statut de mise à jour
- `resetDeleteStatus()` - Réinitialise le statut de suppression
- `clearSellerReviews()` - Vide les reviews du vendeur
- `clearSelectedReview()` - Vide la review sélectionnée

## Utilisation dans l'Application Mobile

### Afficher les reviews d'un vendeur
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { getSellerReviewsAction } from '../store/review/actions';
import { RootState } from '../store';

const SellerProfile = ({ sellerId }) => {
  const dispatch = useDispatch();
  const { sellerReviews, sellerStatus } = useSelector((state: RootState) => state.review);
  
  useEffect(() => {
    dispatch(getSellerReviewsAction(sellerId));
  }, [sellerId]);
  
  if (sellerStatus === 'loading') return <Loading />;
  
  return (
    <View>
      <Text>Moyenne: {sellerReviews?.statistics.averageRating}/5</Text>
      <Text>Total: {sellerReviews?.statistics.totalReviews} avis</Text>
      {sellerReviews?.reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );
};
```

### Créer une review
```typescript
import { createReviewAction, resetCreateStatus } from '../store/review/actions';

const CreateReview = ({ userId }) => {
  const dispatch = useDispatch();
  const { createStatus, error } = useSelector((state: RootState) => state.review);
  const [rating, setRating] = useState(5);
  
  const handleSubmit = () => {
    dispatch(createReviewAction({ userId, rating }));
  };
  
  useEffect(() => {
    if (createStatus === 'succeeded') {
      // Afficher succès et fermer le modal
      dispatch(resetCreateStatus());
    }
  }, [createStatus]);
  
  return (
    <View>
      <StarRating value={rating} onChange={setRating} />
      <Button onPress={handleSubmit} loading={createStatus === 'loading'}>
        Soumettre
      </Button>
    </View>
  );
};
```

## Routes Admin Non Implémentées

Aucune route admin n'existe pour les reviews. Tous les utilisateurs authentifiés peuvent créer des reviews. La modération se fait probablement via le système de reports.

## Notes Importantes

1. **Rating** : Toujours entre 1 et 5
2. **Unicité** : Un utilisateur ne peut laisser qu'une seule review par vendeur (géré backend)
3. **Permissions** : Seul l'auteur peut modifier/supprimer sa review
4. **Statistiques** : Calculées automatiquement côté backend
5. **Temps réel** : Les statistiques sont mises à jour après chaque création/modification/suppression

## Cohérence avec le Frontend React

✅ Types identiques au frontend React  
✅ Même structure de state  
✅ Mêmes actions (sauf getAllReviews et refreshReviews qui ne sont pas utiles en mobile)  
✅ Même gestion des erreurs  
✅ Reducers personnalisés alignés  

## Cohérence avec le Backend

✅ Routes publiques correctement identifiées  
✅ Routes authentifiées avec token AsyncStorage  
✅ Payloads conformes aux validations backend  
✅ Gestion des erreurs basée sur les réponses API  
