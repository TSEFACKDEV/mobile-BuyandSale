# 📱 Configuration Google OAuth pour React Native - BuyAndSale

## 🎯 Vue d'ensemble

Ce guide explique comment configurer Google OAuth pour l'application mobile React Native en utilisant **Expo AuthSession** (Option A recommandée).

---

## 📋 Étape 1: Créer les Google OAuth Client IDs

### 1.1 Accéder à Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionner votre projet existant (celui utilisé pour le web)
3. Aller dans **APIs & Services** → **Credentials**

### 1.2 Créer un OAuth 2.0 Client ID pour iOS

1. Cliquer sur **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
2. **Application type:** iOS
3. **Name:** BuyAndSale Mobile iOS
4. **Bundle ID:** `com.buyandsale.app` (doit correspondre à celui dans `app.json`)
5. Cliquer sur **CREATE**
6. **Copier le Client ID** généré (format: `XXXX.apps.googleusercontent.com`)

### 1.3 Créer un OAuth 2.0 Client ID pour Android

1. Cliquer sur **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
2. **Application type:** Android
3. **Name:** BuyAndSale Mobile Android
4. **Package name:** `com.buyandsale.app` (doit correspondre à celui dans `app.json`)
5. **SHA-1 certificate fingerprint:** Obtenir via commande:

#### Pour développement (Debug)
```bash
# Sur Windows
cd android && gradlew signingReport

# Sur macOS/Linux
cd android && ./gradlew signingReport
```

Ou utiliser Expo:
```bash
# Expo permet de récupérer automatiquement le SHA-1
npx expo credentials:manager -p android
```

> **Note:** Pour Expo Go, utiliser le SHA-1 d'Expo:
> `SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

6. Cliquer sur **CREATE**
7. **Copier le Client ID** généré

---

## 📝 Étape 2: Configurer les variables d'environnement

Ouvrir le fichier `.env` du mobile et remplacer les valeurs:

```env
# 🔐 Configuration Google OAuth pour Mobile
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=VOTRE_CLIENT_ID_IOS.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=VOTRE_CLIENT_ID_ANDROID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=VOTRE_CLIENT_ID_WEB.apps.googleusercontent.com
```

**Important:**
- Les variables doivent commencer par `EXPO_PUBLIC_` pour être accessibles dans Expo
- Le **Web Client ID** est celui du backend (déjà existant)

---

## 🔧 Étape 3: Installer les dépendances

```bash
cd mobile-BuyandSale
npx expo install expo-auth-session expo-crypto expo-web-browser
```

---

## ⚙️ Étape 4: Configuration supplémentaire

### 4.1 Vérifier app.json

Le fichier `app.json` a déjà été mis à jour avec:
```json
{
  "expo": {
    "scheme": "buyandsale",
    "ios": {
      "bundleIdentifier": "com.buyandsale.app",
      "associatedDomains": ["applinks:auth.expo.io"]
    },
    "android": {
      "package": "com.buyandsale.app"
    }
  }
}
```

### 4.2 Configurer les Redirect URIs dans Google Console

Retourner dans **Google Cloud Console** → **APIs & Services** → **Credentials**

Pour chaque Client ID (iOS et Android), ajouter les Redirect URIs:

#### Pour Expo Go (Développement)
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/buy_and_sale
```

#### Pour Standalone App (Production)
```
com.buyandsale.app:/oauthredirect
```

---

## 🧪 Étape 5: Tester l'implémentation

### 5.1 Démarrer le serveur backend

```bash
cd server
npm run dev
```

### 5.2 Démarrer l'application mobile

```bash
cd mobile-BuyandSale
npx expo start
```

### 5.3 Test de connexion Google

1. Ouvrir l'app sur un device/émulateur
2. Aller sur la page de connexion
3. Cliquer sur **"Continuer avec Google"**
4. Sélectionner un compte Google
5. Autoriser l'application
6. Vérifier que la connexion réussit et que l'utilisateur est redirigé

---

## 🔍 Debugging

