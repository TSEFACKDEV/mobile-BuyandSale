# 💳 PAYMENT STORE - DOCUMENTATION COMPLÈTE

**Mobile BuyandSale - React Native + Redux Toolkit**  
**Date:** 23 décembre 2025  
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
8. [Relation avec Forfait Store](#relation-avec-forfait-store)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Gestion complémentaire des paiements dans l'application mobile :
- ✅ Vérifier le statut d'un paiement (polling après initiation)
- ✅ Consulter l'historique des paiements
- ⚠️ Initier un paiement (rarement utilisé directement)

### ⚠️ NOTE IMPORTANTE
**La plupart des paiements passent par le store forfait:**
- `assignForfaitWithPaymentAction` (forfait store) gère:
  1. Vérification éligibilité
  2. Initialisation paiement
  3. Instructions USSD
  
**Ce store payment est principalement pour:**
- ✅ **Polling statut** après paiement initié
- ✅ **Historique** des transactions
- ❌ **Pas pour initier** (sauf cas spécifique)

### Technologies
- **React Native** 0.81.5
- **Redux Toolkit** 2.11.2
- **TypeScript** 5.9.2
- **CamPay** API (Mobile Money)

---

## 🏗️ ARCHITECTURE

```
mobile-BuyandSale/src/store/payment/
├── types.ts          # Interfaces TypeScript
├── actions.ts        # 3 actions Redux Toolkit
└── slice.ts          # Reducer + state initial
```

### Fichiers créés
1. **types.ts** - 10 interfaces TypeScript
2. **actions.ts** - 3 actions asynchrones
3. **slice.ts** - Reducer avec 3 actions synchrones

---

## ⚡ ACTIONS REDUX

### 1. initiatePaymentAction (AUTH) ⚠️ RAREMENT UTILISÉ

**Initier un paiement de forfait directement**

```typescript
// POST /payments/initiate
const payment = await dispatch(
  initiatePaymentAction({
    productId: "product-uuid",
    forfaitId: "forfait-uuid",
    phoneNumber: "237670000000"
  })
).unwrap();

// Réponse
{
  paymentId: "payment-uuid",
  amount: 2000,
  status: "PENDING",
  campayReference: "REF-12345",
  ussdCode: "*126#1#2#...",
  instructions: "Composez le code USSD pour finaliser le paiement"
}
```

**État Redux:**
- `initiateLoading`: boolean
- `currentPayment`: InitiatePaymentResponse | null
- `initiateError`: string | null

**⚠️ PRÉFÉREZ UTILISER:**
```typescript
// Store forfait (gère éligibilité + paiement)
dispatch(assignForfaitWithPaymentAction({ productId, forfaitType, phoneNumber }))
```

---

### 2. checkPaymentStatusAction (AUTH) ✅ PRINCIPAL

**Vérifier le statut d'un paiement (PENDING → SUCCESS/FAILED)**

```typescript
// GET /payments/:paymentId/status
const status = await dispatch(
  checkPaymentStatusAction(paymentId)
).unwrap();

// Réponse
{
  paymentId: "payment-uuid",
  status: "SUCCESS", // ou PENDING, FAILED, CANCELLED
  amount: 2000,
  paidAt: "2025-12-23T10:00:00Z",
  forfaitActivated: true, // Forfait déjà activé sur produit?
  forfait: {
    id: "forfait-uuid",
    type: "PREMIUM",
    price: 2000,
    duration: 30
  },
  product: {
    id: "product-uuid",
    name: "iPhone 13 Pro Max"
  },
  _fallbackMode: false, // Mode dégradé si API CamPay down
  _lastCheck: "2025-12-23T10:05:00Z",
  _errorReason: null
}
```

**État Redux:**
- `statusLoading`: boolean
- `paymentStatus`: CheckPaymentStatusResponse | null
- `statusError`: string | null

**Usage typique: Polling**
```typescript
// Vérifier toutes les 3 secondes pendant 5 minutes max
const pollPaymentStatus = async (paymentId: string) => {
  const maxAttempts = 100; // 5 minutes
  const interval = 3000; // 3 secondes
  
  for (let i = 0; i < maxAttempts; i++) {
    const status = await dispatch(checkPaymentStatusAction(paymentId)).unwrap();
    
    if (status.status === 'SUCCESS') {
      Alert.alert('Paiement réussi!', 'Votre forfait a été activé');
      return status;
    }
    
    if (status.status === 'FAILED' || status.status === 'CANCELLED') {
      Alert.alert('Paiement échoué', 'Veuillez réessayer');
      return status;
    }
    
    // Toujours PENDING, continuer polling
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout: paiement non confirmé après 5 minutes');
};
```

**Rate Limiting:**
- **Limite:** 40 requêtes/minute (1 toutes les 1.5 secondes)
- **Message:** "Trop de vérifications de paiement. Attendez quelques secondes."

---

### 3. getUserPaymentsAction (AUTH) ✅ PRINCIPAL

**Récupérer l'historique des paiements de l'utilisateur**

```typescript
// GET /payments/history?page=1&limit=10
const history = await dispatch(
  getUserPaymentsAction({ page: 1, limit: 10 })
).unwrap();

// Réponse
{
  payments: [
    {
      id: "payment-uuid-1",
      amount: 2000,
      status: "SUCCESS",
      paidAt: "2025-12-23T10:00:00Z",
      createdAt: "2025-12-23T09:55:00Z",
      forfait: {
        type: "PREMIUM",
        duration: 30
      },
      product: {
        id: "product-uuid",
        name: "iPhone 13 Pro Max"
      }
    },
    {
      id: "payment-uuid-2",
      amount: 500,
      status: "FAILED",
      paidAt: null,
      createdAt: "2025-12-20T15:30:00Z",
      forfait: {
        type: "URGENT",
        duration: 7
      },
      product: {
        id: "product-uuid-2",
        name: "Samsung Galaxy S21"
      }
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 3,
    totalPayments: 25
  }
}
```

**État Redux:**
- `historyLoading`: boolean
- `history`: PaymentHistoryItem[]
- `historyPagination`: object | null
- `historyError`: string | null

---

## 📊 STATE MANAGEMENT

### État initial
```typescript
const initialState: PaymentState = {
  // Paiement en cours
  currentPayment: null,
  initiateLoading: false,
  initiateError: null,

  // Vérification statut
  paymentStatus: null,
  statusLoading: false,
  statusError: null,

  // Historique des paiements
  history: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
};
```

### Actions synchrones

#### clearCurrentPayment()
```typescript
// Réinitialiser après traitement du paiement
dispatch(clearCurrentPayment());
```

#### clearPaymentStatus()
```typescript
// Réinitialiser après vérification
dispatch(clearPaymentStatus());
```

#### resetPaymentStore()
```typescript
// Réinitialisation complète (déconnexion)
dispatch(resetPaymentStore());
```

---

## 📘 TYPES TYPESCRIPT

### Enums & Types de base

```typescript
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Payment {
  id: string;
  userId: string;
  productId: string;
  forfaitId: string;
  amount: number;
  status: PaymentStatus;
  campayReference: string;
  metadata: any;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  forfait?: object;
  product?: object;
}
```

### Request Types

```typescript
export interface InitiatePaymentRequest {
  productId: string;
  forfaitId: string;
  phoneNumber: string;
}
```

### Response Types

```typescript
export interface InitiatePaymentResponse {
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  campayReference: string;
  ussdCode?: string;
  instructions: string;
}

export interface CheckPaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  paidAt: Date | null;
  forfaitActivated: boolean;
  forfait: object;
  product: object;
  _fallbackMode?: boolean;
  _lastCheck?: Date;
  _errorReason?: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
  forfait: { type: string; duration: number };
  product: { id: string; name: string };
}

export interface GetUserPaymentsResponse {
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalPayments: number;
  };
}
```

---

## 💻 UTILISATION DANS LES COMPOSANTS

### Exemple 1: Vérifier statut paiement (Polling)

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { checkPaymentStatusAction } from '../store/payment/actions';
import { clearPaymentStatus } from '../store/payment/slice';

const PaymentVerificationScreen = ({ route }) => {
  const { paymentId } = route.params;
  const dispatch = useDispatch();
  const { paymentStatus, statusLoading } = useSelector((state) => state.payment);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const status = await dispatch(checkPaymentStatusAction(paymentId)).unwrap();
        
        if (status.status === 'SUCCESS') {
          setPolling(false);
          Alert.alert('✅ Paiement réussi!', 'Votre forfait a été activé');
          // Naviguer vers produit ou historique
        } else if (status.status === 'FAILED' || status.status === 'CANCELLED') {
          setPolling(false);
          Alert.alert('❌ Paiement échoué', 'Veuillez réessayer');
        }
      } catch (error) {
        console.error('Erreur vérification:', error);
      }
    };

    if (polling) {
      pollStatus(); // Première vérification immédiate
      pollInterval = setInterval(pollStatus, 3000); // Puis toutes les 3 secondes
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      dispatch(clearPaymentStatus());
    };
  }, [paymentId, polling, dispatch]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {polling ? (
        <>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={{ marginTop: 20 }}>Vérification du paiement...</Text>
          <Text style={{ marginTop: 10, color: '#666' }}>
            Veuillez composer le code USSD reçu
          </Text>
        </>
      ) : (
        <Text>
          {paymentStatus?.status === 'SUCCESS' ? '✅ Paiement confirmé!' : '❌ Échec'}
        </Text>
      )}
    </View>
  );
};
```

### Exemple 2: Historique des paiements

```tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPaymentsAction } from '../store/payment/actions';

