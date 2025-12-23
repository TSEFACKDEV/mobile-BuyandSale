# 🏷️ FORFAIT STORE - DOCUMENTATION COMPLÈTE

**Mobile BuyandSale - React Native + Redux Toolkit**  
**Date:** 2025  
**Version:** 1.0.0

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Actions Redux](#actions-redux)
4. [State Management](#state-management)
5. [Types TypeScript](#types-typescript)
6. [Utilisation dans les composants](#utilisation-dans-les-composants)
7. [Backend Endpoints](#backend-endpoints)
8. [Flux de données](#flux-de-données)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Gestion complète des forfaits dans l'application mobile :
- ✅ Consulter les forfaits disponibles (URGENT, TOP_ANNONCE, PREMIUM)
- ✅ Voir les forfaits actifs sur un produit
- ✅ Vérifier l'éligibilité avant achat
- ✅ Acheter un forfait avec paiement mobile (CamPay)

### Portée
**Routes utilisateur uniquement** - Les routes admin (assign-without-payment, deactivate) ne sont pas implémentées dans le mobile app.

### Technologies
- **React Native** 0.81.5
- **Redux Toolkit** 2.11.2
- **TypeScript** 5.9.2
- **AsyncStorage** pour la persistance

---

## 🏗️ ARCHITECTURE

```
mobile-BuyandSale/src/store/forfait/
├── types.ts          # Interfaces TypeScript
├── actions.ts        # 4 actions Redux Toolkit
└── slice.ts          # Reducer + state initial
```

### Fichiers créés
1. **types.ts** - 13 interfaces TypeScript
2. **actions.ts** - 4 actions asynchrones
3. **slice.ts** - Reducer avec 3 actions synchrones

---

## ⚡ ACTIONS REDUX

### 1. getAllForfaitsAction (PUBLIC)
**Récupérer tous les forfaits disponibles à l'achat**

```typescript
// GET /forfait
const forfaits = await dispatch(getAllForfaitsAction()).unwrap();

// Réponse
[
  {
    id: "uuid",
    type: "URGENT",
    price: 500,
    duration: 7,
    description: "Mettez votre annonce en avant pendant 7 jours"
  },
  {
    id: "uuid",
    type: "TOP_ANNONCE",
    price: 1000,
    duration: 14,
    description: "Annonce en tête de liste pendant 14 jours"
  },
  {
    id: "uuid",
    type: "PREMIUM",
    price: 2000,
    duration: 30,
    description: "Visibilité maximale pendant 30 jours"
  }
]
```

**État Redux:**
- `forfaitsLoading`: boolean
- `forfaits`: Forfait[]
- `forfaitsError`: string | null

---

### 2. getProductForfaitsAction (PUBLIC)
**Récupérer les forfaits actifs d'un produit spécifique**

```typescript
// GET /forfait/product/:productId
const data = await dispatch(getProductForfaitsAction(productId)).unwrap();

// Réponse
{
  productId: "product-uuid",
  forfaits: [
    {
      id: "pf-uuid",
      productId: "product-uuid",
      forfaitId: "forfait-uuid",
      isActive: true,
      activatedAt: "2025-01-15T10:00:00Z",
      expiresAt: "2025-02-15T10:00:00Z",
      forfait: {
        id: "forfait-uuid",
        type: "PREMIUM",
        price: 2000,
        duration: 30,
        description: "..."
      }
    }
  ]
}
```

**État Redux:**
- `productForfaitsLoading`: boolean
- `productForfaits`: ProductForfait[]
- `productForfaitsError`: string | null

---

### 3. checkForfaitEligibilityAction (AUTH)
**Vérifier si un forfait peut être assigné avant paiement**

```typescript
// GET /forfait/check-eligibility?productId=xxx&forfaitType=xxx
const eligibility = await dispatch(
  checkForfaitEligibilityAction({ 
    productId: "product-uuid", 
    forfaitType: "PREMIUM" 
  })
).unwrap();

// Réponse si éligible
{
  canAssign: true
}

// Réponse si non éligible (conflit)
{
  canAssign: false,
  reason: "Un forfait PREMIUM est déjà actif sur ce produit",
  conflictingForfaits: [...]
}
```

**État Redux:**
- `eligibilityLoading`: boolean
- `eligibility`: CheckEligibilityResponse | null
- `eligibilityError`: string | null

**Règles backend:**
- Produit doit appartenir à l'utilisateur
- Vérification des conflits de forfaits actifs
- Validation du type de forfait

---

### 4. assignForfaitWithPaymentAction (AUTH)
**Initier le paiement pour l'achat d'un forfait**

```typescript
// POST /forfait/assign-with-payment
const paymentData = await dispatch(
  assignForfaitWithPaymentAction({
    productId: "product-uuid",
    forfaitType: "PREMIUM",
    phoneNumber: "237670000000"
  })
).unwrap();

// Réponse
{
  payment: {
    id: "payment-uuid",
    amount: 2000,
    status: "PENDING",
    campayReference: "REF-12345",
    metadata: { forfaitType: "PREMIUM", ... }
  },
  instructions: "Composez le code USSD: *126*... pour finaliser le paiement"
}
```

**État Redux:**
- `assignLoading`: boolean
- `paymentDetails`: AssignForfaitResponse | null
- `assignError`: string | null

**Processus backend:**
1. ✅ Vérification produit appartient à l'utilisateur
2. ✅ Validation type forfait (URGENT, TOP_ANNONCE, PREMIUM)
3. ✅ Vérification éligibilité (conflits)
4. ✅ Récupération forfait (prix, durée)
5. ✅ Initialisation paiement CamPay
6. ✅ Retour instructions USSD

---

## 📊 STATE MANAGEMENT

### État initial
```typescript
const initialState: ForfaitState = {
  // Liste des forfaits disponibles
  forfaits: [],
  forfaitsLoading: false,
  forfaitsError: null,

  // Forfaits actifs sur un produit
  productForfaits: [],
  productForfaitsLoading: false,
  productForfaitsError: null,

  // Éligibilité
  eligibility: null,
  eligibilityLoading: false,
  eligibilityError: null,

  // Assignation avec paiement
  paymentDetails: null,
  assignLoading: false,
  assignError: null,
};
```

### Actions synchrones

#### clearPaymentDetails()
```typescript
// Réinitialiser après traitement du paiement
dispatch(clearPaymentDetails());
```

#### clearEligibility()
```typescript
// Réinitialiser après vérification
dispatch(clearEligibility());
```

#### resetForfaitStore()
```typescript
// Réinitialisation complète (déconnexion)
dispatch(resetForfaitStore());
```

---

## 📘 TYPES TYPESCRIPT

### Enums & Types de base

```typescript
export type ForfaitType = 'URGENT' | 'TOP_ANNONCE' | 'PREMIUM';

export interface Forfait {
  id: string;
  type: ForfaitType;
  price: number;
  duration: number; // en jours
  description: string | null;
}

export interface ProductForfait {
  id: string;
  productId: string;
  forfaitId: string;
  isActive: boolean;
  activatedAt: Date;
  expiresAt: Date;
  forfait: Forfait;
}
```

### Request Types

```typescript
export interface CheckEligibilityRequest {
  productId: string;
  forfaitType: ForfaitType;
}

export interface AssignForfaitRequest {
  productId: string;
  forfaitType: ForfaitType;
  phoneNumber: string; // Format: 237XXXXXXXXX
}
```

### Response Types

```typescript
export interface GetAllForfaitsResponse {
  id: string;
  type: ForfaitType;
  price: number;
  duration: number;
  description: string | null;
}

export interface GetProductForfaitsResponse {
  productId: string;
  forfaits: ProductForfait[];
}

export interface CheckEligibilityResponse {
  canAssign: boolean;
  reason?: string;
  conflictingForfaits?: ProductForfait[];
}

export interface PaymentDetails {
  id: string;
  amount: number;
  status: string;
  campayReference: string;
  metadata: any;
}

export interface AssignForfaitResponse {
  payment: PaymentDetails;
  instructions: string;
}
```

---

## 💻 UTILISATION DANS LES COMPOSANTS

### Exemple 1: Liste des forfaits disponibles

```tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllForfaitsAction } from '../store/forfait/actions';
import { RootState, AppDispatch } from '../store';

const ForfaitListScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { forfaits, forfaitsLoading, forfaitsError } = useSelector(
    (state: RootState) => state.forfait
  );

  useEffect(() => {
    dispatch(getAllForfaitsAction());
  }, [dispatch]);

  if (forfaitsLoading) return <ActivityIndicator />;
  if (forfaitsError) return <Text>Erreur: {forfaitsError}</Text>;

  return (
    <FlatList
      data={forfaits}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.type}</Text>
          <Text>{item.price} FCFA - {item.duration} jours</Text>
          <Text>{item.description}</Text>
        </View>
      )}
    />
  );
};
```

### Exemple 2: Vérifier éligibilité + Acheter forfait

```tsx
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkForfaitEligibilityAction,
  assignForfaitWithPaymentAction,
} from '../store/forfait/actions';
import { clearPaymentDetails } from '../store/forfait/slice';

const BuyForfaitButton = ({ productId, forfaitType }) => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const { eligibility, paymentDetails, assignLoading } = useSelector(
    (state) => state.forfait
  );

  const handleBuy = async () => {
    // 1. Vérifier l'éligibilité
    const eligibilityResult = await dispatch(
      checkForfaitEligibilityAction({ productId, forfaitType })
    ).unwrap();

    if (!eligibilityResult.canAssign) {
      Alert.alert('Non éligible', eligibilityResult.reason);
      return;
    }

    // 2. Initier le paiement
    try {
      const payment = await dispatch(
        assignForfaitWithPaymentAction({
          productId,
          forfaitType,
          phoneNumber,
        })
      ).unwrap();

      Alert.alert('Paiement initié', payment.instructions);

      // 3. Nettoyer après traitement
      dispatch(clearPaymentDetails());
    } catch (error) {
      Alert.alert('Erreur', error);
    }
  };

  return (
    <View>
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Numéro de téléphone"
        keyboardType="phone-pad"
      />
      <Button
        title="Acheter forfait"
        onPress={handleBuy}
        disabled={assignLoading || !phoneNumber}
      />
    </View>
  );
};
```

### Exemple 3: Afficher badges forfait actif

```tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getProductForfaitsAction } from '../store/forfait/actions';

const ProductForfaitBadges = ({ productId }) => {
  const dispatch = useDispatch();
  const { productForfaits } = useSelector((state) => state.forfait);

  useEffect(() => {
    dispatch(getProductForfaitsAction(productId));
  }, [productId]);

  return (
    <View style={{ flexDirection: 'row' }}>
      {productForfaits.map((pf) => (
        <View key={pf.id} style={{ 
          backgroundColor: getBadgeColor(pf.forfait.type),
          padding: 5,
          borderRadius: 5,
          marginRight: 5
        }}>
          <Text>{pf.forfait.type}</Text>
        </View>
      ))}
    </View>
  );
};

const getBadgeColor = (type) => {
  switch (type) {
    case 'URGENT': return '#FF0000';
    case 'TOP_ANNONCE': return '#FFA500';
    case 'PREMIUM': return '#FFD700';
    default: return '#CCC';
  }
};
```

---

## 🌐 BACKEND ENDPOINTS

### Routes publiques
```
GET /forfait
GET /forfait/product/:productId
```

### Routes authentifiées
```
GET  /forfait/check-eligibility?productId=xxx&forfaitType=xxx
POST /forfait/assign-with-payment
```

### Routes admin (NON implémentées mobile)
```
POST /forfait/assign-without-payment  ❌ Admin uniquement
POST /forfait/deactivate              ❌ Admin uniquement
```

### Rate Limiting
- **Limite:** 30 requêtes/minute pour `assign-with-payment`
- **Message:** "Trop de tentatives d'assignation de forfait. Attendez quelques secondes."

---

## 🔄 FLUX DE DONNÉES

### Flux complet d'achat forfait

```
1. USER ACTION
   └─> Sélectionne produit + forfait
   
2. CHECK ELIGIBILITY
   └─> dispatch(checkForfaitEligibilityAction)
       ├─> GET /forfait/check-eligibility
       ├─> Backend vérifie conflits
       └─> Retour: { canAssign: true/false }
   
3. INITIATE PAYMENT (si éligible)
   └─> dispatch(assignForfaitWithPaymentAction)
       ├─> POST /forfait/assign-with-payment
       ├─> Backend:
       │   ├─> Vérifie produit + éligibilité
       │   ├─> Récupère forfait
       │   └─> Initialise paiement CamPay
       └─> Retour: { payment, instructions }
   
4. PAYMENT INSTRUCTIONS
   └─> Affiche code USSD à l'utilisateur
   
5. BACKEND WEBHOOK (après paiement)
   └─> CamPay notifie → Backend assigne forfait → Cache invalidé
   
6. CLEANUP
   └─> dispatch(clearPaymentDetails())
```

### Synchronisation backend-mobile
- ✅ **Forfaits disponibles:** Liste statique (rarement modifiée)
- ✅ **Forfaits actifs produit:** Rafraîchi à chaque affichage produit
- ✅ **Éligibilité:** Vérifiée en temps réel avant paiement
- ✅ **Paiement:** Initialisation synchrone, assignation asynchrone (webhook)

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [x] Types TypeScript (13 interfaces)
- [x] Actions Redux (4 actions asynchrones)
- [x] Slice Redux (3 actions synchrones)
- [x] Intégration dans store principal
- [x] Documentation complète
- [x] Compilation TypeScript (0 erreurs)

---

## 📝 NOTES IMPORTANTES

### ⚠️ Limitations mobile
- ❌ Pas d'assignation sans paiement (admin)
- ❌ Pas de désactivation de forfait (admin)
- ✅ Uniquement routes utilisateur normales

### 🔐 Authentification
- **Public:** getAllForfaits, getProductForfaits
- **Auth requise:** checkEligibility, assignWithPayment
- **Token:** Géré automatiquement par apiService

### 💳 Paiement
- **Provider:** CamPay (Mobile Money Cameroun)
- **Méthodes:** MTN, Orange Money
- **Flux:** Initialisation → Instructions USSD → Webhook → Assignation

### 🎨 UX Recommandations
1. Afficher badges forfait sur produits (URGENT, TOP, PREMIUM)
2. Modal de sélection forfait avec prix/durée
3. Vérification éligibilité avant affichage formulaire
4. Loading states pendant paiement
5. Alert avec instructions USSD claires
6. Confirmation après paiement réussi

---

## 🔗 LIENS CONNEXES

- [Backend Forfait Routes](../../server/src/routes/forfait.routes.ts)
- [Backend Forfait Controller](../../server/src/controllers/forfait.controller.ts)
- [Backend Forfait Service](../../server/src/services/forfait.service.ts)
- [Product Store](./PRODUCT_STORE.md) - Tri par forfait dans liste produits
- [Payment Service](../../server/src/services/payment.service.ts) - Intégration CamPay

---

**Store forfait implémenté avec succès! ✅**  
**4 actions • 3 reducers • 13 types • 0 erreurs TypeScript**
