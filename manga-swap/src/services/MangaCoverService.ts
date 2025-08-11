import ExternalAPIService from './ExternalAPIService';
import cacheManager from '../utils/cacheManager';

interface MangaCover {
  id: string;
  title: string;
  coverUrl: string;
  thumbnailUrl: string;
  source: 'myanimelist' | 'anilist' | 'mangadex' | 'openlibrary' | 'google';
  quality: 'low' | 'medium' | 'high';
}

class MangaCoverService {
  private static instance: MangaCoverService;
  
  // URLs des APIs gratuites pour les pochettes
  private readonly API_ENDPOINTS = {
    // MyAnimeList (Gratuit avec clé API)
    myanimelist: 'https://api.myanimelist.net/v2/manga',
    
    // AniList (Gratuit, GraphQL)
    anilist: 'https://graphql.anilist.co',
    
    // MangaDex (Gratuit, très complet)
    mangadex: 'https://api.mangadex.org',
    
    // Jikan (Gratuit, proxy MAL)
    jikan: 'https://api.jikan.moe/v4',
    
    // Google Books (Gratuit pour certains mangas)
    googleBooks: 'https://www.googleapis.com/books/v1/volumes',
    
    // Open Library (Gratuit)
    openLibrary: 'https://covers.openlibrary.org/b/isbn'
  };

  static getInstance(): MangaCoverService {
    if (!MangaCoverService.instance) {
      MangaCoverService.instance = new MangaCoverService();
    }
    return MangaCoverService.instance;
  }

  // Méthode principale pour récupérer une pochette
  async getMangaCover(title: string, author?: string, volume?: number): Promise<MangaCover | null> {
    const searchKey = `${title}_${author || ''}_${volume || ''}`.toLowerCase();
    
    // Vérifier le cache d'abord
    const cached = await cacheManager.get<MangaCover>(`cover_${searchKey}`);
    if (cached) return cached;

    // Essayer plusieurs sources dans l'ordre
    const sources = ['jikan', 'anilist', 'mangadex', 'googleBooks'];
    
    for (const source of sources) {
      try {
        const cover = await this.searchCoverFromSource(source, title, author, volume);
        if (cover) {
          // Mettre en cache pour 24h
          await cacheManager.set(`cover_${searchKey}`, cover);
          return cover;
        }
      } catch (error) {
        console.warn(`Erreur avec ${source}:`, error);
        continue;
      }
    }

    return null;
  }

  // Recherche spécifique par source
  private async searchCoverFromSource(
    source: string, 
    title: string, 
    author?: string, 
    volume?: number
  ): Promise<MangaCover | null> {
    switch (source) {
      case 'jikan':
        return this.searchJikan(title, author);
      case 'anilist':
        return this.searchAniList(title, author);
      case 'mangadex':
        return this.searchMangaDex(title, author, volume);
      case 'googleBooks':
        return this.searchGoogleBooks(title, author);
      default:
        return null;
    }
  }

  // Jikan API (Proxy gratuit de MyAnimeList)
  private async searchJikan(title: string, author?: string): Promise<MangaCover | null> {
    try {
      const searchQuery = encodeURIComponent(title);
      const response = await fetch(`${this.API_ENDPOINTS.jikan}/manga?q=${searchQuery}&limit=1`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const manga = data.data[0];
        return {
          id: manga.mal_id.toString(),
          title: manga.title,
          coverUrl: manga.images.jpg.large_image_url,
          thumbnailUrl: manga.images.jpg.image_url,
          source: 'myanimelist',
          quality: 'high'
        };
      }
    } catch (error) {
      console.error('Erreur Jikan:', error);
    }
    return null;
  }

