import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import OptimizedImage from '../components/OptimizedImage';
import MangaCover from '../components/MangaCover';
import EmptyState, { WelcomeState } from '../components/EmptyState';
import { usePagination } from '../hooks/useVirtualizedList';
import cacheManager from '../utils/cacheManager';
import ExchangeDetailPage from './ExchangeDetailPage';
import MangaDetailModal from '../components/MangaDetailModal';
import SwapperProfilePage from './SwapperProfilePage';

interface SwapPageProps {
  selectedMangaId?: string | null;
  onClearSelectedManga?: () => void;
}

const mockMangas = [
  {
    id: '1',
    title: 'One Piece',
    author: 'Eiichiro Oda',
    volume: 1,
    image: 'https://via.placeholder.com/120x180/FF6B6B/FFFFFF?text=One+Piece',
    owner: 'MangaFan92',
    ownerName: 'Marie Dubois',
    ownerRating: 4.8,
    ownerAvatar: 'https://picsum.photos/50/50?random=1',
    city: 'Paris',
    condition: 'Excellent',
    description: 'Premier tome en excellent état',
  },
  {
    id: '2',
    title: 'Naruto',
    author: 'Masashi Kishimoto',
    volume: 5,
    image: 'https://via.placeholder.com/120x180/4ECDC4/FFFFFF?text=Naruto',
    owner: 'NinjaReader',
    ownerName: 'Alex Chen',
    ownerRating: 4.6,
    ownerAvatar: 'https://picsum.photos/50/50?random=2',
    city: 'Lyon',
    condition: 'Bon',
    description: 'Volume 5 en bon état',
  },
  {
    id: '3',
    title: 'Attack on Titan',
    author: 'Hajime Isayama',
    volume: 3,
    image: 'https://via.placeholder.com/120x180/FFE66D/FFFFFF?text=AOT',
    owner: 'TitanHunter',
    ownerName: 'Sophie Martin',
    ownerRating: 5.0,
    ownerAvatar: 'https://picsum.photos/50/50?random=3',
    city: 'Marseille',
    condition: 'Excellent',
    description: 'Volume 3 comme neuf',
  },
  {
    id: '4',
    title: 'Demon Slayer',
    author: 'Koyoharu Gotouge',
    volume: 1,
    image: 'https://via.placeholder.com/120x180/A8E6CF/FFFFFF?text=Demon+Slayer',
    owner: 'SlayerFan',
    ownerName: 'Lucas Dupont',
    ownerRating: 4.3,
    ownerAvatar: 'https://picsum.photos/50/50?random=4',
    city: 'Toulouse',
    condition: 'Excellent',
    description: 'Premier tome comme neuf',
  },
  {
    id: '5',
    title: 'My Hero Academia',
    author: 'Kohei Horikoshi',
    volume: 2,
    image: 'https://via.placeholder.com/120x180/FFAAA5/FFFFFF?text=MHA',
    owner: 'HeroCollector',
    ownerName: 'Emma Wilson',
    ownerRating: 4.9,
    ownerAvatar: 'https://picsum.photos/50/50?random=5',
    city: 'Nice',
    condition: 'Bon',
    description: 'Volume 2 en bon état',
  },
];

