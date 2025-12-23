# Store Report - Non implémenté pour la version mobile

## ❌ Pourquoi le store Report n'est pas nécessaire dans l'application mobile ?

### 1. **Toutes les routes `/reports` nécessitent des permissions admin**

Analyse des routes backend (`server/src/routes/report.routes.ts`) :

```typescript
router.use(authenticate); // Authentification obligatoire

router.get('/', checkPermission('REPORT_VIEW_ALL'), getAllReports);
router.get('/statistics', checkPermission('REPORT_VIEW_ALL'), getReportsStatistics);
router.get('/:id', checkPermission('REPORT_VIEW'), getReportById);
router.put('/:id/process', checkPermission('REPORT_PROCESS'), processReport);
```

**Conclusion :** Aucun endpoint public disponible. Toutes les routes requièrent :
- ✅ Authentification (`authenticate`)
- ✅ Permissions admin spécifiques :
  - `REPORT_VIEW_ALL` - Voir tous les signalements
  - `REPORT_VIEW` - Voir un signalement
  - `REPORT_PROCESS` - Traiter un signalement

### 2. **La fonctionnalité de signalement est déjà implémentée**

✅ **Fonctionnalité pour utilisateurs mobiles :**

La route pour **signaler un utilisateur** est disponible et **déjà implémentée** dans le store `user` :

**Route backend :**
```typescript
// server/src/routes/user.routes.ts
router.post("/report/:id", checkPermission("USER_REPORT"), reportUser);
```

**Action Redux mobile :**
```typescript
// mobile-BuyandSale/src/store/user/actions.ts
export const reportUserAction = createAsyncThunk<
  { message: string },
  { id: string; reason: string; details?: string },
  ThunkApi
>('user/report', async ({ id, reason, details }, { rejectWithValue }) => {
  // Implémentation complète
})
```

**Usage dans l'application :**
```typescript
import { reportUserAction } from '../store/user/actions'

// Signaler un utilisateur
dispatch(reportUserAction({
  id: 'user-id',
  reason: 'Spam',
  details: 'Contenu inapproprié'
}))
```

### 3. **Les signalements admin sont réservés à la version web**

Le store `report` du frontend React concerne la **gestion des signalements** par les administrateurs :
- Voir la liste de tous les signalements
- Consulter les détails d'un signalement
- Traiter/Résoudre un signalement
- Voir les statistiques des signalements

**Ces fonctionnalités sont réservées à l'interface web d'administration.**

### 4. **Architecture pour mobile**

#### ✅ **Ce qui est implémenté :**
- `user` store → Action `reportUserAction` pour signaler un utilisateur
- Authentification requise (token géré automatiquement)
- Permission `USER_REPORT` vérifiée côté backend

#### ❌ **Ce qui n'est PAS nécessaire :**
- Store `report` - Gestion CRUD des signalements (admin)
- Consultation des signalements reçus
- Traitement/Résolution des signalements
- Statistiques des signalements

### 5. **Différence entre les actions**

| Action | Route | Permission | Disponible en mobile |
|--------|-------|------------|---------------------|
| **Signaler un utilisateur** | `POST /user/report/:id` | USER_REPORT | ✅ Oui (store `user`) |
| Voir tous les signalements | `GET /reports` | REPORT_VIEW_ALL | ❌ Non (admin web) |
| Voir un signalement | `GET /reports/:id` | REPORT_VIEW | ❌ Non (admin web) |
| Traiter un signalement | `PUT /reports/:id/process` | REPORT_PROCESS | ❌ Non (admin web) |
| Statistiques | `GET /reports/statistics` | REPORT_VIEW_ALL | ❌ Non (admin web) |

### 6. **Exemple d'utilisation en mobile**

```typescript
import { useAppDispatch, useAppSelector } from '../hooks/store'
import { reportUserAction } from '../store/user/actions'
import { selectReportStatus, resetReportStatus } from '../store/user/slice'

const ReportUserComponent = ({ userId }) => {
  const dispatch = useAppDispatch()
  const reportStatus = useAppSelector(selectReportStatus)

  const handleReport = async () => {
    try {
      await dispatch(reportUserAction({
        id: userId,
        reason: 'SPAM',
        details: 'Envoi de messages non sollicités'
      })).unwrap()

      Alert.alert('Succès', 'Utilisateur signalé avec succès')
      dispatch(resetReportStatus())
    } catch (error) {
      Alert.alert('Erreur', error.message)
    }
  }

  return (
    <Button
      onPress={handleReport}
      loading={reportStatus === LoadingType.PENDING}
    >
      Signaler cet utilisateur
    </Button>
  )
}
```

## ✅ Stores implémentés vs Non implémentés

| Store | Status | Raison |
|-------|--------|--------|
| ✅ authentification | Implémenté | Connexion/profil (public + auth) |
| ✅ register | Implémenté | Inscription (public) |
| ✅ password | Implémenté | Mot de passe (public) |
| ✅ city | Implémenté | Villes (public) |
| ✅ category | Implémenté | Catégories (public) |
| ✅ user | Implémenté | Vendeurs + **reportUserAction** (public + auth) |
| ❌ permission | Non implémenté | Admin uniquement (0 endpoint public) |
| ❌ role | Non implémenté | Admin uniquement (0 endpoint public) |
| ❌ report | **Non implémenté** | Admin uniquement (gestion signalements) |

## 📝 Conclusion

Le store `report` n'est **pas implémenté** dans l'application mobile car :

1. ✅ **Fonctionnalité de signalement disponible** via `user.reportUserAction`
2. ❌ **Gestion des signalements** réservée aux admins (version web)
3. ❌ **Aucun endpoint public** pour consulter/traiter les signalements
4. ✅ **Architecture simplifiée** pour l'usage mobile

**Version web :** Interface complète de gestion des signalements (liste, détails, traitement, stats)  
**Version mobile :** Possibilité de signaler un utilisateur via le store `user`
