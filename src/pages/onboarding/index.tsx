import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  StatusBar,
  SafeAreaView,
  Dimensions,
  FlatList,
  Image,
  Animated,
  ImageSourcePropType
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import styles, { COLORS } from './style';


const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
  backgroundColor?: string;
  icon?: string;
}

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: Slide[] = [
    {
      id: '1',
      image: require('../../../assets/onboarding/logo.png'),
      title: 'Bienvenue sur Buy and Sale',
      description: 'La première marketplace camerounaise pour acheter et vendre facilement',
      backgroundColor: '#FFF5E6',
      icon: 'shopping-bag'
    },
    {
      id: '2',
      image: require('../../../assets/onboarding/slide1.png'),
      title: 'Vendez vos produits',
      description: 'Mettez en ligne vos articles en quelques clics et trouvez des acheteurs',
      backgroundColor: '#E6F7FF',
      icon: 'upload'
    },
    {
      id: '3',
      image: require('../../../assets/onboarding/slide2.png'),
      title: 'Achetez en confiance',
      description: 'Découvrez une large sélection de produits de qualité vérifiée',
      backgroundColor: '#F0E6FF',
      icon: 'checkmark-circle'
    },
    {
      id: '4',
      image: require('../../../assets/onboarding/slide1.png'),
      title: 'Commencez maintenant',
      description: 'Rejoignez la communauté Buy and Sale et transformez votre commerce',
      backgroundColor: '#E6FFE6',
      icon: 'rocket'
    }
  ];

  const Slide = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slide, { width, backgroundColor: item.backgroundColor }]}>
        <View style={styles.slideContent}>
          {/* Icône de slide avec couleur primary */}
          <View style={styles.iconCircle}>
            <Icon 
              name={item.icon || 'star'} 
              size={52} 
              color={COLORS.white} 
            />
          </View>

          {/* Image */}
          <Image 
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Texte */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ 
        index: currentSlide + 1, 
        animated: true 
      });
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ 
      index: slides.length - 1, 
      animated: true 
    });
    setCurrentSlide(slides.length - 1);
  };

  const handleGetStarted = () => {
    console.log('Get Started pressed');
    // Navigation vers la page d'authentification
  };

  const Footer = () => {
    return (
      <View style={styles.footer}>
        {/* Indicateurs améliorés */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View 
                key={index} 
                style={[
                  styles.indicator,
                  { width: dotWidth },
                  currentSlide === index && styles.activeIndicator
                ]} 
              />
            );
          })}
        </View>

        {/* Boutons de navigation */}
        <View style={styles.buttonContainer}>
          {currentSlide === slides.length - 1 ? (
            <Button 
              title="Commencer"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              fullWidth
              rightIcon="arrow-forward"
            />
          ) : (
            <View style={styles.navigationButtons}>
              <Button 
                title="Passer"
                onPress={handleSkip}
                variant="outline"
                size="medium"
                style={styles.skipButtonCustom}
              />
              
              <Button 
                title="Suivant"
                onPress={handleNext}
                variant="primary"
                size="medium"
                rightIcon="chevron-forward"
                style={styles.nextButtonCustom}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent />
      
      {/* Bouton retour amélioré */}
      {currentSlide > 0 && (
        <Pressable 
          style={styles.backButton}
          onPress={() => {
            flatListRef.current?.scrollToIndex({ 
              index: currentSlide - 1, 
              animated: true 
            });
            setCurrentSlide(currentSlide - 1);
          }}
        >
          <Icon name="chevron-back" size={26} color={COLORS.primary} />
        </Pressable>
      )}

      {/* Badge de progression */}
      <View style={styles.progressBadge}>
        <Text style={styles.progressText}>{currentSlide + 1}/{slides.length}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      <Footer />
    </SafeAreaView>
  );
};

export default Onboarding;