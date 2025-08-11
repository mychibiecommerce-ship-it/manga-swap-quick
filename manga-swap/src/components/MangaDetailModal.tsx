import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSimpleTheme } from '../context/SimpleTheme';

interface Manga {
  id: string;
  title: string;
  author: string;
  volume: number;
  image: string;
  owner: string;
  city: string;
  condition: string;
  description: string;
}

interface MangaDetailModalProps {
  manga: Manga | null;
  isVisible: boolean;
  onClose: () => void;
  onExchange: () => void;
}

const MangaDetailModal: React.FC<MangaDetailModalProps> = ({ 
  manga, 
  isVisible, 
  onClose, 
  onExchange 
}) => {
  const { colors } = useSimpleTheme();

  if (!manga) return null;

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return colors.success;
      case 'Bon': return colors.secondary;
      case 'Correct': return '#FFA500';
      case 'Usé': return colors.error;
      default: return colors.textLight;
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Excellent': return '⭐';
      case 'Bon': return '👍';
      case 'Correct': return '👌';
      case 'Usé': return '📖';
      default: return '❓';
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 24,
      color: colors.textLight,
    },
    scrollContent: {
      padding: 20,
    },
    mangaImageContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    mangaImage: {
      width: 150,
      height: 225,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginBottom: 12,
    },
    availabilityBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    availabilityText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    mangaInfo: {
      marginBottom: 20,
    },
    mangaTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    mangaAuthor: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 6,
    },
    mangaVolume: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    infoSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoIcon: {
      fontSize: 16,
      marginRight: 8,
      width: 20,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    conditionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    conditionIcon: {
      fontSize: 16,
      marginRight: 8,
      width: 20,
    },
    conditionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    ownerSection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ownerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ownerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    ownerAvatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    ownerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    ownerLocation: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalActions: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    exchangeButton: {
      flex: 2,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    exchangeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détails du manga</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Contenu scrollable */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Image et disponibilité */}
            <View style={styles.mangaImageContainer}>
              <Image source={{ uri: manga.image }} style={styles.mangaImage} />
              <View style={styles.availabilityBadge}>
                <Text style={styles.availabilityText}>✓ Disponible</Text>
              </View>
            </View>

            {/* Informations du manga */}
            <View style={styles.mangaInfo}>
              <Text style={styles.mangaTitle}>{manga.title}</Text>
              <Text style={styles.mangaAuthor}>par {manga.author}</Text>
              <Text style={styles.mangaVolume}>Volume {manga.volume}</Text>
            </View>

            {/* Détails */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>📖 Détails</Text>
              
              <View style={styles.conditionRow}>
                <Text style={styles.conditionIcon}>
                  {getConditionIcon(manga.condition)}
                </Text>
                <Text style={[styles.conditionText, { color: getConditionColor(manga.condition) }]}>
                  État : {manga.condition}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>Localisation : {manga.city}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📝</Text>
                <Text style={styles.infoText}>Type : Échange gratuit</Text>
              </View>

              {manga.description && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 8 }]}>
                    💬 Description
                  </Text>
                  <Text style={styles.description}>"{manga.description}"</Text>
                </>
              )}
            </View>

            {/* Propriétaire */}
            <View style={styles.ownerSection}>
              <Text style={styles.sectionTitle}>👤 Propriétaire</Text>
              
              <View style={styles.ownerHeader}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerAvatarText}>
                    {manga.owner.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.ownerName}>{manga.owner}</Text>
                  <Text style={styles.ownerLocation}>📍 {manga.city}</Text>
                </View>
              </View>

              {/* Stats fictives du propriétaire */}
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Échanges</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.8</Text>
                  <Text style={styles.statLabel}>Note</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>3</Text>
                  <Text style={styles.statLabel}>Niv.</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exchangeButton} onPress={onExchange}>
              <Text style={styles.exchangeButtonText}>Demander un échange</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MangaDetailModal;