const PaymentHistoryScreen = () => {
  const dispatch = useDispatch();
  const { history, historyPagination, historyLoading } = useSelector(
    (state) => state.payment
  );

  useEffect(() => {
    dispatch(getUserPaymentsAction({ page: 1, limit: 20 }));
  }, [dispatch]);

  if (historyLoading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', margin: 16 }}>
        Historique des paiements
      </Text>
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#E0E0E0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold' }}>{item.product.name}</Text>
              <Text style={{ color: getStatusColor(item.status) }}>
                {item.status}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={{ flex: 1 }}>Forfait {item.forfait.type}</Text>
              <Text style={{ fontWeight: 'bold' }}>{item.amount} FCFA</Text>
            </View>
            
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        )}
      />
      
      {historyPagination && (
        <Text style={{ textAlign: 'center', padding: 16, color: '#666' }}>
          Page {historyPagination.page} / {historyPagination.totalPages}
        </Text>
      )}
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS': return '#4CAF50';
    case 'PENDING': return '#FFA500';
    case 'FAILED': return '#F44336';
    case 'CANCELLED': return '#9E9E9E';
    default: return '#000';
  }
};
```

---

## 🌐 BACKEND ENDPOINTS

### Routes authentifiées
```
POST /payments/initiate              - Initier paiement (rarement utilisé)
GET  /payments/:paymentId/status     - Vérifier statut (polling)
GET  /payments/history?page=1&limit=10 - Historique
```

### Route publique (webhook)
```
POST /payments/webhook/campay        - Webhook CamPay (serveur uniquement)
```

### Rate Limiting
- **Status check:** 40 requêtes/minute (1 toutes les 1.5s)
- **Message:** "Trop de vérifications de paiement. Attendez quelques secondes."

---

## 🔗 RELATION AVEC FORFAIT STORE

### Flux complet d'achat forfait

```
1. USER: Sélectionne forfait
   └─> Page produit → Modal achat forfait

