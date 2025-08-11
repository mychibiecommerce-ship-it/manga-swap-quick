import cacheManager from '../utils/cacheManager';

interface MangaAPIResponse {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  image: string;
  rating: number;
  publishedDate: string;
  volumes: number;
  status: 'ongoing' | 'completed' | 'hiatus';
  demographic: string;
  themes: string[];
  serialization: string;
  synonyms: string[];
}

interface AnimeCalendarEvent {
  id: string;
  title: string;
  episodeNumber: number;
  airDate: Date;
  image: string;
  description: string;
  mangaId?: string;
}

interface MangaNewsItem {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  image: string;
  source: string;
  tags: string[];
  relatedMangaIds: string[];
}

class ExternalAPIService {
  private static instance: ExternalAPIService;
  private readonly BASE_URLS = {
    myAnimeList: 'https://api.myanimelist.net/v2',
    aniList: 'https://graphql.anilist.co',
    mangaDex: 'https://api.mangadex.org',
    jikan: 'https://api.jikan.moe/v4',
    mangaUpdates: 'https://api.mangaupdates.com/v1'
  };

  static getInstance(): ExternalAPIService {
    if (!ExternalAPIService.instance) {
      ExternalAPIService.instance = new ExternalAPIService();
    }
    return ExternalAPIService.instance;
  }

  // Recherche de manga via multiple APIs
  async searchManga(query: string, options: {
    source?: 'all' | 'mal' | 'anilist' | 'mangadx';
    limit?: number;
    cache?: boolean;
  } = {}): Promise<MangaAPIResponse[]> {
    const { source = 'all', limit = 20, cache = true } = options;
    const cacheKey = `search_${source}_${query}_${limit}`;

    if (cache) {
      const cached = await cacheManager.get<MangaAPIResponse[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      let results: MangaAPIResponse[] = [];

      if (source === 'all' || source === 'mal') {
        const malResults = await this.searchMyAnimeList(query, limit);
        results = [...results, ...malResults];
      }

      if (source === 'all' || source === 'anilist') {
        const anilistResults = await this.searchAniList(query, limit);
        results = [...results, ...anilistResults];
      }

      if (source === 'all' || source === 'mangadx') {
        const mangadxResults = await this.searchMangaDex(query, limit);
        results = [...results, ...mangadxResults];
      }

      // Supprimer les doublons basés sur le titre
      const uniqueResults = this.removeDuplicateMangas(results);
      const finalResults = uniqueResults.slice(0, limit);

      if (cache) {
        await cacheManager.set(cacheKey, finalResults, { ttl: 30 * 60 * 1000 }); // 30 min
      }

      return finalResults;
    } catch (error) {
      console.error('Erreur lors de la recherche de manga:', error);
      return [];
    }
  }

  // Obtenir les détails complets d'un manga
  async getMangaDetails(mangaId: string, source: string): Promise<MangaAPIResponse | null> {
    const cacheKey = `manga_details_${source}_${mangaId}`;
    const cached = await cacheManager.get<MangaAPIResponse>(cacheKey);
    if (cached) return cached;

    try {
      let manga: MangaAPIResponse | null = null;

      switch (source) {
        case 'mal':
          manga = await this.getMyAnimeListDetails(mangaId);
          break;
        case 'anilist':
          manga = await this.getAniListDetails(mangaId);
          break;
        case 'mangadx':
          manga = await this.getMangaDexDetails(mangaId);
          break;
      }

      if (manga) {
        await cacheManager.set(cacheKey, manga, { ttl: 24 * 60 * 60 * 1000 }); // 24h
      }

      return manga;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      return null;
    }
  }

  // Calendrier des sorties anime/manga
  async getAnimeCalendar(week: 'current' | 'next' = 'current'): Promise<AnimeCalendarEvent[]> {
    const cacheKey = `anime_calendar_${week}`;
    const cached = await cacheManager.get<AnimeCalendarEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      // Simulation d'API - remplacer par de vraies requêtes
      const mockEvents: AnimeCalendarEvent[] = [
        {
          id: '1',
          title: 'Attack on Titan Final Season',
          episodeNumber: 12,
          airDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          image: 'https://cdn.myanimelist.net/images/anime/1988/117417.jpg',
          description: 'L\'épisode final de la série',
          mangaId: 'aot_manga'
        },
        {
          id: '2',
          title: 'Demon Slayer: Swordsmith Village Arc',
          episodeNumber: 5,
          airDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          image: 'https://cdn.myanimelist.net/images/anime/1935/126830.jpg',
          description: 'L\'arc du village des forgerons continue',
          mangaId: 'ds_manga'
        }
      ];

      await cacheManager.set(cacheKey, mockEvents, { ttl: 60 * 60 * 1000 }); // 1h
      return mockEvents;
    } catch (error) {
      console.error('Erreur lors de la récupération du calendrier:', error);
      return [];
    }
  }

