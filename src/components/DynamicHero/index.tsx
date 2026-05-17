import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { useTranslation } from '../../hooks/useTranslation';
import { getActiveHeroBannersAction } from '../../store/heroBanner/actions';
import { selectActiveBanners } from '../../store/heroBanner/slice';
import API_CONFIG from '../../config/api.config';
import type { HeroBanner, MediaPosition } from '../../types/heroBanner.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 250;

/** Sous-composant dédié à la lecture vidéo (useVideoPlayer ne peut pas être appelé conditionnellement) */
const VideoBanner: React.FC<{ uri: string; style: object }> = ({ uri, style }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      style={style}
      player={player}
      nativeControls={false}
      contentFit="cover"
    />
  );
};

const DynamicHero: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const banners = useAppSelector(selectActiveBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Charger les bannières actives au montage
  useEffect(() => {
    dispatch(getActiveHeroBannersAction())
      .unwrap()
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[DynamicHero] Erreur chargement bannières:', err);
      });
  }, [dispatch]);

  // Auto-rotation du carousel
  useEffect(() => {
    if (banners.length <= 1) return;

    const currentBanner = banners[currentIndex];
    const duration = (currentBanner?.duration || 5) * 1000;

    const timer = setInterval(() => {
      goToIndex((currentIndex + 1) % banners.length);
    }, duration);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, banners]);

  const goToIndex = (next: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(next);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const goToPrevious = () => {
    goToIndex((currentIndex - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    goToIndex((currentIndex + 1) % banners.length);
  };

  const handleBannerPress = (link: string | null) => {
    if (!link) return;
    if (link.startsWith('http')) {
      Linking.openURL(link).catch(() => {});
    } else {
      // Lien interne: tenter une navigation
      try {
        (navigation as any).navigate(link.replace(/^\//, ''));
      } catch {
        // no-op
      }
    }
  };

  // Pas de bannières → fallback identique à la version web
  if (banners.length === 0) {
    return (
      <View style={styles.section}>
        <LinearGradient
          colors={['#F97316', '#EA580C']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.darkOverlayLight} />
        <View style={styles.contentWrapper}>
          <Text style={styles.fallbackTitle}>{t('hero.title')}</Text>
          <Text style={styles.fallbackSubtitle} numberOfLines={2}>
            {t('hero.subtitle')}
          </Text>
        </View>
      </View>
    );
  }

  const currentBanner = banners[currentIndex];

  const positionStyle =
    positionMap[(currentBanner.position as MediaPosition) || 'CENTER'];

  const mediaUri = resolveMediaUri(currentBanner.mediaUrl);

  return (
    <View style={styles.section}>
      {/* Fond dégradé orange visible tant que l'image n'est pas chargée */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <View style={styles.mediaContainer}>
          {currentBanner.mediaType === 'IMAGE' ? (
            <Image
              source={{ uri: mediaUri }}
              style={styles.media}
              resizeMode="cover"
              onError={(e) => {
                // eslint-disable-next-line no-console
                console.warn('[DynamicHero] Échec chargement image:', mediaUri, e?.nativeEvent);
              }}
            />
          ) : (
            <VideoBanner key={mediaUri} uri={mediaUri} style={styles.media} />
          )}
        </View>
        {/* Overlay sombre pour améliorer la lisibilité */}
        <View style={styles.darkOverlay} />
      </Animated.View>

      <TouchableOpacity
        activeOpacity={currentBanner.link ? 0.85 : 1}
        onPress={() => handleBannerPress(currentBanner.link)}
        style={[styles.contentWrapper, positionStyle]}
      >
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          {!!currentBanner.title && (
            <Text style={styles.title} numberOfLines={1}>{currentBanner.title}</Text>
          )}
          {!!currentBanner.subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>{currentBanner.subtitle}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      {banners.length > 1 && (
        <>
          <TouchableOpacity
            onPress={goToPrevious}
            style={[styles.navButton, styles.navLeft]}
            accessibilityLabel="Bannière précédente"
          >
            <Icon name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNext}
            style={[styles.navButton, styles.navRight]}
            accessibilityLabel="Bannière suivante"
          >
            <Icon name="chevron-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.pagination}>
            {banners.map((_: HeroBanner, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToIndex(index)}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const positionMap: Record<MediaPosition, any> = {
  TOP: { justifyContent: 'flex-start', paddingTop: 16 },
  CENTER: { justifyContent: 'center' },
  BOTTOM: { justifyContent: 'flex-end', paddingBottom: 22 },
};

// Normalise l'URL du média :
// - chemin relatif → préfixe par l'origine de l'API
// - URL absolue avec localhost/127.0.0.1 → remplace par l'origine de l'API
const resolveMediaUri = (url: string): string => {
  if (!url) return url;
  try {
    const apiOrigin = new URL(API_CONFIG.BASE_URL).origin;
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${apiOrigin}${parsed.pathname}${parsed.search}`;
      }
      return url;
    }
    return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  } catch {
    return url;
  }
};

const styles = StyleSheet.create({
  section: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#F97316',
  },
  mediaContainer: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    right: 0,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  darkOverlayLight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fallbackTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  fallbackSubtitle: {
    fontSize: 15,
    color: '#FFEDD5',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navButton: {
    position: 'absolute',
    top: HERO_HEIGHT / 2 - 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navLeft: { left: 8 },
  navRight: { right: 8 },
  pagination: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});

export default DynamicHero;
