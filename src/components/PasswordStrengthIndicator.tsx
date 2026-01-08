import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Au moins 6 caractères',
      met: password.length >= 6,
    },
    {
      label: 'Une lettre minuscule (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Une lettre majuscule (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Un chiffre (0-9)',
      met: /\d/.test(password),
    },
  ];

  const metRequirementsCount = requirements.filter((req) => req.met).length;
  const allRequirementsMet = metRequirementsCount === requirements.length;

  // Déterminer la couleur de la barre de force
  const getStrengthColor = () => {
    if (metRequirementsCount === 0) return '#E5E7EB'; // Gray
    if (metRequirementsCount === 1) return '#EF4444'; // Red
    if (metRequirementsCount === 2) return '#F59E0B'; // Orange
    if (metRequirementsCount === 3) return '#FACC15'; // Yellow
    return '#10B981'; // Green
  };

  const getStrengthLabel = () => {
    if (metRequirementsCount === 0) return 'Très faible';
    if (metRequirementsCount === 1) return 'Faible';
    if (metRequirementsCount === 2) return 'Moyen';
    if (metRequirementsCount === 3) return 'Bon';
    return 'Excellent';
  };

  // Utiliser flex au lieu de pourcentage pour React Native
  const strengthFlex = metRequirementsCount / requirements.length;

  return (
    <View style={styles.container}>
      {/* Barre de force du mot de passe */}
      {password.length > 0 && (
        <View style={styles.strengthBarContainer}>
          <View style={styles.strengthBarBackground}>
            {metRequirementsCount > 0 && (
              <View
                style={[
                  styles.strengthBarFill,
                  {
                    flex: strengthFlex,
                    backgroundColor: getStrengthColor(),
                  },
                ]}
              />
            )}
            {metRequirementsCount < requirements.length && (
              <View style={{ flex: 1 - strengthFlex }} />
            )}
          </View>
          <Text style={[styles.strengthLabel, { color: getStrengthColor() }]}>
            {getStrengthLabel()}
          </Text>
        </View>
      )}

      {/* Liste des exigences */}
      <View style={styles.requirementsList}>
        <Text style={styles.requirementsTitle}>Votre mot de passe doit contenir :</Text>
        {requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <Icon
              name={requirement.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={requirement.met ? '#10B981' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.requirementText,
                requirement.met && styles.requirementTextMet,
              ]}
            >
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  strengthBarBackground: {
    flexDirection: 'row',
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  requirementsList: {
    gap: 6,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requirementTextMet: {
    color: '#10B981',
  },
});

export default PasswordStrengthIndicator;
