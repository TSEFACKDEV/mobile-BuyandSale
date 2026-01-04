# 🎯 Guide Rapide - Configuration Google Cloud Console

## ⚡ Étapes Essentielles (5 minutes)

### 1️⃣ Accéder à Google Cloud Console
👉 https://console.cloud.google.com

### 2️⃣ Sélectionner votre projet
- Si vous avez déjà un projet pour le web, sélectionnez-le
- Sinon, créez un nouveau projet

### 3️⃣ Configurer OAuth Consent Screen (si pas déjà fait)
1. **APIs & Services** → **OAuth consent screen**
2. **User Type:** External
3. **App name:** BuyAndSale
4. **User support email:** Votre email
5. **Developer contact:** Votre email
6. **Scopes:** `email`, `profile`
7. **Test users:** Ajoutez vos emails de test
8. **Sauvegarder**

---

## 📱 Créer les Client IDs Mobile

### 🍎 iOS Client ID

1. **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Remplir:
   ```
   Application type: iOS
   Name: BuyAndSale Mobile iOS
   Bundle ID: com.buyandsale.app
   ```
4. **CREATE**
5. **COPIER** le Client ID (format: `XXXX-YYYY.apps.googleusercontent.com`)

### 🤖 Android Client ID

#### Étape A: Obtenir le SHA-1

**Pour Expo Go (Développement):**
```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Pour votre propre build:**
```bash
cd mobile-BuyandSale/android
./gradlew signingReport
# Ou sur Windows: gradlew signingReport

# Cherchez "SHA1:" dans la sortie
```

#### Étape B: Créer le Client ID

1. **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Remplir:
   ```
   Application type: Android
   Name: BuyAndSale Mobile Android
   Package name: com.buyandsale.app
   SHA-1 certificate fingerprint: [Le SHA-1 obtenu ci-dessus]
   ```
4. **CREATE**
5. **COPIER** le Client ID

---

## 🔐 Configurer Redirect URIs

### Pour Expo Go (Développement)

Pour **chaque** Client ID (iOS et Android):
1. Cliquer sur le Client ID
2. **Authorized redirect URIs** → **ADD URI**
3. Ajouter:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/buy_and_sale
   ```
   > Remplacer `YOUR_EXPO_USERNAME` par votre username Expo

4. **SAVE**

### Pour Standalone App (Production)

Ajouter aussi:
```
com.buyandsale.app:/oauthredirect
```

---

## 📝 Mettre à jour le fichier .env

1. Ouvrir `mobile-BuyandSale/.env`
2. Remplacer:
   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=VOTRE_IOS_CLIENT_ID.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=VOTRE_ANDROID_CLIENT_ID.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com
   ```

3. Le Web Client ID est celui déjà utilisé pour le backend web

---

## ✅ Checklist Rapide

- [ ] OAuth Consent Screen configuré
- [ ] iOS Client ID créé
- [ ] Android Client ID créé (avec SHA-1)
- [ ] Redirect URIs ajoutés pour les 2 Client IDs
- [ ] Fichier `.env` mis à jour
- [ ] Expo redémarré (`npx expo start`)

---

## 🧪 Tester

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Mobile
cd mobile-BuyandSale
npx expo start
```

1. Scanner le QR code avec Expo Go
2. Aller sur Login
3. Cliquer "Continuer avec Google"
4. ✅ Ça marche !

---

## ⚠️ Problèmes Fréquents

### "Redirect URI mismatch"
✅ Vérifier que l'URI dans Google Console est exactement:
```
https://auth.expo.io/@YOUR_USERNAME/buy_and_sale
```

### "Client ID non configuré"
✅ Redémarrer Expo après modification du `.env`:
```bash
# Arrêter Expo (Ctrl+C)
npx expo start --clear
```

### "Invalid OAuth client"
✅ Vérifier le Bundle ID / Package name:
- iOS: `com.buyandsale.app` (dans app.json)
- Android: `com.buyandsale.app` (dans app.json)

### SHA-1 Android ne marche pas
✅ Pour Expo Go, utiliser le SHA-1 officiel d'Expo:
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifier les logs console du mobile
2. Vérifier les logs du backend
3. Consulter [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) pour plus de détails

---

**Temps estimé:** 5-10 minutes  
**Difficulté:** Facile ⭐⭐☆☆☆
