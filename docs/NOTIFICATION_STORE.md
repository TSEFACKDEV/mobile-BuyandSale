# Notification Store - Implementation

## Résumé
Le store **notification** permet aux utilisateurs authentifiés de :
- Consulter toutes leurs notifications
- Marquer une notification comme lue
- Marquer toutes les notifications comme lues
- Recevoir de nouvelles notifications (préparé pour push notifications futures)

## Routes Backend Implémentées

### Toutes Authentifiées (Token requis)
```
GET   /notification              - Récupère toutes les notifications de l'utilisateur
PATCH /notification/:id/read     - Marque une notification comme lue
PATCH /notification/mark-all-read - Marque toutes les notifications comme lues
```

## Actions Implémentées

### Authentifiées
1. **fetchNotificationsAction** - Récupère toutes les notifications
   - Retourne un tableau de notifications
   - Calcule automatiquement le nombre de non lues

2. **markAsReadAction** - Marque une notification comme lue
   - Payload: `string` (notificationId)
   - Met à jour la notification et décrémente le compteur de non lues

3. **markAllAsReadAction** - Marque toutes comme lues
   - Aucun payload requis
   - Réinitialise le compteur à 0

## État du Store

```typescript
{
  items: Notification[]           // Toutes les notifications
  unreadCount: number             // Nombre de notifications non lues
  status: LoadingType             // Statut de chargement fetch
  error: string | null            // Message d'erreur global
  markAsReadStatus: LoadingType   // Statut marquage individuel
  markAllAsReadStatus: LoadingType // Statut marquage global
}
```

## Types

### Notification
```typescript
{
  id: string
  userId: string
  title: string                    // Titre de la notification
  message: string                  // Message détaillé
  read: boolean                    // Statut lu/non lu
  type: string | null              // Type (ex: 'product', 'review', 'user')
  link: string | null              // Lien vers ressource associée
  data: Record<string, unknown> | null  // Données additionnelles
  createdAt: string                // Date de création
}
```

## Reducers Personnalisés

Le slice expose des actions pour gérer l'état :
- `addNotification(notification)` - Ajoute une nouvelle notification (pour push notifications)
- `clearNotificationError()` - Réinitialise les erreurs
- `resetMarkAsReadStatus()` - Réinitialise le statut de marquage individuel
- `resetMarkAllAsReadStatus()` - Réinitialise le statut de marquage global

## Utilisation dans l'Application Mobile

### Afficher la liste des notifications
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationsAction } from '../store/notification/actions';
import { RootState } from '../store';

const NotificationScreen = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, status } = useSelector(
    (state: RootState) => state.notification
  );
  
  useEffect(() => {
    dispatch(fetchNotificationsAction());
  }, []);
  
  if (status === 'loading') return <Loading />;
  
  return (
    <View>
      <Text>Notifications ({unreadCount} non lues)</Text>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <NotificationCard notification={item} />
        )}
      />
    </View>
  );
};
```

### Marquer une notification comme lue
```typescript
import { markAsReadAction } from '../store/notification/actions';

const NotificationCard = ({ notification }) => {
  const dispatch = useDispatch();
  
  const handlePress = () => {
    if (!notification.read) {
      dispatch(markAsReadAction(notification.id));
    }
    
    // Naviguer vers le lien si disponible
    if (notification.link) {
      navigation.navigate(notification.link);
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={{ backgroundColor: notification.read ? '#fff' : '#e3f2fd' }}>
        <Text style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
          {notification.title}
        </Text>
        <Text>{notification.message}</Text>
        <Text>{new Date(notification.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
};
```

### Badge de notifications non lues
```typescript
import { selectUnreadCount } from '../store/notification/slice';

const TabNavigator = () => {
  const unreadCount = useSelector(selectUnreadCount);
  
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
```

### Marquer toutes comme lues
```typescript
import { markAllAsReadAction } from '../store/notification/actions';

const NotificationHeader = () => {
  const dispatch = useDispatch();
  const { unreadCount, markAllAsReadStatus } = useSelector(
    (state: RootState) => state.notification
  );
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsReadAction());
  };
  
  return (
    <View>
      <Button
        onPress={handleMarkAllAsRead}
        disabled={unreadCount === 0 || markAllAsReadStatus === 'loading'}
      >
        Tout marquer comme lu
      </Button>
    </View>
  );
};
```

## Intégration Push Notifications (Futur)

Le reducer `addNotification` est déjà préparé pour recevoir de nouvelles notifications :

```typescript
// Exemple avec Expo Notifications
import * as Notifications from 'expo-notifications';
import { addNotification } from '../store/notification/slice';

Notifications.addNotificationReceivedListener((notification) => {
  const notificationData = notification.request.content.data as Notification;
  dispatch(addNotification(notificationData));
});
```

## Différences avec Frontend React

### Non Implémenté en Mobile
- ❌ **Socket.io** - Le frontend React utilise Socket.io pour les notifications temps réel
  - `connectSocketAction` et `disconnectSocketAction` non implémentés
  - `socketConnected` state non présent
  - Raison: React Native utilisera plutôt Push Notifications natives

### Préparé pour l'Avenir
- ✅ `addNotification` reducer disponible pour push notifications
- ✅ Structure compatible avec Expo Notifications
- ✅ Gestion du `unreadCount` automatique

## Routes Admin Non Implémentées

Aucune route admin pour les notifications. Tous les utilisateurs authentifiés peuvent consulter leurs propres notifications uniquement.

## Notes Importantes

1. **Authentification** : Toutes les actions nécessitent un token valide
2. **Unread Count** : Calculé automatiquement lors du fetch et mis à jour lors du marquage
3. **Type de Notification** : Utilisé pour router vers la bonne page (ex: `type: 'product'` → page produit)
4. **Link** : Chemin de navigation vers la ressource liée
5. **Data** : Contient des métadonnées additionnelles (ex: productId, userId)
6. **Temps Réel** : Utilisera Expo Push Notifications au lieu de Socket.io

## Cohérence avec le Frontend React

✅ Types identiques au frontend React  
✅ Même structure de state (sauf Socket.io)  
✅ Mêmes actions de base (fetch, markAsRead, markAllAsRead)  
⚠️ Socket.io remplacé par Push Notifications (architecture mobile)  
✅ `addNotification` reducer présent et compatible  

## Cohérence avec le Backend

✅ Routes authentifiées correctement identifiées  
✅ Token AsyncStorage utilisé pour toutes les requêtes  
✅ Gestion des erreurs basée sur réponses API  
✅ Structure Notification conforme au modèle Prisma  

## Améliorations Futures

1. **Expo Push Notifications**
   - Configuration du service push
   - Enregistrement du device token
   - Gestion des permissions
   - Deep linking vers les ressources

2. **Filtrage**
   - Par type de notification
   - Par statut (lu/non lu)
   - Par date

3. **Actions Bulk**
   - Supprimer toutes les notifications lues
   - Supprimer anciennes notifications (> 30 jours)

4. **Optimisation**
   - Pagination pour grandes listes
   - Pull-to-refresh
   - Cache local avec AsyncStorage
