import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../context/ThemeContext';
import { mockCollection } from '../data/mockData';
import { Collection } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CollectionScreen = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'offering' | 'seeking'>('offering');
  const [collection, setCollection] = useState(mockCollection);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMangaTitle, setNewMangaTitle] = useState('');
  const [newMangaAuthor, setNewMangaAuthor] = useState('');
  const [newMangaVolume, setNewMangaVolume] = useState('');

  const filteredCollection = collection.filter(item => item.status === activeTab);

  const addManga = () => {
    if (!newMangaTitle.trim() || !newMangaAuthor.trim() || !newMangaVolume.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const newManga: Collection = {
      id: Date.now().toString(),
      userId: 'current_user',
      manga: {
        id: Date.now().toString(),
        title: newMangaTitle.trim(),
        author: newMangaAuthor.trim(),
        volume: parseInt(newMangaVolume),
        imageUri: 'https://via.placeholder.com/150x200/FF6B6B/FFFFFF?text=Manga',
        ownerId: 'current_user',
        ownerPseudo: 'MangaSwapper',
        ownerCity: 'Paris',
        condition: 'good',
        isAvailable: activeTab === 'offering',
      },
      status: activeTab,
      addedAt: new Date().toISOString(),
    };

    setCollection(prev => [...prev, newManga]);
    setNewMangaTitle('');
    setNewMangaAuthor('');
    setNewMangaVolume('');
    setShowAddForm(false);
    Alert.alert('Succès', `Manga ajouté à votre liste "${activeTab === 'offering' ? 'Je propose' : 'Je cherche'}" !`);
  };

  const removeManga = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer ce manga de votre collection ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setCollection(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const toggleStatus = (id: string) => {
    setCollection(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'offering' ? 'seeking' : 'offering',
              manga: {
                ...item.manga,
                isAvailable: item.status === 'seeking',
              },
            }
          : item
      )
    );
  };

  const renderMangaCard = ({ item, index }: { item: Collection; index: number }) => {
    const isOffering = item.status === 'offering';
    
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
      >
        <View style={styles.cardHeader}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isOffering ? theme.success : theme.warning }
          ]}>
            <Text style={styles.statusText}>
              {isOffering ? 'Je propose' : 'Je cherche'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Actions',
                'Que souhaitez-vous faire ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: isOffering ? 'Marquer comme recherché' : 'Marquer comme proposé',
                    onPress: () => toggleStatus(item.id),
                  },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => removeManga(item.id),
                  },
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={theme.textLight} />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: item.manga.imageUri }} style={styles.mangaImage} />
        
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {item.manga.title}
          </Text>
          <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.manga.author}
          </Text>
          <Text style={[styles.volume, { color: theme.textSecondary }]}>
            Volume {item.manga.volume}
          </Text>
          
          {isOffering && (
            <View style={styles.conditionContainer}>
              <Ionicons 
                name="star" 
                size={14} 
                color={theme.accent} 
              />
              <Text style={[styles.condition, { color: theme.textSecondary }]}>
                {item.manga.condition === 'excellent' ? 'Excellent' :
                 item.manga.condition === 'good' ? 'Bon' :
                 item.manga.condition === 'fair' ? 'Correct' : 'Usé'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isOffering ? theme.primary : theme.secondary }
          ]}
          onPress={() => toggleStatus(item.id)}
        >
          <Ionicons 
            name={isOffering ? "search" : "gift"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            {isOffering ? 'Chercher' : 'Proposer'}
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '600',
    },
    activeTabText: {
      color: theme.primary,
    },
    inactiveTabText: {
      color: theme.textSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.primary,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    listContainer: {
      padding: 16,
    },
    card: {
      width: CARD_WIDTH,
      marginBottom: 16,
      borderRadius: 12,
      elevation: 3,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    moreButton: {
      padding: 4,
    },
    mangaImage: {
      width: '100%',
      height: 120,
      resizeMode: 'cover',
    },
    cardContent: {
      padding: 12,
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    author: {
      fontSize: 12,
      marginBottom: 2,
    },
    volume: {
      fontSize: 11,
      marginBottom: 8,
    },
    conditionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    condition: {
      fontSize: 11,
      marginLeft: 4,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      margin: 12,
      borderRadius: 8,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
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
    addForm: {
      backgroundColor: theme.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: theme.background,
      color: theme.text,
    },
    formButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    formButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.textLight,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    formButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offering' && styles.activeTab]}
          onPress={() => setActiveTab('offering')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'offering' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            📚 Je propose ({collection.filter(c => c.status === 'offering').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'seeking' && styles.activeTab]}
          onPress={() => setActiveTab('seeking')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'seeking' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            🔍 Je cherche ({collection.filter(c => c.status === 'seeking').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header avec bouton d'ajout */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {activeTab === 'offering' ? 'Mangas que je propose' : 'Mangas que je cherche'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <Animatable.View animation="slideInDown" style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Titre du manga"
            placeholderTextColor={theme.textLight}
            value={newMangaTitle}
            onChangeText={setNewMangaTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Auteur"
            placeholderTextColor={theme.textLight}
            value={newMangaAuthor}
            onChangeText={setNewMangaAuthor}
          />
          <TextInput
            style={styles.input}
            placeholder="Numéro de volume"
            placeholderTextColor={theme.textLight}
            value={newMangaVolume}
            onChangeText={setNewMangaVolume}
            keyboardType="numeric"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowAddForm(false);
                setNewMangaTitle('');
                setNewMangaAuthor('');
                setNewMangaVolume('');
              }}
            >
              <Text style={styles.formButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={addManga}
            >
              <Text style={styles.formButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      )}

      {/* Liste des mangas */}
      {filteredCollection.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={activeTab === 'offering' ? 'gift-outline' : 'search-outline'} 
            size={64} 
            color={theme.textLight} 
          />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {activeTab === 'offering' 
              ? 'Aucun manga proposé' 
              : 'Aucun manga recherché'
            }
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Ajoutez vos premiers mangas pour commencer !
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCollection}
          renderItem={renderMangaCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default CollectionScreen;