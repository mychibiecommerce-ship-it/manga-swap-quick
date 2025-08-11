import { useState, useEffect } from 'react';
import MangaCoverService from '../services/MangaCoverService';

interface UseMangaCoverProps {
  title: string;
  author?: string;
  volume?: number;
  fallbackUrl?: string;
}

interface MangaCoverState {
  coverUrl: string | null;
  thumbnailUrl: string | null;
  isLoading: boolean;
  error: boolean;
  source: string | null;
}

export const useMangaCover = ({ title, author, volume, fallbackUrl }: UseMangaCoverProps): MangaCoverState => {
  const [state, setState] = useState<MangaCoverState>({
    coverUrl: fallbackUrl || null,
    thumbnailUrl: fallbackUrl || null,
    isLoading: true,
    error: false,
    source: null
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchCover = async () => {
      if (!title) {
        setState(prev => ({ ...prev, isLoading: false, error: true }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: false }));

      try {
        const cover = await MangaCoverService.getMangaCover(title, author, volume);
        
        if (!isCancelled) {
          if (cover) {
            setState({
              coverUrl: cover.coverUrl,
              thumbnailUrl: cover.thumbnailUrl,
              isLoading: false,
              error: false,
              source: cover.source
            });
          } else {
            // Utiliser fallback si pas de couverture trouvée
            const fallback = MangaCoverService.generateFallbackCover(title, volume);
            setState({
              coverUrl: fallback.coverUrl,
              thumbnailUrl: fallback.thumbnailUrl,
              isLoading: false,
              error: false,
              source: 'fallback'
            });
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Erreur récupération couverture:', error);
          
          // Utiliser fallback en cas d'erreur
          const fallback = MangaCoverService.generateFallbackCover(title, volume);
          setState({
            coverUrl: fallback.coverUrl,
            thumbnailUrl: fallback.thumbnailUrl,
            isLoading: false,
            error: true,
            source: 'fallback'
          });
        }
      }
    };

    fetchCover();

    return () => {
      isCancelled = true;
    };
  }, [title, author, volume, fallbackUrl]);

  return state;
};

// Hook pour plusieurs mangas à la fois
export const useBatchMangaCovers = (mangas: Array<{title: string, author?: string, volume?: number}>) => {
  const [covers, setCovers] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchCovers = async () => {
      setIsLoading(true);
      
      try {
        const batchCovers = await MangaCoverService.getBatchCovers(mangas);
        
        if (!isCancelled) {
          // Ajouter les fallbacks pour les mangas sans couverture
          mangas.forEach(manga => {
            if (!batchCovers.has(manga.title)) {
              const fallback = MangaCoverService.generateFallbackCover(manga.title, manga.volume);
              batchCovers.set(manga.title, fallback);
            }
          });
          
          setCovers(batchCovers);
          setIsLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Erreur batch covers:', error);
          setIsLoading(false);
        }
      }
    };

    if (mangas.length > 0) {
      fetchCovers();
    }

    return () => {
      isCancelled = true;
    };
  }, [mangas]);

  return { covers, isLoading };
};