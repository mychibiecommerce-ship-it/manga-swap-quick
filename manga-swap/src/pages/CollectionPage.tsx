import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import { useNotification } from '../hooks/useNotification';
import EmptyState from '../components/EmptyState';
import ExternalAPIService from '../services/ExternalAPIService';
// import BarcodeScanner from '../components/BarcodeScanner';

interface Manga {
  id: string;
  title: string;
  volume: number;
  image: string;
  status: 'offering' | 'seeking';
  condition?: 'Excellent' | 'Bon' | 'Correct';
  description?: string;
}

// Collection vide pour la production - Les utilisateurs ajouteront leurs propres mangas
const initialCollection: Manga[] = [];

const CollectionPage = () => {
  const { colors } = useSimpleTheme();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'offering' | 'seeking'>('offering');
  const [collection, setCollection] = useState<Manga[]>(initialCollection);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [newImage, setNewImage] = useState<string>('');
  const [newCondition, setNewCondition] = useState<'Excellent' | 'Bon' | 'Correct'>('Bon');
  const [newDescription, setNewDescription] = useState('');
  // Autocomplétion
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [titleDebounce, setTitleDebounce] = useState<any>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedMangaForDetails, setSelectedMangaForDetails] = useState<Manga | null>(null);

  const filteredCollection = collection.filter(manga => manga.status === activeTab);

  const handleCardClick = (manga: Manga) => {
    setSelectedMangaForDetails(manga);
  };

  // Fonctions pour la gestion des images
  const pickImageFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showNotification('L\'accès à la galerie photo est nécessaire pour ajouter une image.', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setNewImage(result.assets[0].uri);
    }
    setShowImagePicker(false);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showNotification('L\'accès à la caméra est nécessaire pour prendre une photo.', 'warning');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setNewImage(result.assets[0].uri);
    }
    setShowImagePicker(false);
  };

  // Fonction pour gérer le scan de code-barres
  const handleBarcodeScanned = (barcode: string) => {
    // Simuler une API de recherche de manga par code-barres
    const mockMangaData = [
      { barcode: '1234567890123', title: 'One Piece', author: 'Eiichiro Oda', volume: 105 },
      { barcode: '2345678901234', title: 'Naruto', author: 'Masashi Kishimoto', volume: 73 },
      { barcode: '3456789012345', title: 'Attack on Titan', author: 'Hajime Isayama', volume: 35 },
      { barcode: '4567890123456', title: 'Demon Slayer', author: 'Koyoharu Gotouge', volume: 24 },
    ];

    const mangaInfo = mockMangaData.find(manga => manga.barcode === barcode) || {
      title: 'Manga Inconnu',
      author: 'Auteur Inconnu',
      volume: 1
    };

    // Pré-remplir le formulaire avec les données scannées
    setNewTitle(mangaInfo.title);
    setNewAuthor(mangaInfo.author);
    setNewVolume(mangaInfo.volume.toString());
    setShowAddForm(true);
    
    showNotification(
      `Manga "${mangaInfo.title}" ajouté au formulaire ! Vérifiez les informations.`,
      'success'
    );
  };

  const addManga = () => {
    if (!newTitle.trim() || !newAuthor.trim() || !newVolume.trim()) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const newManga: Manga = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      author: newAuthor.trim(),
      volume: parseInt(newVolume),
      image: newImage || 'https://via.placeholder.com/100x150/FFE66D/FFFFFF?text=NEW',
      status: activeTab,
      condition: newCondition,
      description: newDescription.trim() || undefined,
    };

    setCollection([...collection, newManga]);
    setNewTitle('');
    setNewAuthor('');
    setNewVolume('');
    setNewImage('');
    setNewCondition('Bon');
    setNewDescription('');
    setShowAddForm(false);
    showNotification(`Manga ajouté à votre liste "${activeTab === 'offering' ? 'Je propose' : 'Je cherche'}" !`, 'success');
  };

  const toggleStatus = (id: string) => {
    setCollection(collection.map(manga =>
      manga.id === id
        ? { ...manga, status: manga.status === 'offering' ? 'seeking' : 'offering' }
        : manga
    ));
  };

  const deleteManga = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer ce manga ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setCollection(collection.filter(manga => manga.id !== id)),
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    inactiveTabText: {
      color: colors.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    mangaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    mangaCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    mangaImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.surface,
    },
    mangaTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    mangaAuthor: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    mangaVolume: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    deleteIconContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '600',
    },
    addForm: {
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      color: colors.text,
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
      backgroundColor: colors.textLight,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    formButtonText: {
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
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },

    photoSection: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    photoContainer: {
      width: 120,
      height: 160,
      borderRadius: 8,
      borderWidth: 2,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    photoPreview: {
      width: '100%',
      height: '100%',
      borderRadius: 6,
    },
    photoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoPlaceholderText: {
      fontSize: 12,
      marginTop: 8,
      textAlign: 'center',
    },
    conditionSection: {
      marginBottom: 20,
    },
    conditionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    conditionButton: {
      flex: 1,
      paddingVertical: 12,
      marginHorizontal: 4,
      borderWidth: 1,
      borderRadius: 8,
      alignItems: 'center',
    },
    conditionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    textArea: {
      height: 100,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
    },
    modalContent: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: 60,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 20,
    },
    imageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 12,
    },
    imageOptionText: {
      fontSize: 16,
      marginLeft: 12,
      fontWeight: '500',
    },
    cancelModalButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    cancelModalButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionIconButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Styles pour le modal de détails amélioré
    modalHeaderSection: {
      height: 300,
      position: 'relative',
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalHeaderOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    closeModalButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 40,
    },
    detailsImage: {
      width: 100,
      height: 150,
      borderRadius: 12,
      marginRight: 20,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    heroInfo: {
      flex: 1,
    },
    detailsTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 8,
      lineHeight: 28,
    },
    detailsAuthor: {
      fontSize: 16,
      color: '#FFFFFF',
      marginBottom: 6,
      opacity: 0.9,
    },
    detailsVolume: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '600',
      marginBottom: 12,
      opacity: 0.8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      alignSelf: 'flex-start',
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    modalBody: {
      flex: 1,
    },
    infoSection: {
      padding: 20,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    infoItem: {
      flex: 1,
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    conditionSection: {
      marginBottom: 24,
    },
    conditionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    conditionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    descriptionSection: {
      marginBottom: 24,
    },
    descriptionText: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },

    actionsSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 25,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 8,
    },
    deleteAction: {
      borderColor: colors.error,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📂 Ma Collection</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'offering' && styles.activeTab]}
            onPress={() => setActiveTab('offering')}
          >
            <Text style={[styles.tabText, activeTab === 'offering' ? styles.activeTabText : styles.inactiveTabText]}>
              📚 Je propose ({collection.filter(m => m.status === 'offering').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'seeking' && styles.activeTab]}
            onPress={() => setActiveTab('seeking')}
          >
            <Text style={[styles.tabText, activeTab === 'seeking' ? styles.activeTabText : styles.inactiveTabText]}>
              🔍 Je cherche ({collection.filter(m => m.status === 'seeking').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>



      <View style={styles.actionRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'offering' ? 'Mangas que je propose' : 'Mangas que je cherche'}
        </Text>
        <View style={styles.actionButtons}>
                              {/* Scanner temporairement désactivé */}
                    {/* <TouchableOpacity
                      style={[styles.actionIconButton, { backgroundColor: colors.secondary }]}
                      onPress={() => setShowBarcodeScanner(true)}
                    >
                      <Ionicons name="scan" size={20} color="#FFFFFF" />
                    </TouchableOpacity> */}
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(!showAddForm)}>
            <Text style={styles.addButtonText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Section Photo */}
            <View style={styles.photoSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Photo de couverture</Text>
              <TouchableOpacity
                style={[styles.photoContainer, { borderColor: colors.border }]}
                onPress={() => setShowImagePicker(true)}
              >
                {newImage ? (
                  <Image source={{ uri: newImage }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={40} color={colors.textLight} />
                    <Text style={[styles.photoPlaceholderText, { color: colors.textLight }]}>
                      Ajouter une photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Champs de base */}
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Titre du manga *"
              placeholderTextColor={colors.textLight}
              value={newTitle}
              onChangeText={(text) => {
                setNewTitle(text);
                if (titleDebounce) clearTimeout(titleDebounce);
                setShowSuggestions(true);
                const t = setTimeout(async () => {
                  if (text.trim().length < 2) { setTitleSuggestions([]); setLoadingSuggestions(false); return; }
                  try {
                    setLoadingSuggestions(true);
                    const results = await ExternalAPIService.searchMangaAniList(text.trim());
                    const titles = Array.from(new Set((results || []).map((m:any)=> m?.title?.romaji || m?.title?.english).filter(Boolean))).slice(0,8);
                    setTitleSuggestions(titles as string[]);
                  } catch (e) {
                    setTitleSuggestions([]);
                  } finally {
                    setLoadingSuggestions(false);
                  }
                }, 300);
                // @ts-ignore
                setTitleDebounce(t);
              }}
              onFocus={() => newTitle.length >= 2 && setShowSuggestions(true)}
            />
            {showSuggestions && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                {loadingSuggestions ? (
                  <View style={styles.suggestionRowLoading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.suggestionLoadingText, { color: colors.textSecondary }]}>Recherche…</Text>
                  </View>
                ) : (
                  (titleSuggestions.length === 0 ? (
                    <Text style={[styles.noSuggestionText, { color: colors.textLight }]}>Aucune suggestion</Text>
                  ) : (
                    titleSuggestions.map((t) => (
                      <TouchableOpacity key={t} style={styles.suggestionRow} onPress={() => { setNewTitle(t); setShowSuggestions(false); }}>
                        <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>{t}</Text>
                      </TouchableOpacity>
                    ))
                  ))
                )}
              </View>
            )}
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Numéro de volume *"
              placeholderTextColor={colors.textLight}
              value={newVolume}
              onChangeText={setNewVolume}
              keyboardType="numeric"
            />

            {/* Sélecteur d'état */}
            <View style={styles.conditionSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>État du manga</Text>
              <View style={styles.conditionButtons}>
                {(['Excellent', 'Bon', 'Correct'] as const).map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.conditionButton,
                      { borderColor: colors.border },
                      newCondition === condition && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setNewCondition(condition)}
                  >
                    <Text style={[
                      styles.conditionButtonText,
                      { color: newCondition === condition ? '#FFFFFF' : colors.text }
                    ]}>
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optionnel)..."
              placeholderTextColor={colors.textLight}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton, { backgroundColor: colors.textLight }]}
                onPress={() => {
                  setShowAddForm(false);
                  setNewTitle('');
                  setNewAuthor('');
                  setNewVolume('');
                  setNewImage('');
                  setNewCondition('Bon');
                  setNewDescription('');
                }}
              >
                <Text style={styles.formButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formButton, styles.saveButton, { backgroundColor: colors.primary }]} onPress={addManga}>
                <Text style={styles.formButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredCollection.length === 0 ? (
          <EmptyState
            icon={activeTab === 'offering' ? 'library' : 'search'}
            title={activeTab === 'offering' ? 'Aucun manga proposé' : 'Aucun manga recherché'}
            subtitle={activeTab === 'offering' 
              ? 'Commencez par ajouter les mangas que vous souhaitez échanger'
              : 'Ajoutez les mangas que vous recherchez à votre wishlist'
            }
            actionText="Ajouter mon premier manga"
            onAction={() => setShowAddForm(true)}
            showConfetti={activeTab === 'offering'}
          />
        ) : (
          <View style={styles.mangaGrid}>
            {filteredCollection.map((manga) => (
              <TouchableOpacity
                key={manga.id}
                style={styles.mangaCard}
                onPress={() => handleCardClick(manga)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: manga.image }} style={styles.mangaImage} />
                <Text style={styles.mangaTitle} numberOfLines={2}>{manga.title}</Text>
                {/* Auteur supprimé */}
                <Text style={styles.mangaVolume}>Volume {manga.volume}</Text>
                
                {/* Icône de suppression en haut à droite */}
                <TouchableOpacity
                  style={styles.deleteIconContainer}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteManga(manga.id);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal sélecteur d'image */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImagePicker}
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Ajouter une photo</Text>
            
            <TouchableOpacity
              style={[styles.imageOption, { borderColor: colors.border }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.imageOptionText, { color: colors.text }]}>Prendre une photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.imageOption, { borderColor: colors.border }]}
              onPress={pickImageFromLibrary}
            >
              <Ionicons name="images" size={24} color={colors.primary} />
              <Text style={[styles.imageOptionText, { color: colors.text }]}>Choisir depuis la galerie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelModalButton, { backgroundColor: colors.textLight }]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.cancelModalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scanner de code-barres */}
      {/* BarcodeScanner temporairement désactivé */}
      {/* <BarcodeScanner
        isVisible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScanSuccess={handleBarcodeScanned}
      /> */}

      {/* Modal de détails du manga amélioré */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedMangaForDetails !== null}
        onRequestClose={() => setSelectedMangaForDetails(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedMangaForDetails && (
              <>
                {/* Header avec image de fond */}
                <View style={styles.modalHeaderSection}>
                  <Image 
                    source={{ uri: selectedMangaForDetails.image }} 
                    style={styles.backgroundImage}
                    blurRadius={10}
                  />
                  <View style={styles.modalHeaderOverlay}>
                    <TouchableOpacity 
                      style={styles.closeModalButton}
                      onPress={() => setSelectedMangaForDetails(null)}
                    >
                      <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.heroContent}>
                      <Image 
                        source={{ uri: selectedMangaForDetails.image }} 
                        style={styles.detailsImage} 
                      />
                      <View style={styles.heroInfo}>
                        <Text style={styles.detailsTitle}>{selectedMangaForDetails.title}</Text>
                        <Text style={styles.detailsAuthor}>par {selectedMangaForDetails.author}</Text>
                        <Text style={styles.detailsVolume}>Volume {selectedMangaForDetails.volume}</Text>
                        
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: selectedMangaForDetails.status === 'offering' ? colors.primary : colors.secondary }
                        ]}>
                          <Text style={styles.statusText}>
                            {selectedMangaForDetails.status === 'offering' ? '📚 Je propose' : '🔍 Je cherche'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Informations détaillées */}
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>📅 Ajouté le</Text>
                        <Text style={styles.infoValue}>15 Mars 2024</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>⭐ Note</Text>
                        <Text style={styles.infoValue}>4.5/5</Text>
                      </View>
                    </View>

                    {selectedMangaForDetails.condition && (
                      <View style={styles.conditionSection}>
                        <Text style={styles.sectionTitle}>État du manga</Text>
                        <View style={[
                          styles.conditionBadge,
                          {
                            backgroundColor: selectedMangaForDetails.condition === 'Excellent' ? colors.success :
                                           selectedMangaForDetails.condition === 'Bon' ? colors.warning : colors.error
                          }
                        ]}>
                          <Text style={styles.conditionText}>
                            {selectedMangaForDetails.condition}
                          </Text>
                        </View>
                      </View>
                    )}

                    {selectedMangaForDetails.description && (
                      <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                          {selectedMangaForDetails.description}
                        </Text>
                      </View>
                    )}



                    {/* Actions */}
                    <View style={styles.actionsSection}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Modifier</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Partager</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={[styles.actionButton, styles.deleteAction]}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                        <Text style={[styles.actionButtonText, { color: colors.error }]}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CollectionPage;