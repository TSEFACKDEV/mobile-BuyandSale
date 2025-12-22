import { StyleSheet } from 'react-native'
import COLORS from '../../colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    justifyContent: 'center',
  },

  /* ===== HEADER SECTION ===== */
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },

  /* ===== CARD CONTAINER ===== */
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  /* ===== REASON BOX ===== */
  reasonBox: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  reasonContent: {
    marginLeft: 12,
    flex: 1,
  },
  reasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },

  /* ===== CONTACT BOX ===== */
  contactBox: {
    backgroundColor: '#FFF7ED',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactItemContent: {
    marginLeft: 10,
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
    color: '#F97316',
  },

  /* ===== INSTRUCTIONS BOX ===== */
  instructionsBox: {
    backgroundColor: '#DBEAFE',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 10,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 18,
  },

  /* ===== BUTTONS ===== */
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  /* ===== FOOTER NOTE ===== */
  footerNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})

export default styles