### Vérifier les logs

#### Mobile
```javascript
// Les logs apparaîtront dans le terminal Expo
console.log('🔐 [GoogleAuth] ...');
```

#### Backend
```javascript
// Les logs apparaîtront dans le terminal du serveur
console.log('📱 [GoogleMobileAuth] ...');
```

### Problèmes courants

#### 1. "Google Client ID non configuré"
- Vérifier que les variables dans `.env` sont correctement nommées (`EXPO_PUBLIC_...`)
- Redémarrer l'application Expo après modification du `.env`

#### 2. "Redirect URI mismatch"
- Vérifier que les URIs dans Google Console correspondent exactement
- Pour Expo Go: utiliser `https://auth.expo.io/@USERNAME/SLUG`
- Pour standalone: utiliser `PACKAGE_NAME:/oauthredirect`

#### 3. "Token Google non reçu"
- Vérifier que tous les Client IDs sont bien configurés
- Vérifier que le backend est accessible depuis le mobile
- Vérifier la connectivité réseau

#### 4. Erreur SHA-1 sur Android
- Générer le SHA-1 avec `gradlew signingReport`
- Ajouter le SHA-1 dans Google Console pour le Client ID Android
- Pour Expo Go, utiliser le SHA-1 d'Expo (voir ci-dessus)

---

## 📊 Architecture du flux

```
┌─────────────┐
│   Mobile    │
│  (React     │
│   Native)   │
└──────┬──────┘
       │
       │ 1. Clic "Continuer avec Google"
       │    (useAuthRequest hook)
       │
       ▼
┌─────────────┐
│  Expo       │
│  Auth       │
│  Session    │
└──────┬──────┘
       │
       │ 2. Ouvre le navigateur système
       │    (Safari/Chrome)
       │
       ▼
┌─────────────┐
│   Google    │
│   OAuth     │
│   Screen    │
└──────┬──────┘
       │
       │ 3. Utilisateur autorise
       │
       ▼
┌─────────────┐
│   Mobile    │
│   Reçoit    │
│   Token     │
└──────┬──────┘
       │
       │ 4. Envoie à backend
       │    POST /auth/google/mobile
       │
       ▼
┌─────────────┐
│   Backend   │
│   Vérifie   │
│   & Crée    │
│   User      │
└──────┬──────┘
       │
       │ 5. Retourne JWT
       │
       ▼
┌─────────────┐
│   Mobile    │
│   Sauve     │
│   dans      │
│   Redux     │
└─────────────┘
```

---

## ✅ Checklist finale

- [ ] Client ID iOS créé dans Google Console
- [ ] Client ID Android créé dans Google Console
- [ ] SHA-1 Android configuré dans Google Console
- [ ] Variables d'environnement `.env` configurées
- [ ] Redirect URIs ajoutés dans Google Console
- [ ] Dépendances Expo installées
- [ ] Backend démarré et accessible
- [ ] Test de connexion réussi sur iOS
- [ ] Test de connexion réussi sur Android

---

## 🚀 Déploiement en production

### iOS (App Store)

1. **Build avec Expo EAS:**
```bash
eas build --platform ios
```

2. **Créer un nouveau OAuth Client ID** pour production:
   - Type: iOS
   - Bundle ID: `com.buyandsale.app`
   - Ajouter dans Google Console

3. **Mettre à jour `.env.production`:**
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=PROD_IOS_CLIENT_ID.apps.googleusercontent.com
```

### Android (Google Play)

1. **Générer le keystore de production:**
```bash
eas build --platform android
```

2. **Obtenir le SHA-1 de production:**
```bash
keytool -list -v -keystore path/to/production.keystore
```

3. **Créer un nouveau OAuth Client ID** avec le SHA-1 de production

4. **Mettre à jour `.env.production`:**
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=PROD_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

---

## 📚 Ressources

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth2 for Mobile](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Expo Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)

---

**Date:** Janvier 2026  
**Version:** 1.0  
**Auteur:** GitHub Copilot