  // AniList API (GraphQL gratuit)
  private async searchAniList(title: string, author?: string): Promise<MangaCover | null> {
    try {
      const query = `
        query ($search: String) {
          Media(search: $search, type: MANGA) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              medium
            }
          }
        }
      `;

      const response = await fetch(this.API_ENDPOINTS.anilist, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { search: title }
        })
      });

      const data = await response.json();
      
      if (data.data?.Media) {
        const manga = data.data.Media;
        return {
          id: manga.id.toString(),
          title: manga.title.romaji || manga.title.english,
          coverUrl: manga.coverImage.large,
          thumbnailUrl: manga.coverImage.medium,
          source: 'anilist',
          quality: 'high'
        };
      }
    } catch (error) {
      console.error('Erreur AniList:', error);
    }
    return null;
  }

  // MangaDex API (Gratuit et très complet)
  private async searchMangaDex(title: string, author?: string, volume?: number): Promise<MangaCover | null> {
    try {
      const searchQuery = encodeURIComponent(title);
      const response = await fetch(`${this.API_ENDPOINTS.mangadex}/manga?title=${searchQuery}&limit=1`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const manga = data.data[0];
        const mangaId = manga.id;
        
        // Récupérer la cover
        const coverResponse = await fetch(`${this.API_ENDPOINTS.mangadex}/cover?manga[]=${mangaId}&limit=1`);
        const coverData = await coverResponse.json();
        
        if (coverData.data && coverData.data.length > 0) {
          const cover = coverData.data[0];
          const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}`;
          
          return {
            id: mangaId,
            title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
            coverUrl: coverUrl,
            thumbnailUrl: coverUrl + '.256.jpg',
            source: 'mangadex',
            quality: 'high'
          };
        }
      }
    } catch (error) {
      console.error('Erreur MangaDex:', error);
    }
    return null;
  }

  // Google Books API (Pour certains mangas)
  private async searchGoogleBooks(title: string, author?: string): Promise<MangaCover | null> {
    try {
      const searchQuery = encodeURIComponent(`${title} ${author || ''} manga`);
      const response = await fetch(`${this.API_ENDPOINTS.googleBooks}?q=${searchQuery}&maxResults=1`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const book = data.items[0];
        const thumbnail = book.volumeInfo.imageLinks?.thumbnail;
        
        if (thumbnail) {
          return {
            id: book.id,
            title: book.volumeInfo.title,
            coverUrl: thumbnail.replace('&zoom=1', '&zoom=2'), // Meilleure qualité
            thumbnailUrl: thumbnail,
            source: 'google',
            quality: 'medium'
          };
        }
      }
    } catch (error) {
      console.error('Erreur Google Books:', error);
    }
    return null;
  }

  // Recherche batch pour plusieurs mangas
  async getBatchCovers(mangas: Array<{title: string, author?: string, volume?: number}>): Promise<Map<string, MangaCover>> {
    const results = new Map<string, MangaCover>();
    
    // Traiter par petits groupes pour éviter le rate limiting
    const batchSize = 5;
    for (let i = 0; i < mangas.length; i += batchSize) {
      const batch = mangas.slice(i, i + batchSize);
      
      const promises = batch.map(async (manga) => {
        const cover = await this.getMangaCover(manga.title, manga.author, manga.volume);
        if (cover) {
          results.set(manga.title, cover);
        }
      });
      
      await Promise.all(promises);
      
      // Pause entre les batches
      if (i + batchSize < mangas.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Fallback avec images par défaut
  generateFallbackCover(title: string, volume?: number): MangaCover {
    // Générer une couleur basée sur le titre
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const colorIndex = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];
    
    // URL pour générer une image placeholder
    const size = '300x400';
    const text = encodeURIComponent(`${title}${volume ? ` Vol.${volume}` : ''}`);
    const placeholderUrl = `https://via.placeholder.com/${size}/${color.substring(1)}/FFFFFF?text=${text}`;
    
    return {
      id: `fallback_${title}_${volume || ''}`,
      title,
      coverUrl: placeholderUrl,
      thumbnailUrl: placeholderUrl,
      source: 'google', // fallback
      quality: 'medium'
    };
  }

  // Nettoyer le cache des pochettes
  async clearCoverCache(): Promise<void> {
    // Supprimer toutes les clés qui commencent par 'cover_'
    const keys = await cacheManager.getAllKeys?.() || [];
    const coverKeys = keys.filter(key => key.startsWith('cover_'));
    
    for (const key of coverKeys) {
      await cacheManager.remove(key.replace('@mangaSwapCache:', ''));
    }
  }

  // Précharger les pochettes populaires
  async preloadPopularCovers(): Promise<void> {
    const popularMangas = [
      { title: 'One Piece', author: 'Eiichiro Oda' },
      { title: 'Naruto', author: 'Masashi Kishimoto' },
      { title: 'Attack on Titan', author: 'Hajime Isayama' },
      { title: 'Dragon Ball', author: 'Akira Toriyama' },
      { title: 'Death Note', author: 'Tsugumi Ohba' },
      { title: 'My Hero Academia', author: 'Kohei Horikoshi' },
      { title: 'Demon Slayer', author: 'Koyoharu Gotouge' },
      { title: 'Tokyo Ghoul', author: 'Sui Ishida' },
      { title: 'Fullmetal Alchemist', author: 'Hiromu Arakawa' },
      { title: 'Hunter x Hunter', author: 'Yoshihiro Togashi' }
    ];

    console.log('🎨 Préchargement des pochettes populaires...');
    await this.getBatchCovers(popularMangas);
    console.log('✅ Pochettes populaires préchargées');
  }
}

export default MangaCoverService.getInstance();