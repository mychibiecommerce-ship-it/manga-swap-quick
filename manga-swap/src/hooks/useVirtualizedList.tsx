import { useState, useMemo, useCallback } from 'react';

interface VirtualizedListConfig {
  itemHeight: number;
  containerHeight: number;
  data: any[];
  overscan?: number; // Nombre d'éléments à rendre en plus
}

interface VirtualizedListReturn {
  visibleItems: any[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  onScroll: (event: any) => void;
}

export const useVirtualizedList = ({
  itemHeight,
  containerHeight,
  data,
  overscan = 3
}: VirtualizedListConfig): VirtualizedListReturn => {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculer les indices visibles
  const { startIndex, endIndex } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      data.length - 1
    );

    return {
      startIndex: Math.max(0, visibleStart - overscan),
      endIndex: Math.min(data.length - 1, visibleEnd + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, data.length, overscan]);

  // Éléments visibles
  const visibleItems = useMemo(() => {
    return data.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }));
  }, [data, startIndex, endIndex, itemHeight]);

  // Hauteur totale de la liste
  const totalHeight = data.length * itemHeight;

  // Gestionnaire de scroll
  const onScroll = useCallback((event: any) => {
    const newScrollTop = event.nativeEvent.contentOffset.y;
    setScrollTop(newScrollTop);
  }, []);

  // Fonction pour scroller vers un index
  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    scrollToIndex,
    onScroll
  };
};

// Hook pour la pagination intelligente
export const usePagination = <T,>(data: T[], itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));

  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const currentData = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const loadNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setLoadedPages(prev => new Set([...prev, nextPage]));
    }
  }, [currentPage, totalPages]);

  const hasNextPage = currentPage < totalPages;
  const isLoading = false; // À connecter avec votre logique de chargement

  return {
    currentData,
    currentPage,
    totalPages,
    hasNextPage,
    isLoading,
    loadNextPage,
    setCurrentPage
  };
};