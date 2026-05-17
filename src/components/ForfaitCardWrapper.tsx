import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BORDER_WIDTH = 3;

export type ForfaitAnimationType = 'PREMIUM' | 'TOP_ANNONCE' | 'URGENT' | null;

interface Props {
  forfaitType: ForfaitAnimationType;
  borderRadius?: number;
  backgroundColor?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrapper animé pour les cartes produit selon leur forfait :
 * - URGENT      : bordure rouge clignotante (opacity 1→0→1, 1s/cycle)
 * - TOP_ANNONCE : arc bleu rotatif horaire, rapide (1.4s)
 * - PREMIUM     : double arc violet rotatif anti-horaire, lent (3s)
 * - null        : aucun effet, rendu transparent
 */
const ForfaitCardWrapper: React.FC<Props> = ({
  forfaitType,
  borderRadius = 12,
  backgroundColor = '#FFFFFF',
  children,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (forfaitType === 'TOP_ANNONCE') {
      // Arc unique rapide, sens horaire
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    } else if (forfaitType === 'PREMIUM') {
      // Double arc lent, sens anti-horaire
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    } else if (forfaitType === 'URGENT') {
      // Bordure rouge clignotante : visible → invisible → visible (1s, identique au web)
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    }

    animation?.start();
    return () => animation?.stop();
  }, [forfaitType]);

  // Pas de forfait : rendu minimal sans animation
  if (!forfaitType) {
    return (
      <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
        {children}
      </View>
    );
  }

  // URGENT : bordure rouge clignotante (opacity 1→0→1)
  // Reproduit le web : box-shadow pulse visible→transparent→visible (1s ease-in-out)
  if (forfaitType === 'URGENT') {
    const borderOpacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0], // démarre visible, disparaît à 50%, revient
    });

    return (
      <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
        {children}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              borderWidth: 2.5,
              borderColor: '#EF4444',
              opacity: borderOpacity,
            },
          ]}
        />
      </View>
    );
  }

  // TOP_ANNONCE / PREMIUM : gradient rotatif
  // Taille diagonale = assure que le carré gradient couvre tous les coins en rotation
  const diagonal =
    containerSize.width > 0
      ? Math.ceil(
          Math.sqrt(containerSize.width ** 2 + containerSize.height ** 2)
        )
      : 0;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    // PREMIUM tourne dans le sens inverse
    outputRange:
      forfaitType === 'PREMIUM' ? ['0deg', '-360deg'] : ['0deg', '360deg'],
  });

  // TOP_ANNONCE : comète bleue (arc unique ~28% du périmètre)
  // PREMIUM     : double arc violet symétrique à 180° (look couronne)
  const gradientColors: [string, string, ...string[]] =
    forfaitType === 'TOP_ANNONCE'
      ? [
          'transparent',
          'transparent',
          'transparent',
          '#1d4ed8',
          '#60a5fa',
          '#ffffff',
          '#3b82f6',
        ]
      : [
          '#7e22ce',
          '#c084fc',
          '#e9d5ff',
          'transparent',
          'transparent',
          '#7e22ce',
          '#c084fc',
          '#e9d5ff',
          'transparent',
        ];

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (
      width !== containerSize.width ||
      height !== containerSize.height
    ) {
      setContainerSize({ width, height });
    }
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        { borderRadius, overflow: 'hidden', padding: BORDER_WIDTH },
        style,
      ]}
    >
      {/* Gradient rotatif en fond */}
      {diagonal > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: diagonal,
            height: diagonal,
            top: (containerSize.height - diagonal) / 2,
            left: (containerSize.width - diagonal) / 2,
            transform: [{ rotate: spin }],
          }}
        >
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>
      )}

      {/* Surface intérieure de la carte (cache le centre du gradient) */}
      <View
        style={{
          borderRadius: Math.max(0, borderRadius - BORDER_WIDTH),
          overflow: 'hidden',
          backgroundColor,
          flex: 1,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default ForfaitCardWrapper;
