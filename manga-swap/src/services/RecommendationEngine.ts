interface UserProfile {
  id: string;
  preferences: {
    genres: string[];
    authors: string[];
    demographics: string[]; // shounen, seinen, josei, shoujo
    themes: string[]; // action, romance, comedy, etc.
  };
  readingHistory: {
    mangaId: string;
    rating: number;
    completed: boolean;
    dateRead: Date;
  }[];
  exchangeHistory: {
    mangaId: string;
    partnerId: string;
    rating: number;
    successful: boolean;
  }[];
  behaviorData: {
    searchQueries: string[];
    viewedMangas: string[];
    timeSpentOnGenres: { [genre: string]: number };
    averageSessionTime: number;
  };
}

interface Manga {
  id: string;
  title: string;
  author: string;
  genres: string[];
  demographic: string;
  themes: string[];
  rating: number;
  popularity: number;
  year: number;
  description: string;
  similarMangas: string[];
  tags: string[];
}

interface RecommendationScore {
  mangaId: string;
  score: number;
  reasons: string[];
  confidence: number;
  category: 'trending' | 'similar' | 'genre_match' | 'author_match' | 'collaborative';
}

class RecommendationEngine {
  private static instance: RecommendationEngine;
  private userProfiles: Map<string, UserProfile> = new Map();
  private mangaDatabase: Map<string, Manga> = new Map();
  private collaborativeData: Map<string, Set<string>> = new Map(); // userId -> mangaIds liked

  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  // Obtenir des recommandations personnalisées pour un utilisateur
  async getRecommendations(userId: string, limit: number = 10): Promise<RecommendationScore[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return this.getTrendingRecommendations(limit);
    }

    const recommendations: RecommendationScore[] = [];

    // 1. Recommandations basées sur les genres préférés (30%)
    const genreRecs = await this.getGenreBasedRecommendations(userProfile, Math.ceil(limit * 0.3));
    recommendations.push(...genreRecs);

    // 2. Recommandations collaboratives (25%)
    const collaborativeRecs = await this.getCollaborativeRecommendations(userId, Math.ceil(limit * 0.25));
    recommendations.push(...collaborativeRecs);

    // 3. Recommandations basées sur les auteurs (20%)
    const authorRecs = await this.getAuthorBasedRecommendations(userProfile, Math.ceil(limit * 0.2));
    recommendations.push(...authorRecs);

    // 4. Recommandations similaires aux mangas aimés (15%)
    const similarRecs = await this.getSimilarMangaRecommendations(userProfile, Math.ceil(limit * 0.15));
    recommendations.push(...similarRecs);

    // 5. Tendances et découvertes (10%)
    const trendingRecs = await this.getTrendingRecommendations(Math.ceil(limit * 0.1));
    recommendations.push(...trendingRecs);

    // Éliminer les doublons et trier par score
    const uniqueRecs = this.removeDuplicatesAndRank(recommendations);
    
