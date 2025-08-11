import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import OptimizedImage from './OptimizedImage';
import RecommendationEngine from '../services/RecommendationEngine';
import { StarRating } from './ReviewSystem';

interface RecommendationProps {
  userId: string;
  onMangaPress?: (mangaId: string) => void;
  onRefresh?: () => void;
  maxItems?: number;
}

interface RecommendationCardProps {
  mangaId: string;
  title: string;
  author: string;
  image: string;
  rating: number;
  score: number;
  reasons: string[];
  confidence: number;
  category: string;
  onPress?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  author,
  image,
  rating,
  score,
  reasons,
  confidence,
  category,
  onPress
}) => {
  const { colors } = useSimpleTheme();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trending': return 'trending-up';
      case 'similar': return 'layers';
      case 'genre_match': return 'heart';
      case 'author_match': return 'person';
      case 'collaborative': return 'people';
      default: return 'star';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trending': return '#FF6B35';
      case 'similar': return '#4ECDC4';
      case 'genre_match': return '#E74C3C';
      case 'author_match': return '#9B59B6';
      case 'collaborative': return '#3498DB';
      default: return colors.primary;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'trending': return 'Tendance';
      case 'similar': return 'Similaire';
      case 'genre_match': return 'Vos goûts';
      case 'author_match': return 'Auteur';
      case 'collaborative': return 'Communauté';
      default: return 'Recommandé';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.recommendationCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <OptimizedImage uri={image} style={styles.mangaImage} quality="medium" />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
            <Ionicons name={getCategoryIcon(category) as any} size={12} color="white" />
            <Text style={styles.categoryText}>{getCategoryLabel(category)}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: colors.primary }]}>
              {Math.round(score * 100)}%
            </Text>
          </View>
        </View>

        <Text style={[styles.mangaTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.mangaAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {author}
        </Text>

        <View style={styles.ratingContainer}>
          <StarRating rating={rating / 2} size={14} />
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {rating.toFixed(1)}
          </Text>
        </View>

        <View style={styles.reasonsContainer}>
          <Text style={[styles.reasonsTitle, { color: colors.textSecondary }]}>
            Pourquoi cette recommandation:
          </Text>
          {reasons.slice(0, 2).map((reason, index) => (
            <View key={index} style={styles.reasonItem}>
              <View style={[styles.reasonDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.reasonText, { color: colors.textSecondary }]} numberOfLines={1}>
                {reason}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.confidenceBar}>
          <View style={[styles.confidenceBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.confidenceBarFill,
                { 
                  backgroundColor: getCategoryColor(category),
                  width: `${confidence * 100}%`
                }
              ]}
            />
          </View>
          <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
            Confiance: {Math.round(confidence * 100)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SmartRecommendations: React.FC<RecommendationProps> = ({
  userId,
  onMangaPress,
  onRefresh,
  maxItems = 10
}) => {
  const { colors } = useSimpleTheme();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Données mockées pour la démo
  const mockMangas = new Map([
    ['1', { id: '1', title: 'Attack on Titan', author: 'Hajime Isayama', image: 'https://cdn.myanimelist.net/images/manga/2/37846.jpg', rating: 9.0 }],
    ['2', { id: '2', title: 'Death Note', author: 'Tsugumi Ohba', image: 'https://cdn.myanimelist.net/images/manga/1/258245.jpg', rating: 8.7 }],
    ['3', { id: '3', title: 'One Piece', author: 'Eiichiro Oda', image: 'https://cdn.myanimelist.net/images/manga/3/55539.jpg', rating: 9.2 }],
    ['4', { id: '4', title: 'Naruto', author: 'Masashi Kishimoto', image: 'https://cdn.myanimelist.net/images/manga/3/117681.jpg', rating: 8.1 }],
    ['5', { id: '5', title: 'Dragon Ball', author: 'Akira Toriyama', image: 'https://cdn.myanimelist.net/images/manga/1/2676.jpg', rating: 8.8 }],
  ]);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Simulation d'un appel API avec données mockées
      const mockRecommendations = [
        {
          mangaId: '1',
          score: 0.95,
          reasons: ['Genres que vous aimez: Action, Drama', 'Très populaire actuellement'],
          confidence: 0.9,
          category: 'genre_match'
        },
        {
          mangaId: '2',
          score: 0.87,
          reasons: ['Recommandé par des utilisateurs aux goûts similaires'],
          confidence: 0.75,
          category: 'collaborative'
        },
        {
          mangaId: '3',
          score: 0.82,
          reasons: ['Tendance du moment', 'Auteur que vous appréciez'],
          confidence: 0.8,
          category: 'trending'
        },
        {
          mangaId: '4',
          score: 0.78,
          reasons: ['Similaire à "Attack on Titan" que vous avez aimé'],
          confidence: 0.7,
          category: 'similar'
        },
        {
          mangaId: '5',
          score: 0.75,
          reasons: ['Nouvel ouvrage d\'Akira Toriyama'],
          confidence: 0.85,
          category: 'author_match'
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecommendations();
    onRefresh?.();
    setIsRefreshing(false);
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'Tout', icon: 'apps' },
    { key: 'trending', label: 'Tendances', icon: 'trending-up' },
    { key: 'genre_match', label: 'Vos goûts', icon: 'heart' },
    { key: 'collaborative', label: 'Communauté', icon: 'people' },
    { key: 'similar', label: 'Similaires', icon: 'layers' },
    { key: 'author_match', label: 'Auteurs', icon: 'person' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          🤖 Analyse de vos goûts en cours...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          🎯 Recommandations intelligentes
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.key ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={selectedCategory === category.key ? 'white' : colors.textSecondary}
            />
            <Text style={[
              styles.categoryChipText,
              {
                color: selectedCategory === category.key ? 'white' : colors.textSecondary
              }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.recommendationsList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredRecommendations.slice(0, maxItems).map((rec) => {
          const manga = mockMangas.get(rec.mangaId);
          if (!manga) return null;

          return (
            <RecommendationCard
              key={rec.mangaId}
              mangaId={rec.mangaId}
              title={manga.title}
              author={manga.author}
              image={manga.image}
              rating={manga.rating}
              score={rec.score}
              reasons={rec.reasons}
              confidence={rec.confidence}
              category={rec.category}
              onPress={() => onMangaPress?.(rec.mangaId)}
            />
          );
        })}

        {filteredRecommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucune recommandation pour cette catégorie
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 8,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  categoriesContainer: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mangaImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  mangaTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  mangaAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  reasonDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  reasonText: {
    fontSize: 12,
    flex: 1,
  },
  confidenceBar: {
    marginTop: 4,
  },
  confidenceBarBg: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceBarFill: {
    height: 4,
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SmartRecommendations;