  // Actualités manga
  async getMangaNews(limit: number = 10): Promise<MangaNewsItem[]> {
    const cacheKey = `manga_news_${limit}`;
    const cached = await cacheManager.get<MangaNewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      // Simulation d'API actualités
      const mockNews: MangaNewsItem[] = [
        {
          id: '1',
          title: 'Nouvelle série de Hajime Isayama annoncée',
          content: 'Le créateur d\'Attack on Titan annonce son nouveau projet...',
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          image: 'https://example.com/news1.jpg',
          source: 'Anime News Network',
          tags: ['annonce', 'nouveau', 'isayama'],
          relatedMangaIds: ['aot']
        },
        {
          id: '2',
          title: 'One Piece atteint un nouveau record de ventes',
          content: 'Le manga de Eiichiro Oda continue de battre des records...',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          image: 'https://example.com/news2.jpg',
          source: 'Manga Plus',
          tags: ['record', 'ventes', 'one piece'],
          relatedMangaIds: ['onepiece']
        }
      ];

      await cacheManager.set(cacheKey, mockNews, { ttl: 30 * 60 * 1000 }); // 30 min
      return mockNews;
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      return [];
    }
  }

  // Recommandations basées sur les tendances externes
  async getTrendingRecommendations(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<MangaAPIResponse[]> {
    const cacheKey = `trending_${timeframe}`;
    const cached = await cacheManager.get<MangaAPIResponse[]>(cacheKey);
    if (cached) return cached;

    try {
      // Combiner les données de trending de multiple sources
      const [malTrending, anilistTrending] = await Promise.all([
        this.getMyAnimeListTrending(timeframe),
        this.getAniListTrending(timeframe)
      ]);

      const combined = [...malTrending, ...anilistTrending];
      const unique = this.removeDuplicateMangas(combined);
      
      await cacheManager.set(cacheKey, unique, { ttl: 60 * 60 * 1000 }); // 1h
      return unique;
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances:', error);
      return [];
    }
  }

  // Import de collection depuis MyAnimeList
  async importCollectionFromMAL(username: string): Promise<MangaAPIResponse[]> {
    try {
      // Simulation - remplacer par vraie API MAL
      const mockCollection: MangaAPIResponse[] = [
        {
          id: 'mal_1',
          title: 'Berserk',
          author: 'Kentaro Miura',
          genres: ['Action', 'Drama', 'Fantasy', 'Horror'],
          description: 'Dark fantasy manga about Guts, a lone warrior...',
          image: 'https://cdn.myanimelist.net/images/manga/1/157897.jpg',
          rating: 9.4,
          publishedDate: '1989-08-25',
          volumes: 41,
          status: 'ongoing',
          demographic: 'seinen',
          themes: ['Military', 'Mythology'],
          serialization: 'Young Animal',
          synonyms: ['Berserk']
        }
      ];

      return mockCollection;
    } catch (error) {
      console.error('Erreur lors de l\'import MAL:', error);
      return [];
    }
  }

  // Méthodes privées pour chaque API

  private async searchMyAnimeList(query: string, limit: number): Promise<MangaAPIResponse[]> {
    // Simulation - remplacer par vraie API MAL
    return [];
  }

  private async searchAniList(query: string, limit: number): Promise<MangaAPIResponse[]> {
    // Simulation GraphQL AniList
    const graphqlQuery = `
      query ($search: String, $perPage: Int) {
        Page(perPage: $perPage) {
          media(search: $search, type: MANGA) {
            id
            title {
              romaji
              english
              native
            }
            staff {
              nodes {
                name {
                  full
                }
              }
            }
            genres
            description
            coverImage {
              large
            }
            averageScore
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    // Simulation de réponse
    return [];
  }

  private async searchMangaDex(query: string, limit: number): Promise<MangaAPIResponse[]> {
    // Simulation API MangaDex
    return [];
  }

  private async getMyAnimeListDetails(mangaId: string): Promise<MangaAPIResponse | null> {
    // Simulation
    return null;
  }

  private async getAniListDetails(mangaId: string): Promise<MangaAPIResponse | null> {
    // Simulation
    return null;
  }

  private async getMangaDexDetails(mangaId: string): Promise<MangaAPIResponse | null> {
    // Simulation
    return null;
  }

  private async getMyAnimeListTrending(timeframe: string): Promise<MangaAPIResponse[]> {
    // Simulation
    return [];
  }

  private async getAniListTrending(timeframe: string): Promise<MangaAPIResponse[]> {
    // Simulation
    return [];
  }

  private removeDuplicateMangas(mangas: MangaAPIResponse[]): MangaAPIResponse[] {
    const seen = new Set<string>();
    return mangas.filter(manga => {
      const key = manga.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Méthodes utilitaires

  async getPopularityTrends(mangaId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<{
    date: Date;
    views: number;
    searches: number;
    discussions: number;
  }[]> {
    const cacheKey = `popularity_trends_${mangaId}_${period}`;
    const cached = await cacheManager.get(cacheKey);
    if (cached) return cached;

    // Simulation de données de tendances
    const trends = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        views: Math.floor(Math.random() * 10000) + 1000,
        searches: Math.floor(Math.random() * 1000) + 100,
        discussions: Math.floor(Math.random() * 100) + 10
      });
    }

    await cacheManager.set(cacheKey, trends, { ttl: 60 * 60 * 1000 }); // 1h
    return trends;
  }

  async getSimilarMangas(mangaId: string, source: string): Promise<MangaAPIResponse[]> {
    const cacheKey = `similar_${source}_${mangaId}`;
    const cached = await cacheManager.get<MangaAPIResponse[]>(cacheKey);
    if (cached) return cached;

    // Logique pour trouver des mangas similaires
    const similar: MangaAPIResponse[] = [];
    
    await cacheManager.set(cacheKey, similar, { ttl: 24 * 60 * 60 * 1000 }); // 24h
    return similar;
  }
}

export default ExternalAPIService.getInstance();