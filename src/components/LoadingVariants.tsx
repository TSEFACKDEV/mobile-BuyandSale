import React from 'react';
import { View, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import { useThemeColors } from '../contexts/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const colors = useThemeColors();
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 3 }) => {
  const colors = useThemeColors();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.productCard, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}
        >
          <Skeleton width="100%" height={180} borderRadius={8} />
          <View style={styles.productInfo}>
            <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={20} />
          </View>
        </View>
      ))}
    </>
  );
};

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message, 
  size = 'large',
  fullScreen = false 
}) => {
  const colors = useThemeColors();

  const containerStyle = fullScreen 
    ? styles.loadingContainerFullScreen 
    : styles.loadingContainerCentered;

  return (
    <View style={[containerStyle, { backgroundColor: fullScreen ? colors.background : 'transparent' }]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <View style={styles.loadingTextContainer}>
          <Skeleton width={120} height={14} />
        </View>
      )}
    </View>
  );
};

interface ListSkeletonProps {
  itemCount?: number;
  horizontal?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  itemCount = 4,
  horizontal = false 
}) => {
  return (
    <View style={horizontal ? styles.horizontalList : styles.verticalList}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={horizontal ? styles.horizontalItem : styles.verticalItem}>
          <Skeleton width={horizontal ? 150 : '100%'} height={horizontal ? 120 : 80} borderRadius={8} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  productInfo: {
    padding: 12,
  },
  loadingContainerFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainerCentered: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTextContainer: {
    marginTop: 12,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  verticalList: {
    paddingHorizontal: 16,
  },
  horizontalItem: {
    marginRight: 12,
  },
  verticalItem: {
    marginBottom: 12,
  },
});