2. FORFAIT STORE: Vérifier éligibilité
   └─> dispatch(checkForfaitEligibilityAction({ productId, forfaitType }))
       └─> Si non éligible: Alert + stop
       └─> Si éligible: continuer

3. FORFAIT STORE: Initier paiement
   └─> dispatch(assignForfaitWithPaymentAction({ 
         productId, 
         forfaitType, 
         phoneNumber 
       }))
       └─> Retour: { paymentId, instructions }

4. PAYMENT STORE: Polling statut
   └─> Navigation vers PaymentVerificationScreen
       └─> useEffect polling avec checkPaymentStatusAction(paymentId)
           ├─> Toutes les 3 secondes
           ├─> Max 5 minutes
           └─> Si SUCCESS: Alert + navigation

5. BACKEND WEBHOOK: CamPay notifie
   └─> POST /payments/webhook/campay
       └─> Backend met à jour statut
       └─> Assigne forfait automatiquement

6. MOBILE: Reçoit SUCCESS lors du prochain poll
   └─> Affiche confirmation
   └─> Navigue vers produit avec badge forfait
```

### Répartition des responsabilités

| Fonctionnalité | Store | Action |
|----------------|-------|--------|
| **Vérifier éligibilité** | Forfait | checkForfaitEligibilityAction |
| **Initier paiement** | Forfait | assignForfaitWithPaymentAction ⭐ |
| **Vérifier statut (polling)** | Payment | checkPaymentStatusAction ⭐ |
| **Historique paiements** | Payment | getUserPaymentsAction ⭐ |
| **Initier paiement direct** | Payment | initiatePaymentAction (rarement) |

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [x] Types TypeScript (10 interfaces)
- [x] Actions Redux (3 actions asynchrones)
- [x] Slice Redux (3 actions synchrones)
- [x] Intégration dans store principal
- [x] Documentation complète
- [x] Compilation TypeScript (0 erreurs)

---

## 📝 NOTES IMPORTANTES

### ⚠️ Utilisation Correcte

**BON ✅:**
```typescript
// 1. Initier via forfait store
const payment = await dispatch(
  assignForfaitWithPaymentAction({ productId, forfaitType, phoneNumber })
).unwrap();

