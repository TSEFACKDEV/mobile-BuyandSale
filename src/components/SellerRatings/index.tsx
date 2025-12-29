import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import styles from './style';

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface SellerRatingsProps {
  statistics: ReviewStatistics;
  showDetails?: boolean;
}

const StarRatingDisplay: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  const colors = useThemeColors();
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Icon key={i} name="star" size={size} color="#FACC15" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Icon key={i} name="star-half" size={size} color="#FACC15" />
      );
    } else {
      stars.push(
        <Icon key={i} name="star-outline" size={size} color="#D1D5DB" />
      );
    }
  }

  return <View style={styles.starsRow}>{stars}</View>;
};

const SellerRatings: React.FC<SellerRatingsProps> = ({
  statistics,
  showDetails = false,
}) => {
  const colors = useThemeColors();
  const { totalReviews, averageRating, ratingDistribution } = statistics;

  // Handle new seller case
  const isNewSeller = totalReviews === 0;

  if (isNewSeller) {
    return (
      <View style={styles.container}>
        <StarRatingDisplay rating={0} size={14} />
        <Text style={[styles.newSellerText, { color: colors.textSecondary }]}>
          Nouveau vendeur
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Rating Display */}
      <View style={styles.mainRatingRow}>
        <View style={styles.ratingGroup}>
          <StarRatingDisplay rating={averageRating} size={14} />
          <Text style={[styles.averageText, { color: colors.text }]}>
            {averageRating.toFixed(1)}
          </Text>
        </View>

        <View style={styles.reviewsCount}>
          <Icon name="people-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.reviewsCountText, { color: colors.textSecondary }]}>
            {totalReviews} avis
          </Text>
        </View>
      </View>

      {/* Detailed Statistics */}
      {showDetails && totalReviews > 0 && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Icon name="trending-up-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.detailsHeaderText, { color: colors.textSecondary }]}>
              Répartition des notes
            </Text>
          </View>

          {/* Rating Distribution */}
          <View style={styles.distributionContainer}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <View key={star} style={styles.distributionRow}>
                  <View style={styles.starLabel}>
                    <Text style={[styles.starNumber, { color: colors.textSecondary }]}>
                      {star}
                    </Text>
                    <Icon name="star" size={10} color="#FACC15" />
                  </View>

                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${percentage}%` }
                      ]}
                    />
                  </View>

                  <Text style={[styles.countText, { color: colors.textSecondary }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default SellerRatings;
