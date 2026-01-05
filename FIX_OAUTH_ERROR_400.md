# 🔴 Résolution: Erreur 400 - invalid_request

## 🎯 Problème
```
Accès bloqué : erreur d'autorisation
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
Erreur 400 : invalid_request
```

## ✅ Solutions (5 minutes)

### 1️⃣ Vérifier OAuth Consent Screen

1. **Aller sur:** https://console.cloud.google.com/apis/credentials/consent
2. **Projet:** Sélectionner `buy-and-sale-469814`

#### Si l'écran est vide ou incomplet:

3. **User Type:** 
   - Sélectionner **"External"** (pas Internal)
   - Cliquer **"CREATE"**

4. **Remplir les informations obligatoires:**
   ```
   App name: BuyAndSale
   User support email: tsefackcalvinklein@gmail.com
   App logo: (optionnel)
   App domain: (laisser vide pour dev)
   Authorized domains: (laisser vide pour dev)
   Developer contact: tsefackcalvinklein@gmail.com
   ```
   - Cliquer **"SAVE AND CONTINUE"**

5. **Scopes:**
   - Cliquer **"ADD OR REMOVE SCOPES"**
   - Chercher et cocher:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
   - Cliquer **"UPDATE"**
   - Cliquer **"SAVE AND CONTINUE"**

6. **🔥 ÉTAPE CRITIQUE - Test users:**
   - Cliquer **"ADD USERS"**
   - Ajouter votre email: `tsefackcalvinklein@gmail.com`
   - Cliquer **"ADD"**
   - Cliquer **"SAVE AND CONTINUE"**

7. **Summary:**
   - Vérifier que tout est correct
   - Cliquer **"BACK TO DASHBOARD"**

---

### 2️⃣ Vérifier le statut de publication

1. Dans **OAuth consent screen**, vérifier:
   ```
   Publishing status: Testing
   ```
   
2. Si c'est "Testing" (mode test), c'est PARFAIT pour le développement
   - Seuls les utilisateurs ajoutés dans "Test users" peuvent se connecter

3. **Important:** Votre email `tsefackcalvinklein@gmail.com` DOIT être dans la liste "Test users"

---

### 3️⃣ Vérifier que les APIs sont activées

1. **Aller sur:** https://console.cloud.google.com/apis/library
2. Chercher et activer:
   - ✅ **Google+ API** (ou People API)
   - ✅ **Google Identity Toolkit API**

---

## 🧪 Retester

Après avoir fait les modifications ci-dessus:

1. **Attendre 5 minutes** (propagation des changements)

2. **Fermer complètement Expo Go** sur votre téléphone:
   - iOS: Swiper vers le haut et fermer l'app
   - Android: Fermer depuis le gestionnaire d'apps

3. **Redémarrer Expo:**
   ```bash
   npx expo start --clear
   ```

4. **Relancer l'app et retester**

---

## ⚠️ Si le problème persiste

### Vérifier les Client IDs

1. Aller sur: https://console.cloud.google.com/apis/credentials

2. Pour chaque Client ID (iOS et Android):
   - Cliquer dessus
   - Vérifier que **"Application type"** est bien:
     - iOS → Type: "iOS"
     - Android → Type: "Android"
   - Vérifier que le **Bundle ID / Package name** est: `com.buyandsale.app`

### Logs détaillés

Dans votre terminal mobile, chercher les erreurs détaillées:
```
❌ Error details:
- error_code
- error_description
```

Partagez ces logs pour un diagnostic plus précis.

---

## 📋 Checklist finale

- [ ] OAuth Consent Screen configuré (External)
- [ ] App name: "BuyAndSale" rempli
- [ ] User support email rempli
- [ ] Developer contact email rempli
- [ ] Scopes: email + profile ajoutés
- [ ] **Test user ajouté: tsefackcalvinklein@gmail.com** ⚠️ CRITIQUE
- [ ] Publishing status: "Testing"
- [ ] Attendu 5 minutes après les changements
- [ ] Expo redémarré avec --clear

---

## 💡 Note importante

Tant que votre app est en mode "Testing":
- ✅ Seuls les emails dans "Test users" peuvent se connecter
- ✅ Vous pouvez ajouter jusqu'à 100 testeurs
- ✅ Parfait pour le développement

Pour passer en production plus tard:
- Il faudra soumettre l'app pour vérification par Google
- Ou rester en mode "Testing" (limité à 100 utilisateurs)

---

**Cause principale:** Email non ajouté dans "Test users" de l'OAuth Consent Screen  
**Temps de résolution:** 5-10 minutes
