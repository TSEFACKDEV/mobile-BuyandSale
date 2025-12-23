# Contact Store - Implementation

## Résumé
Le store **contact** permet à tout utilisateur (authentifié ou non) d'envoyer un message de contact à l'équipe BuyAndSale. Les messages sont sauvegardés en base de données et un email de notification est envoyé aux administrateurs.

## Routes Backend Implémentées

### Route Publique (Pas d'authentification requise)
```
POST /contact - Envoie un message de contact
```

## Actions Implémentées

### Public
1. **createContactAction** - Envoie un message de contact
   - Payload: `{ name: string, email: string, subject: string, message: string }`
   - Validation côté client (champs requis + format email)
   - Envoie un email de notification aux admins
   - Sauvegarde le message en base de données

## État du Store

```typescript
{
  status: LoadingType           // Statut de l'envoi
  error: string | null          // Message d'erreur
  success: boolean              // Indicateur de succès
  lastContact: ContactResponse | null  // Dernier message envoyé
}
```

## Types

### ContactForm
```typescript
{
  name: string        // Nom de l'expéditeur
  email: string       // Email de l'expéditeur
  subject: string     // Sujet du message
  message: string     // Contenu du message
}
```

### ContactResponse
```typescript
{
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string   // Date d'envoi
}
```

## Reducers Personnalisés

Le slice expose des actions pour gérer l'état :
- `resetContactState()` - Réinitialise complètement l'état (après succès)
- `clearContactError()` - Efface uniquement l'erreur

## Utilisation dans l'Application Mobile

### Formulaire de contact simple
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { createContactAction, resetContactState } from '../store/contact/actions';
import { RootState } from '../store';
import { useState, useEffect } from 'react';

const ContactScreen = () => {
  const dispatch = useDispatch();
  const { status, error, success } = useSelector(
    (state: RootState) => state.contact
  );
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const handleSubmit = () => {
    dispatch(createContactAction(form));
  };
  
  useEffect(() => {
    if (success) {
      Alert.alert(
        'Message envoyé',
        'Merci de nous avoir contactés. Nous vous répondrons bientôt.',
        [{
          text: 'OK',
          onPress: () => {
            dispatch(resetContactState());
            navigation.goBack();
          }
        }]
      );
    }
  }, [success]);
  
  return (
    <ScrollView>
      <TextInput
        placeholder="Votre nom"
        value={form.name}
        onChangeText={(name) => setForm({ ...form, name })}
      />
      <TextInput
        placeholder="Votre email"
        value={form.email}
        onChangeText={(email) => setForm({ ...form, email })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Sujet"
        value={form.subject}
        onChangeText={(subject) => setForm({ ...form, subject })}
      />
      <TextInput
        placeholder="Votre message"
        value={form.message}
        onChangeText={(message) => setForm({ ...form, message })}
        multiline
        numberOfLines={6}
      />
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      
      <Button
        title="Envoyer"
        onPress={handleSubmit}
        disabled={status === 'loading'}
      />
    </ScrollView>
  );
};
```

### Modal de contact
```typescript
import { Modal, View, TextInput, Button } from 'react-native';

const ContactModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { status, success } = useSelector((state: RootState) => state.contact);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  useEffect(() => {
    if (success) {
      dispatch(resetContactState());
      onClose();
    }
  }, [success]);
  
  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ padding: 20 }}>
        <Text>Nous Contacter</Text>
        
        {/* Formulaire ici */}
        
        <Button
          title="Envoyer"
          onPress={() => dispatch(createContactAction(form))}
          disabled={status === 'loading'}
        />
        <Button title="Annuler" onPress={onClose} />
      </View>
    </Modal>
  );
};
```

### Pré-remplir avec profil utilisateur
```typescript
const ContactScreenAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.authentification.auth);
  
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  
  // ... reste du composant
};
```

### Validation avant envoi
```typescript
const validateForm = () => {
  if (!form.name.trim()) {
    Alert.alert('Erreur', 'Le nom est requis');
    return false;
  }
  
  if (!form.email.trim()) {
    Alert.alert('Erreur', "L'email est requis");
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    Alert.alert('Erreur', 'Email invalide');
    return false;
  }
  
  if (!form.subject.trim()) {
    Alert.alert('Erreur', 'Le sujet est requis');
    return false;
  }
  
  if (!form.message.trim()) {
    Alert.alert('Erreur', 'Le message est requis');
    return false;
  }
  
  return true;
};

