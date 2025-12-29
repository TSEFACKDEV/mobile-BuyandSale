import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import {
  createReviewAction,
  updateReviewAction,
  getMyReviewsAction,
} from '../../store/review/actions';
import {
  selectReviewCreateStatus,
  selectReviewUpdateStatus,
  selectUserReviewForSeller,
  selectMyReviewsStatus,
  resetCreateStatus,
  resetUpdateStatus,
  LoadingType,
} from '../../store/review/slice';
import { useThemeColors } from '../../contexts/ThemeContext';
import styles from './style';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  onSuccess?: () => void;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
}> = ({ rating, onRatingChange }) => {
  const colors = useThemeColors();
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.starsContainer}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={styles.starButton}
        >
          <Icon
            name={star <= rating ? 'star' : 'star-outline'}
            size={40}
            color={star <= rating ? '#FACC15' : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();

  // Redux state
  const createStatus = useAppSelector(selectReviewCreateStatus);
  const updateStatus = useAppSelector(selectReviewUpdateStatus);
  const myReviewsStatus = useAppSelector(selectMyReviewsStatus);
  const existingReview = useAppSelector((state) =>
    selectUserReviewForSeller(state, sellerId)
  );

  // Local state
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if we're in update mode
  const isUpdating = !!existingReview;
  const isLoading =
    createStatus === LoadingType.LOADING ||
    updateStatus === LoadingType.LOADING ||
    myReviewsStatus === LoadingType.LOADING;

  // Load user's reviews when modal opens
  useEffect(() => {
    if (isOpen && !isInitialized) {
      dispatch(resetCreateStatus());
      dispatch(resetUpdateStatus());
      dispatch(getMyReviewsAction());
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, dispatch]);

  // Initialize rating with existing review
  useEffect(() => {
    if (
      isOpen &&
      (myReviewsStatus === LoadingType.SUCCEEDED ||
        myReviewsStatus === LoadingType.IDLE)
    ) {
      if (existingReview) {
        setRating(existingReview.rating);
      } else {
        setRating(0);
      }
      setError('');
    }
  }, [existingReview, myReviewsStatus, isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setError('');
      setIsInitialized(false);
    }
  }, [isOpen]);

  // Handle success
  useEffect(() => {
    if (
      isOpen &&
      (createStatus === LoadingType.SUCCEEDED ||
        updateStatus === LoadingType.SUCCEEDED)
    ) {
      onSuccess?.();
      onClose();
    }
  }, [createStatus, updateStatus, onSuccess, onClose, isOpen]);

  // Handle errors
  useEffect(() => {
    if (createStatus === LoadingType.FAILED) {
      setError('Erreur lors de l\'envoi de votre note. Veuillez réessayer.');
    }
    if (updateStatus === LoadingType.FAILED) {
      setError('Erreur lors de la modification de votre note. Veuillez réessayer.');
    }
  }, [createStatus, updateStatus]);

  const handleSubmit = async () => {
    if (!sellerId || rating === 0) {
      setError('Veuillez sélectionner une note.');
      return;
    }

    setError('');

    try {
      if (isUpdating && existingReview) {
        await dispatch(
          updateReviewAction({ id: existingReview.id, rating })
        ).unwrap();
      } else {
        await dispatch(createReviewAction({ sellerId, rating })).unwrap();
      }
    } catch (error) {
      setError(
        (error as Error)?.message ||
          'Une erreur est survenue lors de l\'envoi de votre note.'
      );
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Très décevant';
      case 2:
        return 'Décevant';
      case 3:
        return 'Correct';
      case 4:
        return 'Bien';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  // Loading state
  if (myReviewsStatus === LoadingType.LOADING) {
    return (
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F97316" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Chargement de vos notes...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon name="star" size={24} color="#F97316" />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {isUpdating ? 'Modifier votre note' : 'Noter le vendeur'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {isUpdating
                    ? `Modifiez votre évaluation de ${sellerName}`
                    : `Évaluez ${sellerName}`}
                </Text>
              </View>
            </View>

            {/* Rating Selection */}
            <View style={styles.ratingSection}>
              <Text style={[styles.ratingLabel, { color: colors.text }]}>
                {isUpdating ? 'Votre nouvelle note' : 'Votre note'}
              </Text>

              <StarRating rating={rating} onRatingChange={setRating} />

              <Text style={[styles.ratingHint, { color: colors.textSecondary }]}>
                Cliquez sur les étoiles pour noter
              </Text>

              {isUpdating && existingReview && (
                <Text style={[styles.previousRating, { color: colors.textSecondary }]}>
                  Note précédente : {existingReview.rating} étoile{existingReview.rating > 1 ? 's' : ''}
                </Text>
              )}

              {rating > 0 && (
                <View style={styles.ratingLabelContainer}>
                  <Text style={styles.ratingLabelText}>
                    {getRatingLabel(rating)}
                  </Text>
                </View>
              )}
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={onClose}
                disabled={isLoading}
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: colors.border },
                  isLoading && styles.buttonDisabled,
                ]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={rating === 0 || isLoading}
                style={[
                  styles.button,
                  styles.submitButton,
                  (rating === 0 || isLoading) && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isUpdating ? 'Modifier' : 'Noter'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RatingModal;
