import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import OptimizedImage from './OptimizedImage';

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  exchangeId: string;
  mangaTitle: string;
  date: Date;
  verified: boolean;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
}

interface ReviewSystemProps {
  userId: string;
  reviews: Review[];
  onAddReview?: (review: Omit<Review, 'id' | 'date'>) => void;
  showAddReview?: boolean;
}

interface BadgeDisplayProps {
  badges: Badge[];
  maxDisplay?: number;
}

export const StarRating: React.FC<{
  rating: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}> = ({ rating, size = 16, onRatingChange, interactive = false }) => {
  const { colors } = useSimpleTheme();

  const renderStar = (index: number) => {
    const isFilled = index < rating;
    const isHalf = index < rating && index + 0.5 >= rating;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => interactive && onRatingChange?.(index + 1)}
        disabled={!interactive}
      >
        <Ionicons
          name={isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline'}
          size={size}
          color={isFilled || isHalf ? '#FFD700' : colors.textLight}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.starsContainer}>
      {[0, 1, 2, 3, 4].map(renderStar)}
    </View>
  );
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, maxDisplay = 3 }) => {
  const { colors } = useSimpleTheme();
  const [showAll, setShowAll] = useState(false);
  
  const displayedBadges = showAll ? badges : badges.slice(0, maxDisplay);
  const hasMore = badges.length > maxDisplay;

  const getBadgeColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  return (
    <View style={styles.badgesContainer}>
      <Text style={[styles.badgesTitle, { color: colors.text }]}>Badges</Text>
      <View style={styles.badgesList}>
        {displayedBadges.map((badge) => (
          <View key={badge.id} style={[styles.badge, { backgroundColor: getBadgeColor(badge.rarity) }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
          </View>
        ))}
        {hasMore && !showAll && (
          <TouchableOpacity
            style={[styles.moreBadges, { backgroundColor: colors.surface }]}
            onPress={() => setShowAll(true)}
          >
            <Text style={[styles.moreBadgesText, { color: colors.text }]}>+{badges.length - maxDisplay}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const { colors } = useSimpleTheme();

  return (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <OptimizedImage uri={review.reviewerAvatar} style={styles.reviewerAvatar} quality="low" />
        <View style={styles.reviewerInfo}>
          <Text style={[styles.reviewerName, { color: colors.text }]}>{review.reviewerName}</Text>
          <View style={styles.reviewMeta}>
            <StarRating rating={review.rating} size={14} />
            {review.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark" size={10} color="white" />
                <Text style={styles.verifiedText}>Vérifié</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
          {review.date.toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={[styles.mangaTitle, { color: colors.textSecondary }]}>
        Échange: {review.mangaTitle}
      </Text>
      
      <Text style={[styles.reviewComment, { color: colors.text }]}>
        {review.comment}
      </Text>
    </View>
  );
};

export const AddReviewModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: { rating: number; comment: string; mangaTitle: string }) => void;
  exchangeId: string;
  mangaTitle: string;
}> = ({ visible, onClose, onSubmit, mangaTitle }) => {
  const { colors } = useSimpleTheme();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim().length < 10) {
      return; // Validation basique
    }
    onSubmit({ rating, comment, mangaTitle });
    setRating(5);
    setComment('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Laisser un avis</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.exchangeInfo, { color: colors.textSecondary }]}>
            Échange: {mangaTitle}
          </Text>

          <View style={styles.ratingSection}>
            <Text style={[styles.ratingLabel, { color: colors.text }]}>Note</Text>
            <StarRating rating={rating} size={32} onRatingChange={setRating} interactive />
          </View>

          <View style={styles.commentSection}>
            <Text style={[styles.commentLabel, { color: colors.text }]}>Commentaire</Text>
            <TextInput
              style={[styles.commentInput, { color: colors.text, borderColor: colors.border }]}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              placeholder="Partagez votre expérience d'échange..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.surface }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Publier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ReviewSystem: React.FC<ReviewSystemProps> = ({ reviews, onAddReview, showAddReview = false }) => {
  const { colors } = useSimpleTheme();
  const [showAddModal, setShowAddModal] = useState(false);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Avis des swappeurs</Text>
        <View style={styles.averageRating}>
          <Text style={[styles.averageNumber, { color: colors.primary }]}>
            {averageRating.toFixed(1)}
          </Text>
          <StarRating rating={averageRating} size={20} />
          <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
            ({reviews.length} avis)
          </Text>
        </View>
      </View>

      {showAddReview && (
        <TouchableOpacity
          style={[styles.addReviewButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addReviewText}>Laisser un avis</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.reviewsList}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ScrollView>

      <AddReviewModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(reviewData) => {
          onAddReview?.({
            ...reviewData,
            reviewerId: 'current-user',
            reviewerName: 'Vous',
            reviewerAvatar: 'https://picsum.photos/50/50?random=user',
            exchangeId: 'temp-exchange',
            verified: true
          });
        }}
        exchangeId="temp"
        mangaTitle="Manga Example"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgesContainer: {
    marginVertical: 16,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  badgeName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  moreBadges: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBadgesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 14,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  addReviewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsList: {
    flex: 1,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  verifiedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
  },
  mangaTitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  exchangeInfo: {
    fontSize: 14,
    marginBottom: 20,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewSystem;