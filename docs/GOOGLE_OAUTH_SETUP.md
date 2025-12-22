# 🔐 Configuration Google OAuth - Mobile App

## 📋 Vue d'ensemble

L'authentification Google OAuth a été implémentée dans l'application mobile React Native pour permettre aux utilisateurs de se connecter via leur compte Google.

---

## 🎯 Flow d'authentification

```
1. Utilisateur clique sur "Continuer avec Google"
   ↓
2. L'app ouvre le navigateur externe → Backend /auth/google
   ↓
3. Google authentifie l'utilisateur
   ↓
4. Backend reçoit les infos Google → Crée/Met à jour l'utilisateur
   ↓
5. Backend génère un token JWT → Redirige vers buyandsale://auth/social-callback?token=XXX
   ↓
6. Deep Link capturé par l'app → Navigue vers SocialCallback avec le token
   ↓
7. SocialCallback dispatch handleSocialAuthCallback(token)
   ↓
8. Action récupère le profil utilisateur avec le token
   ↓
9. Stockage local du token + user → Navigation automatique vers Main
```

---

## 🛠️ Implémentation détaillée

### 1. **Configuration Deep Linking**

**Fichier :** `app.json`
```json
{
  "expo": {
    "scheme": "buyandsale",
    "ios": {
      "bundleIdentifier": "com.buyandsale.app"
    },
    "android": {
      "package": "com.buyandsale.app"
    }
  }
}
```

**URLs supportées :**
- `buyandsale://auth/social-callback?token=XXX`
- `exp://localhost:19000/--/auth/social-callback?token=XXX` (dev)

---

### 2. **Navigation avec Deep Linking**

**Fichier :** `src/Navigation/RootNavigator.tsx`

**Configuration du linking :**
```typescript
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'buyandsale://',
    'http://localhost:19006',
    'exp://localhost:19000',
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          SocialCallback: 'auth/social-callback',
        },
      },
    },
  },
}
```

**Points importants :**
- ✅ Capture automatique des deep links
- ✅ Navigation vers `SocialCallback` avec params `{ token: 'XXX' }`
- ✅ Fonctionne même si l'app est fermée

---

### 3. **Action Redux - handleSocialAuthCallback**

**Fichier :** `src/store/authentification/actions.ts`

```typescript
export const handleSocialAuthCallback = createAsyncThunk<
  ApiResponse<AuthUser>,
  string,
  ThunkApi
>('auth/socialCallback', async (token, apiThunk) => {
  // Utiliser le token pour récupérer le profil utilisateur
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_PROFILE}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  // Retourner user + token pour stockage
  return {
    ...data,
    data: {
      ...data.data,
      token: {
        type: 'Bearer',
        AccessToken: token,
        refreshToken: '',
      },
    },
  };
});
```

**Traitement :**
1. Reçoit le token en paramètre
2. Appelle `auth/me` avec le token dans le header `Authorization`
3. Récupère les infos utilisateur complètes
4. Ajoute le token à l'objet user
5. Retourne pour stockage dans Redux + AsyncStorage

---

### 4. **Page SocialCallback**

**Fichier :** `src/pages/auth/SocialCallback/index.tsx`

**Logique :**
```typescript
useEffect(() => {
  const processAuth = async () => {
    // Extraire le token des params de navigation
    const token = route.params?.token
    
    if (!token) {
      setError('Token manquant')
      return
    }
    
    // Dispatch l'action
    const result = await dispatch(handleSocialAuthCallback(token))
    
    if (handleSocialAuthCallback.fulfilled.match(result)) {
      // Succès → Alert + Navigation auto via RootNavigator
      Alert.alert('Succès', 'Authentification Google réussie !')
    } else {
      // Erreur
      setError(result.payload?.message)
    }
  }
  
  processAuth()
}, [])
```

**UI :**
- Loading pendant traitement
- Message de succès ou erreur
- Bouton "Retour" si erreur

---

### 5. **Button Google Login**

**Fichier :** `src/pages/auth/Login/index.tsx`

```typescript
const handleGoogleLogin = async () => {
  const googleAuthUrl = `${API_CONFIG.BASE_URL}/auth/google`
  
  // Ouvrir le navigateur externe
  const supported = await Linking.canOpenURL(googleAuthUrl)
  
  if (supported) {
    await Linking.openURL(googleAuthUrl)
    
    Alert.alert(
      'Authentification Google',
      'Vous allez être redirigé vers Google...'
    )
  }
}
```

**Comportement :**
1. Ouvre le navigateur système
2. L'utilisateur se connecte à Google
3. Backend traite l'OAuth
4. Redirection vers `buyandsale://auth/social-callback?token=XXX`
5. App reprend le contrôle automatiquement

---

### 6. **Reducer updates**

**Fichier :** `src/store/authentification/slice.ts`

