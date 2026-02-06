import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface CreateAdSuccessModalProps {
  visible: boolean;
  onViewForfaits: () => void;
  onSkip: () => void;
}

const CreateAdSuccessModal: React.FC<CreateAdSuccessModalProps> = ({
  visible,
  onViewForfaits,
  onSkip,
}) => {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Icône de succès */}
          <View style={styles.iconContainer}>
            <Icon name="checkmark-circle" size={72} color="#10b981" />
          </View>

          {/* Titre */}
          <Text style={[styles.title, { color: colors.text }]}>
            Annonce enregistrée !
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Votre annonce sera validée par nos administrateurs sous peu.
          </Text>

          {/* Section Boost */}
          <View style={styles.boostBox}>
            <Icon name="trending-up" size={32} color="#f97316" />
            <Text style={[styles.boostTitle, { color: colors.text }]}>
              Boostez votre visibilité
            </Text>
            <Text style={[styles.boostText, { color: colors.textSecondary }]}>
              Les annonces boostées obtiennent 10x plus de vues !
            </Text>
          </View>

          {/* Boutons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.skipBtn, { borderColor: colors.border }]}
              onPress={onSkip}
            >
              <Text style={[styles.skipText, { color: colors.text }]}>
                Plus tard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.boostBtn} onPress={onViewForfaits}>
              <Icon name="flash" size={18} color="#FFF" />
              <Text style={styles.boostBtnText}>Voir les forfaits</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  boostBox: {
    width: '100%',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  boostTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  boostText: {
    fontSize: 13,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  boostBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f97316',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  boostBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default CreateAdSuccessModal;
