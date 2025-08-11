import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../context/ThemeContext';
import { mockMangas, mockCollection } from '../data/mockData';
import { RootStackParamList } from '../navigation/AppNavigator';

type ExchangeDetailRouteProp = RouteProp<RootStackParamList, 'ExchangeDetail'>;

const { width } = Dimensions.get('window');

const ExchangeDetailScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<ExchangeDetailRouteProp>();
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1: Demande, 2: Accord, 3: Rendez-vous, 4: Échange effectué
  const [message, setMessage] = useState('');
  const [selectedOwnManga, setSelectedOwnManga] = useState<string | null>(null);
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [meetingLocation, setMeetingLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const manga = mockMangas.find(m => m.id === route.params.mangaId);
  const myCollection = mockCollection.filter(c => c.status === 'offering');

  React.useEffect(() => {
    if (manga) {
      setMessage(`Bonjour, je suis intéressé par ${manga.title} !`);
    }
  }, [manga]);

  if (!manga) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Manga non trouvé</Text>
      </View>
    );
  }

  const handleExchangeRequest = () => {
    if (!selectedOwnManga) {
      Alert.alert('Erreur', 'Veuillez sélectionner un manga à proposer');
      return;
    }
    setStep(2);
    Alert.alert('Succès', 'Votre demande d\'échange a été envoyée !');
  };

  const handleAcceptExchange = () => {
    setStep(3);
    Alert.alert('Échange accepté', 'Organisez maintenant votre rendez-vous !');
  };

  const handleScheduleMeeting = () => {
    if (!meetingLocation.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer un lieu de rendez-vous');
      return;
    }
    setStep(4);
    Alert.alert('Rendez-vous programmé', 'Votre rendez-vous a été programmé avec succès !');
  };

  const handleCompleteExchange = () => {
    Alert.alert(
      'Échange terminé',
      'Félicitations ! Vous avez gagné 50 XP pour cet échange réussi ! 🎉',
      [
        {
          text: 'Super !',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getStepColor = (stepNumber: number) => {
    if (stepNumber <= step) return theme.primary;
    return theme.textLight;
  };

  const progressSteps = [
    { number: 1, title: 'Demande', icon: 'mail' },
    { number: 2, title: 'Accord', icon: 'handshake' },
    { number: 3, title: 'Rendez-vous', icon: 'calendar' },
    { number: 4, title: 'Échange effectué', icon: 'checkmark-circle' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    progressStep: {
      alignItems: 'center',
      flex: 1,
    },
    progressIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    progressTitle: {
      fontSize: 10,
      textAlign: 'center',
    },
    progressLine: {
      position: 'absolute',
      top: 20,
      height: 2,
      backgroundColor: theme.textLight,
      zIndex: -1,
    },
    mangaHeader: {
      padding: 16,
      alignItems: 'center',
      backgroundColor: theme.surface,
    },
    mangaImage: {
      width: 120,
      height: 180,
      borderRadius: 12,
      marginBottom: 12,
    },
    mangaTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
    },
    mangaAuthor: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 2,
    },
    mangaVolume: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8,
    },
    ownerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ownerText: {
      fontSize: 14,
      marginLeft: 4,
    },
    section: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowColor: theme.shadow,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    messageInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      minHeight: 80,
      textAlignVertical: 'top',
      fontSize: 16,
      color: theme.text,
    },
    collectionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    collectionItem: {
      width: (width - 80) / 3,
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    collectionItemSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryVariant + '20',
    },
    collectionImage: {
      width: 60,
      height: 90,
      borderRadius: 6,
      marginBottom: 4,
    },
    collectionTitle: {
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500',
    },
    exchangeSummary: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginVertical: 16,
    },
    exchangeItem: {
      alignItems: 'center',
      flex: 1,
    },
    exchangeImage: {
      width: 80,
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
    },
    exchangeTitle: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    exchangeArrow: {
      marginHorizontal: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
    },
    dateButtonText: {
      marginLeft: 8,
      fontSize: 16,
    },
    meetingInfo: {
      padding: 16,
      backgroundColor: theme.surfaceVariant,
      borderRadius: 8,
      marginBottom: 16,
    },
    meetingTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    meetingDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    meetingText: {
      marginLeft: 8,
      fontSize: 14,
    },
    actionButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    secondaryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    chatContainer: {
      maxHeight: 200,
      backgroundColor: theme.surfaceVariant,
      borderRadius: 8,
      padding: 12,
    },
    chatMessage: {
      padding: 8,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: theme.card,
    },
    chatSender: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    chatText: {
      fontSize: 14,
    },
    completedBadge: {
      backgroundColor: theme.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'center',
      marginBottom: 16,
    },
    completedText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        {progressSteps.map((progressStep, index) => (
          <View key={progressStep.number} style={styles.progressStep}>
            <Animatable.View
              animation={progressStep.number <= step ? "bounceIn" : undefined}
              style={[
                styles.progressIcon,
                { backgroundColor: getStepColor(progressStep.number) }
              ]}
            >
              <Ionicons
                name={progressStep.icon as any}
                size={20}
                color="#FFFFFF"
              />
            </Animatable.View>
            <Text style={[styles.progressTitle, { color: getStepColor(progressStep.number) }]}>
              {progressStep.title}
            </Text>
            {index < progressSteps.length - 1 && (
              <View style={[
                styles.progressLine,
                {
                  left: '50%',
                  right: '-50%',
                  backgroundColor: step > progressStep.number ? theme.primary : theme.textLight,
                }
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        {/* En-tête du manga */}
        <Animatable.View animation="fadeInDown" style={styles.mangaHeader}>
          <Image source={{ uri: manga.imageUri }} style={styles.mangaImage} />
          <Text style={[styles.mangaTitle, { color: theme.text }]}>{manga.title}</Text>
          <Text style={[styles.mangaAuthor, { color: theme.textSecondary }]}>{manga.author}</Text>
          <Text style={[styles.mangaVolume, { color: theme.textSecondary }]}>Volume {manga.volume}</Text>
          <View style={styles.ownerInfo}>
            <Ionicons name="location" size={16} color={theme.textLight} />
            <Text style={[styles.ownerText, { color: theme.textLight }]}>
              {manga.ownerPseudo} • {manga.ownerCity}
            </Text>
          </View>
        </Animatable.View>

        {step === 4 && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>🎉 Échange réalisé avec succès !</Text>
          </View>
        )}

        {/* Zone de message */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Message</Text>
          <TextInput
            style={[styles.messageInput, { backgroundColor: theme.surfaceVariant }]}
            multiline
            placeholder="Votre message..."
            placeholderTextColor={theme.textLight}
            value={message}
            onChangeText={setMessage}
            editable={step === 1}
          />
        </Animatable.View>

        {/* Sélection de manga à proposer */}
        {step >= 1 && (
          <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Manga que je propose
            </Text>
            <View style={styles.collectionGrid}>
              {myCollection.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.collectionItem,
                    selectedOwnManga === item.id && styles.collectionItemSelected,
                  ]}
                  onPress={() => setSelectedOwnManga(item.id)}
                  disabled={step > 1}
                >
                  <Image
                    source={{ uri: item.manga.imageUri }}
                    style={styles.collectionImage}
                  />
                  <Text
                    style={[styles.collectionTitle, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {item.manga.title} #{item.manga.volume}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Récapitulatif de l'échange */}
        {step >= 2 && selectedOwnManga && (
          <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Récapitulatif de l'échange
            </Text>
            <View style={styles.exchangeSummary}>
              <View style={styles.exchangeItem}>
                <Image source={{ uri: manga.imageUri }} style={styles.exchangeImage} />
                <Text style={[styles.exchangeTitle, { color: theme.text }]}>
                  Je reçois
                </Text>
              </View>
              <View style={styles.exchangeArrow}>
                <Ionicons name="swap-horizontal" size={32} color={theme.primary} />
              </View>
              <View style={styles.exchangeItem}>
                <Image
                  source={{ uri: myCollection.find(c => c.id === selectedOwnManga)?.manga.imageUri }}
                  style={styles.exchangeImage}
                />
                <Text style={[styles.exchangeTitle, { color: theme.text }]}>
                  Je donne
                </Text>
              </View>
            </View>
          </Animatable.View>
        )}

        {/* Organisation du rendez-vous */}
        {step >= 3 && (
          <Animatable.View animation="fadeInUp" delay={800} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Organisation du rendez-vous
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Lieu de rendez-vous</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Café près de la gare..."
                placeholderTextColor={theme.textLight}
                value={meetingLocation}
                onChangeText={setMeetingLocation}
                editable={step === 3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Date et heure</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={step > 3}
              >
                <Ionicons name="calendar" size={20} color={theme.primary} />
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  {meetingDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={meetingDate}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setMeetingDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </Animatable.View>
        )}

        {/* Informations du rendez-vous confirmé */}
        {step >= 4 && (
          <Animatable.View animation="fadeInUp" delay={1000} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Rendez-vous confirmé
            </Text>
            <View style={styles.meetingInfo}>
              <Text style={[styles.meetingTitle, { color: theme.text }]}>
                Détails du rendez-vous
              </Text>
              <View style={styles.meetingDetail}>
                <Ionicons name="location" size={16} color={theme.primary} />
                <Text style={[styles.meetingText, { color: theme.textSecondary }]}>
                  {meetingLocation}
                </Text>
              </View>
              <View style={styles.meetingDetail}>
                <Ionicons name="time" size={16} color={theme.primary} />
                <Text style={[styles.meetingText, { color: theme.textSecondary }]}>
                  {meetingDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </Animatable.View>
        )}

        {/* Boutons d'action */}
        <View style={{ padding: 16 }}>
          {step === 1 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExchangeRequest}
            >
              <Text style={styles.actionButtonText}>Proposer un échange</Text>
            </TouchableOpacity>
          )}

          {step === 2 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAcceptExchange}
            >
              <Text style={styles.actionButtonText}>Accepter l'échange</Text>
            </TouchableOpacity>
          )}

          {step === 3 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleScheduleMeeting}
            >
              <Text style={styles.actionButtonText}>Programmer le rendez-vous</Text>
            </TouchableOpacity>
          )}

          {step === 4 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={handleCompleteExchange}
            >
              <Text style={styles.actionButtonText}>Échange effectué ✓</Text>
            </TouchableOpacity>
          )}

          {step < 4 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('ChatDetail', { exchangeId: 'exchange1' })}
            >
              <Text style={styles.secondaryButtonText}>💬 Envoyer un message</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExchangeDetailScreen;