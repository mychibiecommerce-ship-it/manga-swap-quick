import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../context/ThemeContext';
import { mockMangas } from '../data/mockData';
import { Manga } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type SwapScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

const SwapScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SwapScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMangas = useMemo(() => {
    if (!searchQuery.trim()) return mockMangas;
    
    const query = searchQuery.toLowerCase();
    return mockMangas.filter(manga =>
      manga.title.toLowerCase().includes(query) ||
      manga.author.toLowerCase().includes(query) ||
      manga.ownerCity.toLowerCase().includes(query) ||
      manga.volume.toString().includes(query)
    );
  }, [searchQuery]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 16,
      color: theme.text,
    },
    viewToggle: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    viewButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.surfaceVariant,
    },
    viewButtonActive: {
      backgroundColor: theme.primary,
    },
    listContainer: {
      padding: 16,
    },
    gridCard: {
      width: CARD_WIDTH,
      marginBottom: 16,
      borderRadius: 12,
      elevation: 3,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    listCard: {
      flexDirection: 'row',
      marginBottom: 12,
      borderRadius: 12,
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      padding: 12,
    },
    cardContainer: {
      flex: 1,
    },
    gridImage: {
      width: '100%',
      height: 180,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    listImage: {
      width: 80,
      height: 120,
      borderRadius: 8,
      marginRight: 12,
    },
    image: {
      resizeMode: 'cover',
    },
    gridContent: {
      padding: 12,
    },
    listContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    author: {
      fontSize: 14,
      marginBottom: 2,
    },
    volume: {
      fontSize: 13,
      marginBottom: 8,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    location: {
      fontSize: 12,
      marginLeft: 4,
    },
    exchangeButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    exchangeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  const renderMangaCard = ({ item, index }: { item: Manga; index: number }) => {
    const cardStyle = viewMode === 'grid' ? styles.gridCard : styles.listCard;
    const imageStyle = viewMode === 'grid' ? styles.gridImage : styles.listImage;
    const contentStyle = viewMode === 'grid' ? styles.gridContent : styles.listContent;

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={[cardStyle, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('ExchangeDetail', { mangaId: item.id })}
          style={styles.cardContainer}
        >
          <Image source={{ uri: item.imageUri }} style={[imageStyle, styles.image]} />
          <View style={contentStyle}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.author}
            </Text>
            <Text style={[styles.volume, { color: theme.textSecondary }]}>
              Volume {item.volume}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={theme.textLight} />
              <Text style={[styles.location, { color: theme.textLight }]}>
                {item.ownerCity}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exchangeButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('ExchangeDetail', { mangaId: item.id })}
            >
              <Text style={styles.exchangeButtonText}>Échanger</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={theme.textLight} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par titre, auteur, volume ou ville..."
            placeholderTextColor={theme.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'grid' && styles.viewButtonActive,
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'list' && styles.viewButtonActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? '#FFFFFF' : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {filteredMangas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={theme.textLight} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            Aucun manga trouvé
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Essayez avec d'autres mots-clés
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMangas}
          renderItem={renderMangaCard}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default SwapScreen;