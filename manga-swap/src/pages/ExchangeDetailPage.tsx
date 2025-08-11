import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSimpleTheme } from '../context/SimpleTheme';
import { Manga, Exchange } from '../types';
import { mockMangas, mockMyMangas, mockRequesterMangas } from '../data/mockData';

interface ExchangeDetailPageProps {
  mangaId: string;
  onBack: () => void;
  userRole?: 'requester' | 'owner';
}

const ExchangeDetailPage: React.FC<ExchangeDetailPageProps> = ({
  mangaId,
  onBack,
  userRole = 'requester',
}) => {
  const { colors } = useSimpleTheme();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('Bonjour ! Je serais intéressé(e) par un échange avec ce manga. Êtes-vous disponible ?');
  const [selectedMangaToOffer, setSelectedMangaToOffer] = useState<string | null>(null);
  const [selectedMangaFromRequester, setSelectedMangaFromRequester] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [requesterConfirmed, setRequesterConfirmed] = useState(false);

  const manga = mockMangas.find(m => m.id === mangaId) || mockMangas[0];
  const myMangas = userRole === 'requester' ? mockMyMangas : mockRequesterMangas;

  const progressSteps = [
    { number: 1, title: 'Demande', icon: '📋' },
    { number: 2, title: 'Accord', icon: '🤝' },
    { number: 3, title: 'RDV', icon: '📅' },
    { number: 4, title: 'Rencontre', icon: '👥' },
    { number: 5, title: 'Confirmation', icon: '✅' },
    { number: 6, title: 'Terminé', icon: '🎉' },
  ];

  const getStepColor = (stepNumber: number) => {
    if (stepNumber < step) return colors.success;
    if (stepNumber === step) return colors.primary;
    return colors.textLight;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    progressStep: {
      alignItems: 'center',
      flex: 1,
    },
    progressIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    progressTitle: {
      fontSize: 10,
      textAlign: 'center',
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    mangaHeader: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    mangaImage: {
      width: 120,
      height: 180,
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: colors.surface,
    },
    mangaTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    mangaAuthor: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    mangaVolume: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
    },
    ownerInfo: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
    },
    completedBadge: {
      backgroundColor: colors.success + '20',
      padding: 16,
      margin: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    completedText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.success,
    },
    section: {
      backgroundColor: colors.card,
      margin: 16,
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    messageInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      minHeight: 80,
      fontSize: 16,
      color: colors.text,
      textAlignVertical: 'top',
    },
    myMangasGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    myMangaItem: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 8,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedMangaItem: {
      borderColor: colors.primary,
    },
    myMangaImage: {
      width: '100%',
      height: 100,
      borderRadius: 6,
      marginBottom: 8,
    },
    myMangaTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'échange</Text>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        {progressSteps.map((progressStep) => (
          <View key={progressStep.number} style={styles.progressStep}>
            <Text style={[styles.progressIcon, { color: getStepColor(progressStep.number) }]}>
              {progressStep.icon}
            </Text>
            <Text style={[styles.progressTitle, { color: getStepColor(progressStep.number) }]}>
              {progressStep.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content}>
        {/* Header du manga */}
        <View style={styles.mangaHeader}>
          <Image source={{ uri: manga.imageUri }} style={styles.mangaImage} />
          <Text style={styles.mangaTitle}>{manga.title}</Text>
          <Text style={styles.mangaAuthor}>{manga.author}</Text>
          <Text style={styles.mangaVolume}>Volume {manga.volume}</Text>
          <Text style={styles.ownerInfo}>
            📍 {manga.ownerPseudo} • {manga.ownerCity}
          </Text>
        </View>

        {step === 6 && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>🎉 Échange réalisé avec succès !</Text>
          </View>
        )}

        {/* Contenu des étapes */}
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message pour le propriétaire</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Écrivez votre message..."
              placeholderTextColor={colors.textLight}
              multiline
            />
            
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Mangas que je propose</Text>
            <View style={styles.myMangasGrid}>
              {myMangas.map((manga) => (
                <TouchableOpacity
                  key={manga.id}
                  style={[
                    styles.myMangaItem,
                    selectedMangaToOffer === manga.id && styles.selectedMangaItem
                  ]}
                  onPress={() => setSelectedMangaToOffer(manga.id)}
                >
                  <Image source={{ uri: manga.imageUri }} style={styles.myMangaImage} />
                  <Text style={styles.myMangaTitle}>{manga.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedMangaToOffer && (
              <TouchableOpacity style={styles.actionButton} onPress={() => setStep(2)}>
                <Text style={styles.actionButtonText}>Envoyer la demande</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attente de réponse</Text>
            <Text style={{ color: colors.text, marginBottom: 16 }}>
              Votre demande a été envoyée ! En attente de la réponse du propriétaire...
            </Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setStep(3)}>
              <Text style={styles.actionButtonText}>Simuler l'accord</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organisation du rendez-vous</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setStep(4)}>
              <Text style={styles.actionButtonText}>Confirmer le rendez-vous</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rencontre en cours</Text>
            <Text style={{ color: colors.text, marginBottom: 16 }}>
              Rendez-vous prévu aujourd'hui. Bonne rencontre !
            </Text>

            <TouchableOpacity style={styles.actionButton} onPress={() => setStep(5)}>
              <Text style={styles.actionButtonText}>J'ai rencontré la personne</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 5 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmation de l'échange</Text>
            <Text style={{ color: colors.text, marginBottom: 16 }}>
              Confirmez que l'échange s'est bien déroulé pour gagner vos points d'expérience !
            </Text>

            <TouchableOpacity style={styles.actionButton} onPress={() => setStep(6)}>
              <Text style={styles.actionButtonText}>Confirmer l'échange</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExchangeDetailPage;