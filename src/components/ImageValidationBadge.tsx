/**
 * 🖼️ Badge de validation d'image
 * Affiche un indicateur visuel du statut de validation d'une image
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageValidationBadgeProps {
  isValid: boolean;
  isValidating?: boolean;
  error?: string;
}

const ImageValidationBadge: React.FC<ImageValidationBadgeProps> = ({
  isValid,
  isValidating = false,
  error,
}) => {
  if (isValidating) {
    return (
      <View style={[styles.badge, styles.validating]}>
        <Ionicons name="hourglass-outline" size={12} color="#F59E0B" />
      </View>
    );
  }

  if (isValid) {
    return (
      <View style={[styles.badge, styles.valid]}>
        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.invalid]}>
      <Ionicons name="close-circle" size={12} color="#EF4444" />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valid: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  invalid: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  validating: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  errorText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ImageValidationBadge;
