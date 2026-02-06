import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B35',
  secondary: '#1E293B',
  accent: '#FFA726',
  light: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  gradient1: '#FF6B35',
  gradient2: '#FF8C5A',
  error: '#EF4444',
  success: '#10B981',
};

const styles = StyleSheet.create({
    // Logo image (première slide)
    logoImage: {
      width: width * 0.85,
      height: height * 0.32,
      alignSelf: 'center',
      resizeMode: 'contain',
    },
    // Titre d'accueil (première slide)
    welcomeTitle: {
      fontSize: 34,
      fontWeight: 'bold',
      color: COLORS.primary,
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: -0.5,
      lineHeight: 44,
      textShadowColor: COLORS.accent,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    // Description d'accueil (première slide)
    welcomeDescription: {
      fontSize: 20,
      color: COLORS.text,
      textAlign: 'center',
      lineHeight: 30,
      fontWeight: '500',
      marginBottom: 24,
      paddingHorizontal: 8,
      textShadowColor: COLORS.light,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    // Titre des autres slides
    slideTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: COLORS.primary,
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: -0.2,
      lineHeight: 32,
      textShadowColor: COLORS.gradient2,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    // Description des autres slides
    slideDescription: {
      fontSize: 16,
      color: COLORS.textLight,
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '400',
      marginBottom: 18,
      paddingHorizontal: 8,
    },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Slide styles
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 20,
    width,
  },

  slideContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },

  // Icon Circle with gradient effect
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },

  image: {
    width: width * 0.75,
    height: height * 0.28,
    marginBottom: 40,
    resizeMode: 'contain',
  },

  textContainer: {
    width: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 36,
  },

  description: {
    fontSize: 17,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 20,
    paddingHorizontal: 8,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Indicators
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },

  indicator: {
    height: 6,
    width: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
  },

  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 6,
  },

  // Button Container
  buttonContainer: {
    width: '100%',
  },

  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  skipButtonCustom: {
    flex: 0.4,
  },

  nextButtonCustom: {
    flex: 0.6,
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Progress badge
  progressBadge: {
    position: 'absolute',
    top: 54,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },

  progressText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default styles;
export { COLORS };