const SwapPage: React.FC<SwapPageProps> = ({ selectedMangaId: externalSelectedMangaId, onClearSelectedManga }) => {
  const { colors } = useSimpleTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelectedMangaId, setInternalSelectedMangaId] = useState<string | null>(null);
  const [selectedMangaForModal, setSelectedMangaForModal] = useState<typeof mockMangas[0] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSwapperId, setSelectedSwapperId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [citySearch, setCitySearch] = useState('');
  const [tempFilters, setTempFilters] = useState({
    city: '',
    condition: '',
    sort: 'recent' as 'recent' | 'title'
  });
  const [cachedResults, setCachedResults] = useState<typeof mockMangas>([]);
  const [isLoadingCache, setIsLoadingCache] = useState(false);

  // Définition de filteredMangas avant son usage dans les hooks
  const filteredMangas = mockMangas.filter(manga => {
    const matchesSearch = manga.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === '' || manga.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCondition = selectedCondition === '' || manga.condition === selectedCondition;
    
    return matchesSearch && matchesCity && matchesCondition;
  });

  // Utilisation de la pagination pour de meilleures performances
  const { currentData, hasNextPage, loadNextPage } = usePagination(filteredMangas, 10);
  
  // Cache des résultats de recherche
  useEffect(() => {
    const loadCachedResults = async () => {
      if (searchQuery.length > 2) {
        setIsLoadingCache(true);
        const cached = await cacheManager.getMangaList(searchQuery);
        if (cached) {
          setCachedResults(cached);
        }
        setIsLoadingCache(false);
      }
    };
    
    loadCachedResults();
  }, [searchQuery]);
  
  // Mise en cache des nouveaux résultats
  useEffect(() => {
    if (searchQuery.length > 2 && filteredMangas.length > 0) {
      cacheManager.cacheMangaList(searchQuery, filteredMangas);
    }
  }, [searchQuery, filteredMangas]);

  if (selectedSwapperId) {
    return (
      <SwapperProfilePage
        swapperId={selectedSwapperId}
        onBack={() => setSelectedSwapperId(null)}
      />
    );
  }

  // Utilise le selectedMangaId externe en priorité, sinon l'interne
  const currentSelectedMangaId = externalSelectedMangaId || internalSelectedMangaId;

  if (currentSelectedMangaId) {
    return (
      <ExchangeDetailPage
        mangaId={currentSelectedMangaId}
        onBack={() => {
          if (externalSelectedMangaId && onClearSelectedManga) {
            onClearSelectedManga();
          } else {
            setInternalSelectedMangaId(null);
          }
        }}
        userRole="requester"
      />
    );
  }

  const handleExchangeRequest = (manga: typeof mockMangas[0]) => {
    setInternalSelectedMangaId(manga.id);
  };

  const handleMangaDetails = (manga: typeof mockMangas[0]) => {
    setSelectedMangaForModal(manga);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMangaForModal(null);
  };

  const handleExchangeFromModal = () => {
    if (selectedMangaForModal) {
      handleCloseModal();
      setInternalSelectedMangaId(selectedMangaForModal.id);
    }
  };

  const handleSwapperProfileClick = (swapperId: string) => {
    setSelectedSwapperId(swapperId);
  };

  const handleAddToWishlist = (mangaId: string) => {
    console.log('Ajouté à la wishlist:', mangaId);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const sortedMangas = [...filteredMangas].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const applyFilters = () => {
    setSelectedCity(tempFilters.city);
    setSelectedCondition(tempFilters.condition);
    setSortBy(tempFilters.sort);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setTempFilters({ city: '', condition: '', sort: 'recent' });
    setSelectedCity('');
    setSelectedCondition('');
    setSortBy('recent');
    setCitySearch('');
  };

  const getCurrentLocation = () => {
    setCitySearch('Paris'); // Simulation de géolocalisation
  };

  const renderListView = () => {
    // Si aucun manga disponible, afficher l'état d'accueil
    if (sortedMangas.length === 0) {
      return (
        <WelcomeState 
          onStart={() => {
            // Action pour commencer - pourrait naviguer vers l'ajout de manga
            console.log('Commencer l\'aventure !');
          }}
        />
      );
    }
    
    return (
      <ScrollView style={styles.mangaList}>
        {sortedMangas.map((manga) => (
        <Animatable.View key={manga.id} style={styles.mangaCard} animation="fadeInUp" duration={500}>
                        <MangaCover 
                title={manga.title} 
                author={manga.author} 
                volume={manga.volume}
                style={styles.mangaImage} 
                size="medium"
                quality="medium"
              />
          <View style={styles.mangaInfo}>
            <View style={styles.mangaHeader}>
              <Text style={styles.mangaTitle}>{manga.title}</Text>
              <TouchableOpacity onPress={() => handleAddToWishlist(manga.id)} style={styles.wishlistButton}>
                <Text style={styles.wishlistIcon}>🤍</Text>
              </TouchableOpacity>
            </View>
            {/* Auteur supprimé */}
            <Text style={styles.mangaVolume}>Volume {manga.volume}</Text>
            <Text style={styles.mangaCondition}>{manga.condition}</Text>
            
            <TouchableOpacity
              style={styles.swapperInfo}
              onPress={() => handleSwapperProfileClick(manga.owner)}
            >
                              <OptimizedImage uri={manga.ownerAvatar} style={styles.swapperAvatar} quality="low" />
              <View style={styles.swapperDetails}>
                <Text style={styles.swapperName}>{manga.ownerName}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.starsText}>{renderStars(manga.ownerRating)}</Text>
                  <Text style={styles.ratingText}>({manga.ownerRating})</Text>
                </View>
              </View>
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={14} color={colors.textLight} />
                <Text style={styles.cityText}>{manga.city}</Text>
              </View>
            </TouchableOpacity>

            {/* Boutons côte à côte */}
            <View style={styles.mangaActions}>
              <TouchableOpacity style={styles.detailButton} onPress={() => handleMangaDetails(manga)}>
                <Text style={styles.detailButtonText}>Voir détails</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exchangeButton} onPress={() => handleExchangeRequest(manga)}>
                <Text style={styles.exchangeButtonText}>Demander échange</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      ))}
    </ScrollView>
    );
  };

  const renderGridView = () => {
    // Si aucun manga disponible, afficher l'état d'accueil
    if (sortedMangas.length === 0) {
      return (
        <WelcomeState 
          onStart={() => {
            console.log('Commencer l\'aventure !');
          }}
        />
      );
    }
    
    return (
      <ScrollView style={styles.mangaList}>
        <View style={styles.gridContainer}>
          {sortedMangas.map((manga) => (
          <Animatable.View key={manga.id} style={styles.gridCardWrapper} animation="fadeInUp" duration={500}>
            <View style={styles.gridMangaCard}>
              <MangaCover 
                title={manga.title} 
                author={manga.author} 
                volume={manga.volume}
                style={styles.gridMangaImage} 
                size="small"
                quality="low"
              />
              <TouchableOpacity onPress={() => handleAddToWishlist(manga.id)} style={styles.gridWishlistButton}>
                <Text style={styles.gridWishlistIcon}>🤍</Text>
              </TouchableOpacity>
              <View style={styles.gridMangaInfo}>
                <Text style={styles.gridMangaTitle} numberOfLines={1}>{manga.title}</Text>
                {/* Auteur supprimé */}
                <Text style={styles.gridMangaVolume}>Vol. {manga.volume}</Text>
                
                <TouchableOpacity
                  style={styles.gridSwapperInfo}
                  onPress={() => handleSwapperProfileClick(manga.owner)}
                >
                  <OptimizedImage uri={manga.ownerAvatar} style={styles.gridSwapperAvatar} quality="low" />
                  <View style={styles.gridSwapperDetails}>
                    <Text style={styles.gridSwapperName} numberOfLines={1}>{manga.ownerName}</Text>
                    <View style={styles.gridRatingRow}>
                      <Text style={styles.gridStarsText}>{renderStars(manga.ownerRating)}</Text>
                      <Text style={styles.gridRatingText}>({manga.ownerRating})</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.gridLocationInfo}>
                  <Ionicons name="location-outline" size={12} color={colors.textLight} />
                  <Text style={styles.gridCityText} numberOfLines={1}>{manga.city}</Text>
                </View>
                
                <View style={styles.gridMangaActions}>
                  <TouchableOpacity style={styles.gridDetailButton} onPress={() => handleMangaDetails(manga)}>
                    <Text style={styles.gridDetailButtonText}>Détails</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.gridExchangeButton} onPress={() => handleExchangeRequest(manga)}>
                    <Text style={styles.gridExchangeButtonText}>Échanger</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animatable.View>
        ))}
      </View>
    </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.surface,
      alignItems: 'center',
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: colors.text,
    },
    filterButton: {
      padding: 10,
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    controlsRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 10,
      backgroundColor: colors.surface,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    viewModeContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 3,
    },
    viewModeButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 17,
    },
    activeViewButton: {
      backgroundColor: colors.primary,
    },
    inactiveViewButton: {
      backgroundColor: 'transparent',
    },
    activeViewButtonText: {
      color: colors.surface,
      fontWeight: '600',
      fontSize: 14,
    },
    inactiveViewButtonText: {
      color: colors.textSecondary,
      fontWeight: '500',
      fontSize: 14,
    },
    resultsText: {
      color: colors.textSecondary,
      fontSize: 14,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.surface,
    },
    filtersPanel: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    filterHeaderTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    resetButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.background,
      borderRadius: 15,
    },
    resetButtonText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    filterPanelRow: {
      marginBottom: 15,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    citySearchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    citySearchInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.text,
    },
    locationButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    locationButtonText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    filterChipsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 5,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activeFilterChipText: {
      color: colors.surface,
    },
    filterActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      gap: 15,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    applyButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    applyButtonText: {
      color: colors.surface,
      fontWeight: '600',
    },
    mangaList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    mangaCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
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
    },
    mangaInfo: {
      flex: 1,
      marginLeft: 15,
    },
    mangaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    mangaTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    wishlistButton: {
      padding: 5,
    },
    wishlistIcon: {
      fontSize: 18,
    },
    mangaAuthor: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    mangaVolume: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 4,
      fontWeight: '600',
    },
    mangaCondition: {
      fontSize: 12,
      color: colors.success,
      marginTop: 2,
    },
    swapperInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 8,
    },
    swapperAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    swapperDetails: {
      flex: 1,
      marginLeft: 8,
    },
    swapperName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    starsText: {
      fontSize: 10,
      marginRight: 4,
    },
    ratingText: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    star: {
      fontSize: 10,
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cityText: {
      fontSize: 10,
      color: colors.textLight,
      marginLeft: 2,
    },
    mangaActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      gap: 8,
    },
    detailButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    detailButtonText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    exchangeButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 15,
      alignItems: 'center',
    },
    exchangeButtonText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridCardWrapper: {
      width: '48%',
      marginBottom: 15,
    },
    gridMangaCard: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    gridMangaImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
    },
    gridWishlistButton: {
      position: 'absolute',
      top: 18,
      right: 18,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 15,
      padding: 4,
    },
    gridWishlistIcon: {
      fontSize: 14,
    },
    gridMangaInfo: {
      flex: 1,
    },
    gridMangaTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    gridMangaAuthor: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    gridMangaVolume: {
      fontSize: 11,
      color: colors.primary,
      marginTop: 4,
      fontWeight: '600',
    },
    gridSwapperInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 6,
    },
    gridSwapperAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    gridSwapperDetails: {
      flex: 1,
      marginLeft: 6,
    },
    gridSwapperName: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.text,
    },
    gridRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 1,
    },
    gridStarsText: {
      fontSize: 8,
      marginRight: 2,
    },
    gridRatingText: {
      fontSize: 8,
      color: colors.textSecondary,
    },
    gridLocationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    gridCityText: {
      fontSize: 9,
      color: colors.textLight,
      marginLeft: 2,
    },
    gridMangaActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      gap: 6,
    },
    gridDetailButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
    },
    gridDetailButtonText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '600',
    },
    gridExchangeButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
    },
    gridExchangeButtonText: {
      color: colors.surface,
      fontSize: 10,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Barre de recherche et filtre */}
      <Animatable.View style={styles.searchRow} animation="slideInDown" duration={600}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un manga, auteur, ville..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={colors.surface} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Boutons de vue et résultats */}
      <Animatable.View style={styles.controlsRow} animation="slideInDown" duration={700}>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' ? styles.activeViewButton : styles.inactiveViewButton
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[
              viewMode === 'list' ? styles.activeViewButtonText : styles.inactiveViewButtonText
            ]}>
              ☰ Liste
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'grid' ? styles.activeViewButton : styles.inactiveViewButton
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[
              viewMode === 'grid' ? styles.activeViewButtonText : styles.inactiveViewButtonText
            ]}>
              ⊞ Grille
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      <Text style={styles.resultsText}>
        {sortedMangas.length} manga{sortedMangas.length > 1 ? 's' : ''} trouvé{sortedMangas.length > 1 ? 's' : ''}
      </Text>

      {/* Panneau de filtres */}
      {showFilters && (
        <Animatable.View 
          style={styles.filtersPanel}
          animation="slideInDown"
          duration={300}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeaderTitle}>🔍 Filtres de recherche</Text>
            <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterPanelRow}>
            <Text style={styles.filterLabel}>Ville :</Text>
            <View style={styles.citySearchRow}>
              <TextInput
                style={styles.citySearchInput}
                placeholder="Rechercher une ville..."
                placeholderTextColor={colors.textSecondary}
                value={citySearch}
                onChangeText={(text) => {
                  setCitySearch(text);
                  setTempFilters({...tempFilters, city: text});
                }}
              />
              <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                <Text style={styles.locationButtonText}>📍</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterPanelRow}>
            <Text style={styles.filterLabel}>État :</Text>
            <View style={styles.filterChipsContainer}>
              {['Excellent', 'Bon', 'Correct'].map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.filterChip,
                    tempFilters.condition === condition && styles.activeFilterChip
                  ]}
                  onPress={() => setTempFilters({...tempFilters, condition: tempFilters.condition === condition ? '' : condition})}
                >
                  <Text style={[
                    styles.filterChipText,
                    tempFilters.condition === condition && styles.activeFilterChipText
                  ]}>
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterPanelRow}>
            <Text style={styles.filterLabel}>Tri :</Text>
            <View style={styles.filterChipsContainer}>
              {[
                { key: 'recent', label: 'Récent' },
                { key: 'title', label: 'Titre' }
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.filterChip,
                    tempFilters.sort === sort.key && styles.activeFilterChip
                  ]}
                  onPress={() => setTempFilters({...tempFilters, sort: sort.key as any})}
                >
                  <Text style={[
                    styles.filterChipText,
                    tempFilters.sort === sort.key && styles.activeFilterChipText
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>✓ Appliquer</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      )}

      {/* Contenu */}
      <View style={{ flex: 1 }}>
        {sortedMangas.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              Aucun manga trouvé
            </Text>
          </View>
        ) : (
          viewMode === 'list' ? renderListView() : renderGridView()
        )}
      </View>

      {/* Modal de détails */}
      <MangaDetailModal
        manga={selectedMangaForModal}
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onExchange={handleExchangeFromModal}
      />
    </View>
  );
};

export default SwapPage;