```typescript
.addCase(handleSocialAuthCallback.fulfilled, (state, action) => {
  state.auth.status = LoadingType.SUCCESS;
  
  // Même traitement que login classique
  const authUser: AuthUser = {
    ...responseData.user,
    token: responseData.token,
  };
  
  state.auth.entities = authUser;
  Utils.saveInLocalStorage(authUser); // AsyncStorage
})
```

---

## 🔧 Configuration Backend requise

**Backend URL de redirection :**
```typescript
// server/src/controllers/auth.controller.ts - googleCallback
res.redirect(
  `buyandsale://auth/social-callback?token=${encodeURIComponent(AccessToken)}`
);
```

**⚠️ IMPORTANT :** Le backend doit rediriger vers le scheme mobile `buyandsale://` au lieu du frontend web.

**Variables d'environnement backend :**
```env
MOBILE_APP_SCHEME=buyandsale
MOBILE_REDIRECT_URL=buyandsale://auth/social-callback
```

**Modification suggérée dans `googleCallback` :**
```typescript
export const googleCallback = async (req: Request, res: Response) => {
  // ... génération du token ...
  
  // Détecter si c'est une requête mobile
  const userAgent = req.get('User-Agent') || '';
  const isMobile = userAgent.includes('Mobile') || userAgent.includes('Expo');
  
  const redirectUrl = isMobile
    ? `${process.env.MOBILE_REDIRECT_URL}?token=${encodeURIComponent(AccessToken)}`
    : `${process.env.FRONTEND_URL}/auth/social-callback?token=${encodeURIComponent(AccessToken)}`;
  
  res.redirect(redirectUrl);
};
```

---

## 📱 Tests

### En développement :

1. **Expo Go :**
   ```bash
   expo start
   ```
   - Le deep link sera : `exp://192.168.1.X:19000/--/auth/social-callback?token=XXX`

2. **Standalone Build :**
   ```bash
   eas build --platform android --profile preview
   ```
   - Le deep link sera : `buyandsale://auth/social-callback?token=XXX`

### Test manuel :

1. Cliquer sur "Continuer avec Google"
2. Se connecter avec un compte Google
3. Vérifier que l'app se rouvre automatiquement
4. Vérifier que la page SocialCallback s'affiche
5. Vérifier la navigation vers Main après succès

### Test du deep link direct :

```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "buyandsale://auth/social-callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# iOS Simulator
xcrun simctl openurl booted "buyandsale://auth/social-callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ✅ Checklist d'implémentation

- [x] Configuration deep linking dans `app.json`
- [x] Import de `expo-linking` dans RootNavigator
- [x] Configuration `linking` dans NavigationContainer
- [x] Action Redux `handleSocialAuthCallback` créée
- [x] Reducer mis à jour pour gérer l'action
- [x] Page SocialCallback mise à jour
- [x] Fonction `handleGoogleLogin` dans Login
- [x] Type navigation `SocialCallback: { token?: string }`
- [ ] **Backend :** Modifier `googleCallback` pour rediriger vers mobile
- [ ] **Tests :** Tester sur device physique Android
- [ ] **Tests :** Tester sur device physique iOS
- [ ] **Production :** Configurer Google OAuth Console avec le bundle ID

---

## 🚀 Prochaines étapes

### Pour finaliser :

1. **Backend :**
   - Modifier `googleCallback` pour détecter les requêtes mobile
   - Rediriger vers `buyandsale://auth/social-callback?token=XXX`

2. **Google Console :**
   - Ajouter le bundle ID : `com.buyandsale.app`
   - Configurer les URI de redirection autorisées

3. **Tests :**
   - Build standalone Android/iOS
   - Tester le flow complet sur device physique

### Améliorations futures :

- 🔐 Ajouter Facebook Login
- 🔐 Ajouter Apple Sign In (obligatoire pour iOS)
- 🔄 Refresh token automatique en background
- 📊 Analytics pour tracker les conversions OAuth

---

## 🐛 Dépannage

### Le deep link ne fonctionne pas :

1. **Vérifier le scheme dans app.json :**
   ```json
   "scheme": "buyandsale"
   ```

2. **Rebuild l'app après modification :**
   ```bash
   expo prebuild --clean
   expo run:android
   ```

3. **Vérifier les logs :**
   ```bash
   expo start
   # Puis tester le deep link
   ```

### L'app ne se rouvre pas après Google Auth :

- **Cause :** Backend redirige toujours vers le frontend web
- **Solution :** Modifier `googleCallback` pour rediriger vers mobile

### Token non reçu dans SocialCallback :

- **Vérifier :** `route.params?.token` est défini
- **Vérifier :** Le type navigation inclut `{ token?: string }`
- **Vérifier :** Les logs du backend pour voir le token généré

---

## 📚 Ressources

- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/) (alternative)

---

**Status :** ✅ Implémenté et prêt pour tests
**Date :** 22 décembre 2024
**Version :** 1.0.0
