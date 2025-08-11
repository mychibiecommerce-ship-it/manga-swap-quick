import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import OptimizedImage from './OptimizedImage';
import { StarRating, BadgeDisplay } from './ReviewSystem';

interface ExchangeHistory {
  id: string;
  mangaTitle: string;
  mangaImage: string;
  partnerName: string;
  partnerAvatar: string;
  date: Date;
  status: 'completed' | 'cancelled' | 'in_progress';
  rating?: number;
}

interface UserStats {
  totalExchanges: number;
  successfulExchanges: number;
  averageRating: number;
  totalReviews: number;
  responseTime: string; // "< 1h", "< 24h", etc.
  joinDate: Date;
  lastSeen: Date;
  preferredGenres: string[];
  collectionSize: number;
  wishlistSize: number;
}

interface DetailedProfileProps {
  userId: string;
  userName: string;
  userAvatar: string;
  userBio?: string;
  stats: UserStats;
  exchangeHistory: ExchangeHistory[];
  badges: any[];
  reviews: any[];
  isOwnProfile?: boolean;
  onSendMessage?: () => void;
  onStartExchange?: () => void;
}

const DetailedProfile: React.FC<DetailedProfileProps> = ({
  userName,
  userAvatar,
  userBio,
  stats,
  exchangeHistory,
  badges,
  reviews,
  isOwnProfile = false,
  onSendMessage,
  onStartExchange
}) => {
  const { colors } = useSimpleTheme();
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'reviews'>('stats');

  const getStatusColor = (status: ExchangeHistory['status']) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      case 'in_progress': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: ExchangeHistory['status']) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'in_progress': return 'En cours';
      default: return status;
    }
  };

  const formatResponseTime = (time: string) => {
    return `Répond généralement en ${time}`;
  };

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalExchanges}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Échanges</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.successfulExchanges}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Réussis</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.collectionSize}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collection</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.wishlistSize}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wishlist</Text>
        </View>
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Membre depuis {stats.joinDate.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {formatResponseTime(stats.responseTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="library" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Genres préférés: {stats.preferredGenres.join(', ')}
          </Text>
        </View>
      </View>

      <BadgeDisplay badges={badges} maxDisplay={6} />
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique des échanges</Text>
      {exchangeHistory.map((exchange) => (
        <View key={exchange.id} style={[styles.historyCard, { backgroundColor: colors.surface }]}>
          <OptimizedImage uri={exchange.mangaImage} style={styles.historyMangaImage} quality="low" />
          <View style={styles.historyInfo}>
            <Text style={[styles.historyMangaTitle, { color: colors.text }]}>{exchange.mangaTitle}</Text>
            <View style={styles.historyPartner}>
              <OptimizedImage uri={exchange.partnerAvatar} style={styles.historyPartnerAvatar} quality="low" />
              <Text style={[styles.historyPartnerName, { color: colors.textSecondary }]}>
                avec {exchange.partnerName}
              </Text>
            </View>
            <View style={styles.historyMeta}>
              <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                {exchange.date.toLocaleDateString()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exchange.status) }]}>
                <Text style={styles.statusText}>{getStatusText(exchange.status)}</Text>
              </View>
            </View>
            {exchange.rating && (
              <StarRating rating={exchange.rating} size={14} />
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.reviewsSummary}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Avis reçus</Text>
        <View style={styles.averageRating}>
          <Text style={[styles.averageNumber, { color: colors.primary }]}>
            {stats.averageRating.toFixed(1)}
          </Text>
          <StarRating rating={stats.averageRating} size={20} />
          <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
            ({stats.totalReviews} avis)
          </Text>
        </View>
      </View>
      
      {reviews.slice(0, 3).map((review: any) => (
        <View key={review.id} style={[styles.reviewPreview, { backgroundColor: colors.surface }]}>
          <View style={styles.reviewHeader}>
            <OptimizedImage uri={review.reviewerAvatar} style={styles.reviewerAvatar} quality="low" />
            <View style={styles.reviewerInfo}>
              <Text style={[styles.reviewerName, { color: colors.text }]}>{review.reviewerName}</Text>
              <StarRating rating={review.rating} size={14} />
            </View>
          </View>
          <Text style={[styles.reviewComment, { color: colors.textSecondary }]} numberOfLines={2}>
            {review.comment}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header du profil */}
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <OptimizedImage uri={userAvatar} style={styles.profileAvatar} quality="high" />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{userName}</Text>
          <View style={styles.profileRating}>
            <StarRating rating={stats.averageRating} size={18} />
            <Text style={[styles.profileRatingText, { color: colors.textSecondary }]}>
              ({stats.totalReviews} avis)
            </Text>
          </View>
          {userBio && (
            <Text style={[styles.profileBio, { color: colors.textSecondary }]}>{userBio}</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      {!isOwnProfile && (
        <View style={styles.profileActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={onSendMessage}
          >
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={onStartExchange}
          >
            <Ionicons name="swap-horizontal" size={20} color="white" />
            <Text style={styles.actionButtonText}>Échanger</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Onglets */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'stats' ? colors.primary : colors.textSecondary }]}>
            Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'history' ? colors.primary : colors.textSecondary }]}>
            Historique
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'reviews' ? colors.primary : colors.textSecondary }]}>
            Avis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des onglets */}
      {activeTab === 'stats' && renderStatsTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'reviews' && renderReviewsTab()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  profileRatingText: {
    fontSize: 14,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  profileActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  historyCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyMangaImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyMangaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyPartner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  historyPartnerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  historyPartnerName: {
    fontSize: 14,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewsSummary: {
    marginBottom: 20,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 14,
  },
  reviewPreview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default DetailedProfile;