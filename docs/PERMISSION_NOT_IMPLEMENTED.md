# Store Permission - Non implémenté pour la version mobile

## ❌ Pourquoi le store Permission n'est pas nécessaire dans l'application mobile ?

### 1. **Toutes les routes nécessitent des permissions admin**

Analyse des routes backend (`server/src/routes/permission.routes.ts`) :

```typescript
router.use(authenticate); // Authentification obligatoire

router.get('/', checkPermission('PERMISSION_READ'), getAll);
router.get('/:id', checkPermission('PERMISSION_READ'), getById);
router.post('/', checkPermission('PERMISSION_CREATE'), create);
router.put('/:id', checkPermission('PERMISSION_UPDATE'), update);
router.delete('/:id', checkPermission('PERMISSION_DELETE'), destroy);
router.post('/assign-permissions', checkPermission('PERMISSION_ASSIGN'), assignPermissionsToRole);
router.post('/remove-permissions', checkPermission('PERMISSION_ASSIGN'), removePermissionsFromRole);
```

**Conclusion :** Aucun endpoint public disponible. Toutes les routes requièrent :
- ✅ Authentification (`authenticate`)
- ✅ Permission spécifique (`PERMISSION_READ`, `PERMISSION_CREATE`, etc.)

### 2. **Les permissions sont réservées aux administrateurs**

Les permissions sont utilisées pour :
- Gérer les rôles et leurs permissions (admin)
- Assigner/retirer des permissions à des rôles (admin)
- Contrôler l'accès aux fonctionnalités (backend)

**Usage typique :** Interface web d'administration uniquement

### 3. **Les permissions de l'utilisateur mobile sont automatiques**

Les permissions d'un utilisateur mobile sont :
- Attachées à son rôle (USER, SELLER, etc.)
- Chargées automatiquement lors de la connexion
- Incluses dans le profil utilisateur (`auth` store)
- Vérifiées côté backend pour chaque requête

**Exemple de profil utilisateur :**
```typescript
{
  id: "...",
  firstName: "...",
  role: {
    id: "role-id",
    name: "USER",
    permissions: [
      { permissionKey: "PRODUCT_CREATE" },
      { permissionKey: "PRODUCT_UPDATE" },
      // ...
    ]
  }
}
```

### 4. **Architecture recommandée pour mobile**

Pour les applications mobiles :

#### ✅ **Ce qui est implémenté :**
- `authentification` store - Profil utilisateur avec rôle et permissions
- Vérification des permissions côté composant (si nécessaire)
- Protection des routes basée sur le rôle

#### ❌ **Ce qui n'est PAS nécessaire :**
- Store `permission` - Gestion CRUD des permissions
- Store `role` - Gestion CRUD des rôles
- Interface de gestion des permissions/rôles

### 5. **Alternative pour vérifier les permissions**

Si besoin de vérifier les permissions dans l'app mobile :

```typescript
// hooks/usePermission.ts
import { useAppSelector } from './store'
import { selectUserAuthenticated } from '../store/authentification/slice'

export const useHasPermission = (permissionKey: string): boolean => {
  const user = useAppSelector(selectUserAuthenticated)
  
  if (!user || !user.role?.permissions) return false
  
  return user.role.permissions.some(
    (p) => p.permissionKey === permissionKey
  )
}

// Usage dans un composant
const canCreateProduct = useHasPermission('PRODUCT_CREATE')
```

## ✅ Stores implémentés pour mobile

| Store | Raison | Endpoints publics |
|-------|--------|-------------------|
| **authentification** | ✅ Connexion/profil utilisateur | Oui |
| **register** | ✅ Inscription | Oui |
| **password** | ✅ Réinitialisation mot de passe | Oui |
| **city** | ✅ Liste des villes pour formulaires | Oui (GET /city) |
| **category** | ✅ Liste des catégories | Oui (GET /category) |
| **user** | ✅ Vendeurs publics | Oui (GET /user/public-sellers) |
| **permission** | ❌ Admin uniquement | Non (tous protégés) |
| **role** | ❌ Admin uniquement | Non (tous protégés) |

## 📝 Conclusion

Le store `permission` n'est **pas implémenté** dans l'application mobile car :
1. Aucun endpoint public
2. Fonctionnalités réservées aux administrateurs
3. Les permissions sont déjà disponibles via le profil utilisateur
4. Gestion prévue uniquement sur la version web

**Version web :** Interface complète de gestion des permissions et rôles
**Version mobile :** Utilisation des permissions via le profil utilisateur
