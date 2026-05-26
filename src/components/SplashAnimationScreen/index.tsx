import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ORANGE = '#EA580C';
const NAVY   = '#004E89';

const CHARS = [
  { char: 'B', color: ORANGE },
  { char: 'u', color: ORANGE },
  { char: 'y', color: ORANGE },
  { char: '&', color: NAVY   },
  { char: 'S', color: NAVY   },
  { char: 'a', color: NAVY   },
  { char: 'l', color: NAVY   },
  { char: 'e', color: NAVY   },
];

// Timings
const LETTERS_START  = 420;
const LETTER_STAGGER = 70;
const LINE_START     = LETTERS_START + (CHARS.length - 1) * LETTER_STAGGER + 220;
const TAGLINE_START  = LINE_START + 300;
const FADEOUT_START  = TAGLINE_START + 380 + 700;
// Total : ~2.6 secondes

const LINE_WIDTH = 100;

interface Props {
  onComplete: () => void;
}

const SplashAnimationScreen: React.FC<Props> = ({ onComplete }) => {
  // Icon box
  const iconScale   = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Letters
  const letterAnims = useRef(
    CHARS.map(() => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(20),
      scale:      new Animated.Value(0.6),
    }))
  ).current;

  // Accent line (glisse depuis la gauche)
  const lineTranslateX = useRef(new Animated.Value(-LINE_WIDTH)).current;
  const lineOpacity    = useRef(new Animated.Value(0)).current;

  // Tagline
  const taglineOpacity    = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(8)).current;

  // Fade out global + léger zoom arrière
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      // Icône — spring bounce
      Animated.spring(iconScale, {
        toValue: 1,
        damping: 12,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),

      // Lettres en cascade avec spring
      ...CHARS.map((_, i) =>
        Animated.sequence([
          Animated.delay(LETTERS_START + i * LETTER_STAGGER),
          Animated.parallel([
            Animated.timing(letterAnims[i].opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.spring(letterAnims[i].translateY, { toValue: 0, damping: 14, stiffness: 220, useNativeDriver: true }),
            Animated.spring(letterAnims[i].scale,      { toValue: 1, damping: 14, stiffness: 220, useNativeDriver: true }),
          ]),
        ])
      ),

      // Ligne accent : apparaît et glisse vers sa position
      Animated.sequence([
        Animated.delay(LINE_START),
        Animated.parallel([
          Animated.timing(lineOpacity,    { toValue: 1, duration: 80,  useNativeDriver: true }),
          Animated.timing(lineTranslateX, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]),
      ]),

      // Tagline
      Animated.sequence([
        Animated.delay(TAGLINE_START),
        Animated.parallel([
          Animated.timing(taglineOpacity,    { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(taglineTranslateY, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
      ]),

      // Fade out + léger zoom arrière
      Animated.sequence([
        Animated.delay(FADEOUT_START),
        Animated.parallel([
          Animated.timing(screenOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
          Animated.timing(screenScale,   { toValue: 0.96, duration: 320, useNativeDriver: true }),
        ]),
      ]),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: screenOpacity, transform: [{ scale: screenScale }] },
      ]}
    >
      {/* Icône dans un carré orange arrondi */}
      <Animated.View
        style={[
          styles.iconBox,
          { opacity: iconOpacity, transform: [{ scale: iconScale }] },
        ]}
      >
        <Icon name="cart" size={52} color="#FFFFFF" />
      </Animated.View>

      {/* Lettres du logo */}
      <View style={styles.lettersRow}>
        {CHARS.map((item, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.letter,
              { color: item.color },
              {
                opacity: letterAnims[i].opacity,
                transform: [
                  { translateY: letterAnims[i].translateY },
                  { scale:      letterAnims[i].scale },
                ],
              },
            ]}
          >
            {item.char}
          </Animated.Text>
        ))}
      </View>

      {/* Ligne accent — se dessine depuis la gauche */}
      <View style={styles.lineContainer}>
        <Animated.View
          style={[
            styles.accentLine,
            {
              opacity:   lineOpacity,
              transform: [{ translateX: lineTranslateX }],
            },
          ]}
        />
      </View>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity:   taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          },
        ]}
      >
        La marketplace camerounaise
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    // Ombre portée
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  lettersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  letter: {
    fontSize: 44,
    fontWeight: '700',
    includeFontPadding: false,
  },
  lineContainer: {
    width: LINE_WIDTH,
    height: 3,
    overflow: 'hidden',
    borderRadius: 2,
    marginBottom: 18,
  },
  accentLine: {
    width: LINE_WIDTH,
    height: 3,
    backgroundColor: ORANGE,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 12,
    color: '#9CA3AF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default SplashAnimationScreen;
