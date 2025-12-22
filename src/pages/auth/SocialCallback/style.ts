import { StyleSheet } from 'react-native'
import COLORS from '../../colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  /* ===== CARD ===== */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },

  /* ===== LOGO ===== */
  logoContainer: {
    marginBottom: 20,
  },

  /* ===== TEXT ===== */
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* ===== LOADING ===== */
  loadingContainer: {
    marginTop: 20,
  },

  /* ===== ERROR BOX ===== */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    marginLeft: 10,
    flex: 1,
  },

  /* ===== SUCCESS BOX ===== */
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    width: '100%',
  },
  successText: {
    fontSize: 13,
    color: '#065F46',
    marginLeft: 10,
    flex: 1,
  },

  /* ===== BUTTON ===== */
  backButton: {
    marginTop: 4,
    width: '100%',
  },
})

export default styles