// 2. Vérifier via payment store
const status = await dispatch(
  checkPaymentStatusAction(payment.paymentId)
).unwrap();

// 3. Consulter historique via payment store
const history = await dispatch(
  getUserPaymentsAction({ page: 1 })
).unwrap();
```

**MAUVAIS ❌:**
```typescript
// N'utilisez PAS initiatePaymentAction directement
// Il manque la vérification d'éligibilité!
const payment = await dispatch(
  initiatePaymentAction({ productId, forfaitId, phoneNumber })
);
```

### 🔐 Sécurité
- **Auth requise:** Toutes les routes (sauf webhook)
- **Ownership:** Backend vérifie que le paiement appartient à userId
- **Rate limiting:** 40 vérifications/minute max

### 💡 Bonnes Pratiques

1. **Polling intelligent:**
   - Intervalle: 3 secondes (respecte rate limit)
   - Timeout: 5 minutes max
   - Stop si SUCCESS/FAILED/CANCELLED

2. **UX:**
   - Afficher instructions USSD clairement
   - Loading pendant polling
   - Gestion timeout (proposer réessayer)

3. **Cleanup:**
   - `clearPaymentStatus()` après vérification
   - `clearCurrentPayment()` après traitement

---

## 🔗 LIENS CONNEXES

- [Backend Payment Routes](../../server/src/routes/payment.routes.ts)
- [Backend Payment Controller](../../server/src/controllers/payment.controller.ts)
- [Backend Payment Service](../../server/src/services/payment.service.ts)
- [Forfait Store](./FORFAIT_STORE.md) - Complémentaire (initiation paiement)
- [CamPay API Documentation](https://campay.net/docs)

---

**Store payment implémenté avec succès! ✅**  
**3 actions • 3 reducers • 10 types • 0 erreurs TypeScript**  
**Complémentaire au store forfait pour vérification statut + historique**
