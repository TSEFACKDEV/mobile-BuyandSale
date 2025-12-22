import { StyleSheet } from 'react-native'
import COLORS from '../../colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },

  /* ===== HEADER SECTION ===== */
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    fontWeight: '500',
  },

  /* ===== FORM SECTION ===== */
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  /* ===== OPTIONS SECTION ===== */
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rememberMeText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  forgotPasswordLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* ===== BUTTON SECTION ===== */
  loginButton: {
    marginBottom: 16,
  },

  /* ===== REGISTER SECTION ===== */
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  registerText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },

  /* ===== DIVIDER ===== */
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },

  /* ===== FOOTER SECTION ===== */
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${COLORS.success}12`,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
})

export default styles