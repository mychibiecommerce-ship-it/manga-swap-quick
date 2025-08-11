import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number;
}

interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  priority?: 'low' | 'normal' | 'high';
}

class CacheManager {
  private static instance: CacheManager;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Nombre max d'éléments

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Stocker des données dans le cache
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + (options.ttl || this.DEFAULT_TTL)
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      
      // Nettoyer le cache si nécessaire
      await this.cleanupExpiredItems();
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  // Récupérer des données du cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Vérifier si le cache a expiré
      if (Date.now() > cacheItem.expires) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  // Supprimer un élément du cache
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  }

  // Vider tout le cache
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // Nettoyer les éléments expirés
  private async cleanupExpiredItems(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      if (cacheKeys.length > this.MAX_CACHE_SIZE) {
        // Supprimer les plus anciens
        const itemsWithTimestamp = await Promise.all(
          cacheKeys.map(async key => {
            const item = await AsyncStorage.getItem(key);
            const parsed = JSON.parse(item || '{}');
            return { key, timestamp: parsed.timestamp || 0 };
          })
        );

        itemsWithTimestamp
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, cacheKeys.length - this.MAX_CACHE_SIZE)
          .forEach(item => AsyncStorage.removeItem(item.key));
      }

      // Supprimer les éléments expirés
      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          const parsed: CacheItem<any> = JSON.parse(item);
          if (Date.now() > parsed.expires) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  // Méthodes spécialisées pour l'app
  async cacheUserProfile(userId: string, profile: any): Promise<void> {
    await this.set(`user_profile_${userId}`, profile, { ttl: 10 * 60 * 1000 }); // 10 min
  }

  async getUserProfile(userId: string): Promise<any> {
    return await this.get(`user_profile_${userId}`);
  }

  async cacheMangaList(query: string, results: any[]): Promise<void> {
    await this.set(`manga_search_${query}`, results, { ttl: 5 * 60 * 1000 }); // 5 min
  }

  async getMangaList(query: string): Promise<any[] | null> {
    return await this.get(`manga_search_${query}`);
  }

  async cacheExchangeHistory(userId: string, history: any[]): Promise<void> {
    await this.set(`exchange_history_${userId}`, history, { ttl: 30 * 60 * 1000 }); // 30 min
  }

  async getExchangeHistory(userId: string): Promise<any[] | null> {
    return await this.get(`exchange_history_${userId}`);
  }

  // Méthode pour récupérer toutes les clés (pour le nettoyage)
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.warn('Cache getAllKeys error:', error);
      return [];
    }
  }
}

export default CacheManager.getInstance();