const handleSubmit = () => {
  if (validateForm()) {
    dispatch(createContactAction(form));
  }
};
```

## Backend - Traitement du Message

### Ce qui se passe côté serveur
1. ✅ Validation des champs requis
2. ✅ Sauvegarde en base de données (table `contact`)
3. ✅ Création d'un template HTML stylisé
4. ✅ Envoi d'email aux administrateurs avec:
   - Nom et email de l'expéditeur
   - Sujet du message
   - Contenu complet du message
   - Template HTML professionnel

### Table Contact (Prisma)
```prisma
model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String
  createdAt DateTime @default(now())
}
```

## Cas d'Usage

### 1. Support Client
```typescript
// Pré-remplir le sujet pour support
const handleSupportContact = () => {
  setForm({
    ...form,
    subject: 'Demande de support',
  });
};
```

### 2. Signaler un Bug
```typescript
const handleBugReport = (errorDetails: string) => {
  dispatch(createContactAction({
    name: user.name,
    email: user.email,
    subject: '🐛 Rapport de bug',
    message: `Bug rencontré:\n\n${errorDetails}`,
  }));
};
```

### 3. Suggestion de Fonctionnalité
```typescript
const handleFeatureRequest = () => {
  setForm({
    ...form,
    subject: '💡 Suggestion de fonctionnalité',
  });
};
```

### 4. Réclamation sur Transaction
```typescript
const handleReportTransaction = (productId: string) => {
  dispatch(createContactAction({
    name: user.name,
    email: user.email,
    subject: '⚠️ Réclamation Transaction',
    message: `Produit concerné: ${productId}\n\nDescription du problème:\n`,
  }));
};
```

## Routes Admin Non Implémentées

Les administrateurs consultent les messages de contact via l'interface web. Aucune route de consultation n'est exposée pour les utilisateurs mobiles.

**Routes Admin Web Uniquement:**
- GET /contact - Liste tous les messages (admin)
- GET /contact/:id - Détails d'un message (admin)
- DELETE /contact/:id - Supprimer un message (admin)
- PATCH /contact/:id/status - Marquer traité (admin)

## Notes Importantes

1. **Aucune Authentification** : Route publique, accessible à tous
2. **Validation** : Double validation (client + serveur)
3. **Email** : Notification automatique aux admins via SMTP
4. **Rate Limiting** : Recommandé d'ajouter pour éviter spam
5. **Réponse** : Les admins répondent directement par email
6. **Persistance** : Messages sauvegardés en BDD pour historique

## Différences avec Frontend React

### Similitudes
- ✅ Même structure de state
- ✅ Même action `createContactAction`
- ✅ Même validation des champs

### Spécificités Mobile
- ✅ Utilise `Alert.alert` au lieu de toast/modal
- ✅ Navigation après succès
- ✅ Peut pré-remplir avec profil AsyncStorage
- ✅ Keyboard handling spécifique mobile

## Cohérence avec le Backend

✅ Route publique correctement identifiée  
✅ Payload conforme au contrôleur  
✅ Gestion des erreurs basée sur réponses API  
✅ Validation email regex identique  

## Améliorations Futures

1. **Catégories de Contact**
   - Support technique
   - Question commerciale
   - Réclamation
   - Suggestion
   - Autre

2. **Pièces Jointes**
   - Upload images (screenshots)
   - Upload fichiers

3. **Historique**
   - Voir mes messages envoyés (si authentifié)
   - Statut de traitement

4. **Chat en Direct**
   - Intégration socket.io pour chat temps réel
   - Alternative au formulaire classique

5. **FAQ Intégrée**
   - Suggestions automatiques basées sur le sujet
   - Réduire les messages répétitifs

## Exemple Complet d'Intégration

```typescript
// ContactScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createContactAction, resetContactState } from '../store/contact/actions';
import type { RootState } from '../store';

const ContactScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { status, error, success } = useSelector(
    (state: RootState) => state.contact
  );
  const user = useSelector((state: RootState) => state.authentification.auth);

  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (success) {
      Alert.alert(
        'Message envoyé',
        'Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.',
        [{
          text: 'OK',
          onPress: () => {
            dispatch(resetContactState());
            navigation.goBack();
          }
        }]
      );
    }
  }, [success]);

  const handleSubmit = () => {
    dispatch(createContactAction(form));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Contactez-nous
        </Text>

        <TextInput
          placeholder="Votre nom"
          value={form.name}
          onChangeText={(name) => setForm({ ...form, name })}
          style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        />

        <TextInput
          placeholder="Votre email"
          value={form.email}
          onChangeText={(email) => setForm({ ...form, email })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        />

        <TextInput
          placeholder="Sujet"
          value={form.subject}
          onChangeText={(subject) => setForm({ ...form, subject })}
          style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        />

        <TextInput
          placeholder="Votre message"
          value={form.message}
          onChangeText={(message) => setForm({ ...form, message })}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{ borderWidth: 1, padding: 10, marginBottom: 15, height: 120 }}
        />

        {error && (
          <Text style={{ color: 'red', marginBottom: 15 }}>{error}</Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={status === 'loading'}
          style={{
            backgroundColor: status === 'loading' ? '#ccc' : '#007bff',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {status === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ContactScreen;
```