    return uniqueRecs.slice(0, limit);
  }

  // Recommandations basées sur les genres préférés
  private async getGenreBasedRecommendations(profile: UserProfile, limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    const preferredGenres = profile.preferences.genres;
    
    for (const [mangaId, manga] of this.mangaDatabase) {
      if (this.hasUserRead(profile, mangaId)) continue;

      const genreMatches = manga.genres.filter(genre => preferredGenres.includes(genre));
      if (genreMatches.length > 0) {
        const score = this.calculateGenreScore(manga, preferredGenres, profile);
        recommendations.push({
          mangaId,
          score,
          reasons: [`Genres que vous aimez: ${genreMatches.join(', ')}`],
          confidence: Math.min(genreMatches.length / preferredGenres.length, 1),
          category: 'genre_match'
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Recommandations collaboratives (utilisateurs avec goûts similaires)
  private async getCollaborativeRecommendations(userId: string, limit: number): Promise<RecommendationScore[]> {
    const userLikes = this.collaborativeData.get(userId) || new Set();
    const recommendations: RecommendationScore[] = [];
    const similarUsers = new Map<string, number>();

    // Trouver des utilisateurs avec des goûts similaires
    for (const [otherUserId, otherLikes] of this.collaborativeData) {
      if (otherUserId === userId) continue;

      const commonLikes = Array.from(userLikes).filter(mangaId => otherLikes.has(mangaId));
      const similarity = commonLikes.length / Math.sqrt(userLikes.size * otherLikes.size);
      
      if (similarity > 0.1) { // Seuil de similarité
        similarUsers.set(otherUserId, similarity);
      }
    }

    // Recommander des mangas aimés par des utilisateurs similaires
    for (const [similarUserId, similarity] of similarUsers) {
      const otherLikes = this.collaborativeData.get(similarUserId)!;
      
      for (const mangaId of otherLikes) {
        if (!userLikes.has(mangaId)) {
          const manga = this.mangaDatabase.get(mangaId);
          if (manga) {
            const score = similarity * manga.rating * 0.1;
            recommendations.push({
              mangaId,
              score,
              reasons: ['Recommandé par des utilisateurs aux goûts similaires'],
              confidence: similarity,
              category: 'collaborative'
            });
          }
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Recommandations basées sur les auteurs préférés
  private async getAuthorBasedRecommendations(profile: UserProfile, limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    const preferredAuthors = profile.preferences.authors;
    const readAuthors = profile.readingHistory
      .filter(h => h.rating >= 4)
      .map(h => this.mangaDatabase.get(h.mangaId)?.author)
      .filter(Boolean) as string[];

    const allPreferredAuthors = [...new Set([...preferredAuthors, ...readAuthors])];

    for (const [mangaId, manga] of this.mangaDatabase) {
      if (this.hasUserRead(profile, mangaId)) continue;

      if (allPreferredAuthors.includes(manga.author)) {
        const score = manga.rating * 0.8;
        recommendations.push({
          mangaId,
          score,
          reasons: [`Nouvel ouvrage de ${manga.author}`],
          confidence: 0.8,
          category: 'author_match'
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Recommandations basées sur des mangas similaires
  private async getSimilarMangaRecommendations(profile: UserProfile, limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    const likedMangas = profile.readingHistory
      .filter(h => h.rating >= 4)
      .map(h => h.mangaId);

    for (const likedMangaId of likedMangas) {
      const likedManga = this.mangaDatabase.get(likedMangaId);
      if (!likedManga) continue;

      for (const similarMangaId of likedManga.similarMangas) {
        if (!this.hasUserRead(profile, similarMangaId)) {
          const similarManga = this.mangaDatabase.get(similarMangaId);
          if (similarManga) {
            const score = similarManga.rating * 0.7;
            recommendations.push({
              mangaId: similarMangaId,
              score,
              reasons: [`Similaire à "${likedManga.title}" que vous avez aimé`],
              confidence: 0.7,
              category: 'similar'
            });
          }
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Recommandations trending
  private async getTrendingRecommendations(limit: number): Promise<RecommendationScore[]> {
    const trendingMangas = Array.from(this.mangaDatabase.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return trendingMangas.map(manga => ({
      mangaId: manga.id,
      score: manga.popularity * 0.01,
      reasons: ['Tendance du moment'],
      confidence: 0.5,
      category: 'trending' as const
    }));
  }

  // Matching intelligent pour les échanges
  async findExchangeMatches(userId: string, userMangaId: string): Promise<{
    userId: string;
    mangaId: string;
    score: number;
    reasons: string[];
  }[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return [];

    const userManga = this.mangaDatabase.get(userMangaId);
    if (!userManga) return [];

    const matches: any[] = [];

    // Parcourir tous les autres utilisateurs
    for (const [otherUserId, otherProfile] of this.userProfiles) {
      if (otherUserId === userId) continue;

      // Vérifier si l'autre utilisateur a des mangas que l'utilisateur actuel pourrait vouloir
      for (const exchange of otherProfile.exchangeHistory) {
        const otherManga = this.mangaDatabase.get(exchange.mangaId);
        if (!otherManga) continue;

        const score = this.calculateExchangeMatchScore(userProfile, userManga, otherProfile, otherManga);
        if (score > 0.3) { // Seuil de match
          matches.push({
            userId: otherUserId,
            mangaId: exchange.mangaId,
            score,
            reasons: this.generateMatchReasons(userManga, otherManga, userProfile, otherProfile)
          });
        }
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // Calculs de scores
  private calculateGenreScore(manga: Manga, preferredGenres: string[], profile: UserProfile): number {
    const genreMatches = manga.genres.filter(genre => preferredGenres.includes(genre)).length;
    const genreScore = genreMatches / manga.genres.length;
    
    // Bonus pour la popularité et le rating
    const popularityBonus = Math.min(manga.popularity / 10000, 0.2);
    const ratingBonus = manga.rating / 50; // Rating max assumé à 10, bonus max 0.2
    
    // Pénalité si l'utilisateur n'aime pas ce type de démographie
    const demoGraphicPenalty = profile.preferences.demographics.includes(manga.demographic) ? 0 : 0.1;
    
    return Math.max(0, genreScore + popularityBonus + ratingBonus - demoGraphicPenalty);
  }

  private calculateExchangeMatchScore(
    userProfile: UserProfile,
    userManga: Manga,
    otherProfile: UserProfile,
    otherManga: Manga
  ): number {
    let score = 0;

    // Compatibilité de genres
    const genreOverlap = userManga.genres.filter(g => otherManga.genres.includes(g)).length;
    score += genreOverlap * 0.2;

    // Préférences de l'utilisateur
    const userLikesOtherGenres = otherManga.genres.some(g => userProfile.preferences.genres.includes(g));
    if (userLikesOtherGenres) score += 0.3;

    // Historique de rating
    const avgUserRating = userProfile.readingHistory.reduce((sum, h) => sum + h.rating, 0) / userProfile.readingHistory.length;
    const avgOtherRating = otherProfile.readingHistory.reduce((sum, h) => sum + h.rating, 0) / otherProfile.readingHistory.length;
    
    // Bonus si les deux utilisateurs ont des standards similaires
    const ratingCompatibility = 1 - Math.abs(avgUserRating - avgOtherRating) / 5;
    score += ratingCompatibility * 0.2;

    // Bonus pour la qualité du manga
    score += otherManga.rating / 50;

    return Math.min(score, 1);
  }

  // Utilitaires
  private hasUserRead(profile: UserProfile, mangaId: string): boolean {
    return profile.readingHistory.some(h => h.mangaId === mangaId);
  }

  private removeDuplicatesAndRank(recommendations: RecommendationScore[]): RecommendationScore[] {
    const seen = new Set<string>();
    const unique: RecommendationScore[] = [];

    for (const rec of recommendations.sort((a, b) => b.score - a.score)) {
      if (!seen.has(rec.mangaId)) {
        seen.add(rec.mangaId);
        unique.push(rec);
      }
    }

    return unique;
  }

  private generateMatchReasons(
    userManga: Manga,
    otherManga: Manga,
    userProfile: UserProfile,
    otherProfile: UserProfile
  ): string[] {
    const reasons: string[] = [];

    const commonGenres = userManga.genres.filter(g => otherManga.genres.includes(g));
    if (commonGenres.length > 0) {
      reasons.push(`Genres en commun: ${commonGenres.join(', ')}`);
    }

    if (userManga.author === otherManga.author) {
      reasons.push(`Même auteur: ${userManga.author}`);
    }

    const userLikesOtherGenres = otherManga.genres.some(g => userProfile.preferences.genres.includes(g));
    if (userLikesOtherGenres) {
      reasons.push('Correspond à vos goûts');
    }

    if (otherManga.rating >= 8) {
      reasons.push('Très bien noté');
    }

    return reasons;
  }

  // Méthodes publiques pour alimenter le système
  updateUserProfile(userId: string, profile: Partial<UserProfile>): void {
    const existing = this.userProfiles.get(userId) || {
      id: userId,
      preferences: { genres: [], authors: [], demographics: [], themes: [] },
      readingHistory: [],
      exchangeHistory: [],
      behaviorData: { searchQueries: [], viewedMangas: [], timeSpentOnGenres: {}, averageSessionTime: 0 }
    };

    this.userProfiles.set(userId, { ...existing, ...profile });
  }

  addManga(manga: Manga): void {
    this.mangaDatabase.set(manga.id, manga);
  }

  trackUserInteraction(userId: string, action: string, mangaId: string, data?: any): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    switch (action) {
      case 'view':
        profile.behaviorData.viewedMangas.push(mangaId);
        break;
      case 'like':
        const userLikes = this.collaborativeData.get(userId) || new Set();
        userLikes.add(mangaId);
        this.collaborativeData.set(userId, userLikes);
        break;
      case 'search':
        profile.behaviorData.searchQueries.push(data);
        break;
    }

    this.userProfiles.set(userId, profile);
  }
}

export default RecommendationEngine.getInstance();