# 🎨 Système de Dialog Personnalisé

## 📦 Installation

Le système est déjà configuré dans `App.tsx` avec le `DialogProvider`.

## 🚀 Utilisation

### 1. Import du hook

```tsx
import { useDialog } from '../contexts/DialogContext';
```

### 2. Dans votre composant

```tsx
const MyComponent = () => {
  const { showDestructive, showConfirm, showSuccess, showWarning } = useDialog();
  
  // Votre code...
}
```

## 📋 Méthodes disponibles

### `showDestructive` - Action destructive (suppression, déconnexion, etc.)
```tsx
const handleDelete = async () => {
  await showDestructive(
    'Supprimer ce produit ?',
    'Cette action est irréversible',
    async () => {
      // Code à exécuter si l'utilisateur confirme
      await deleteProduct(productId);
    }
  );
};
```

### `showConfirm` - Confirmation normale
```tsx
const handleSave = async () => {
  await showConfirm(
    'Enregistrer les modifications ?',
    'Voulez-vous vraiment enregistrer ces changements ?',
    async () => {
      await saveData();
    }
  );
};
```

### `showSuccess` - Message de succès
```tsx
showSuccess(
  'Succès !',
  'Votre produit a été publié avec succès'
);
```

### `showWarning` - Avertissement
```tsx
showWarning(
  'Attention',
  'Cette action nécessite une connexion internet'
);
```

### `showDialog` - Dialog personnalisée
```tsx
await showDialog({
  title: 'Titre personnalisé',
  message: 'Message personnalisé',
  type: 'default', // 'default' | 'destructive' | 'success' | 'warning'
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  icon: 'custom-icon-name', // Optionnel (Ionicons)
  onConfirm: async () => {
    // Action à exécuter
  },
  onCancel: () => {
    // Action optionnelle à l'annulation
  }
});
```

## 🎨 Types de dialog

### Default (bleu)
```tsx
await showConfirm('Titre', 'Message');
```

### Destructive (rouge) - pour les actions dangereuses
```tsx
await showDestructive('Supprimer ?', 'Action irréversible');
```

### Success (vert) - pour les confirmations de succès
```tsx
showSuccess('Succès !', 'Opération réussie');
```

### Warning (orange) - pour les avertissements
```tsx
showWarning('Attention', 'Vérifiez vos données');
```

## 📱 Remplacer Alert.alert()

### Avant (Alert natif)
```tsx
Alert.alert(
  'Déconnexion',
  'Êtes-vous sûr ?',
  [
    { text: 'Annuler', style: 'cancel' },
    { 
      text: 'Déconnexion',
      style: 'destructive',
      onPress: async () => {
        await logout();
      }
    }
  ]
);
```

### Après (Dialog personnalisé)
```tsx
await showDestructive(
  'Déconnexion',
  'Êtes-vous sûr ?',
  async () => {
    await logout();
  }
);
```

## 🎯 Exemples concrets

### Exemple 1 : Suppression de produit
```tsx
const handleDeleteProduct = async (productId: string) => {
  await showDestructive(
    t('products.deleteTitle'),
    t('products.deleteMessage'),
    async () => {
      try {
        await dispatch(deleteProductAction(productId)).unwrap();
        showSuccess(t('products.deleteSuccess'), t('products.deleteSuccessMessage'));
      } catch (error) {
        showWarning(t('products.deleteError'), error.message);
      }
    }
  );
};
```

### Exemple 2 : Confirmation de publication
```tsx
const handlePublish = async () => {
  const confirmed = await showConfirm(
    t('products.publishTitle'),
    t('products.publishMessage')
  );
  
  if (confirmed) {
    await publishProduct();
  }
};
```

### Exemple 3 : Alerte d'information simple
```tsx
// Pour un simple message informatif (sans bouton annuler)
showSuccess(
  t('notifications.title'),
  t('notifications.newMessage')
);
```

## 🔧 Personnalisation

Le composant `ConfirmDialog.tsx` peut être personnalisé :
- Couleurs dans les styles
- Animations
- Icônes par défaut
- Tailles et espacements

## 📍 Où l'utiliser

✅ **Remplacer tous les `Alert.alert()` par ce système**

- Déconnexion
- Suppression de produits
- Confirmation d'actions importantes
- Messages de succès/erreur
- Avertissements

## ⚡ Avantages

1. **Design cohérent** - Même apparence partout dans l'app
2. **Personnalisable** - Contrôle total sur le style
3. **TypeScript** - Typage complet
4. **Simple** - API facile à utiliser
5. **Réutilisable** - Un seul composant pour toute l'app
6. **Async/Await** - Support des promesses pour un code plus propre
