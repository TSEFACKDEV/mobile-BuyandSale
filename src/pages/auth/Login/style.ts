import { StyleSheet } from 'react-native'
import COLORS from '../../colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },

  /* ===== FORM SECTION ===== */
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  /* ===== OPTIONS SECTION ===== */
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 12,
  },

  /* ===== DIVIDER OR ===== */
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  /* ===== GOOGLE BUTTON ===== */
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
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
    marginVertical: 16,
  },

  /* ===== FOOTER SECTION ===== */
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  footerText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
})

export default styles