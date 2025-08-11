import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NotificationDemo: React.FC = () => {
  const { colors } = useSimpleTheme();
  const {
    notifyExchangeRequest,
    notifyExchangeAccepted,
    notifyNewMessage,
    notifyMeetingReminder,
    notifyMangaAvailable,
    notifyLevelUp,
    isInitialized,
    unreadCount,
  } = usePushNotifications();

  const demoNotifications = [
    {
      title: 'Demande d\'échange',
      description: 'Nouvelle demande pour votre manga',
      icon: '🔄',
      color: '#FF9500',
      action: () => notifyExchangeRequest(
        'Marie Dubois',
        'One Piece Vol. 1',
        { mangaId: '1', exchangeId: 'ex_123' }
      ),
    },
    {
      title: 'Échange accepté',
      description: 'Votre proposition a été acceptée',
      icon: '✅',
      color: '#34C759',
      action: () => notifyExchangeAccepted(
        'Alex Chen',
        'Naruto Vol. 5',
        { mangaId: '2', exchangeId: 'ex_124' }
      ),
    },
    {
      title: 'Nouveau message',
      description: 'Message dans une conversation',
      icon: '💬',
      color: '#007AFF',
      action: () => notifyNewMessage(
        'Sophie Martin',
        'Salut ! On peut se voir demain à 15h pour l\'échange ?',
        { conversationId: 'conv_456' }
      ),
    },
    {
      title: 'Rappel RDV',
      description: 'Rendez-vous dans 1 heure',
      icon: '📅',
      color: '#FF3B30',
      action: () => notifyMeetingReminder(
        'Café Central, Place Bellecour',
        '15h00',
        { exchangeId: 'ex_125', location: 'Café Central' }
      ),
    },
    {
      title: 'Manga disponible',
      description: 'Un manga de votre wishlist',
      icon: '📖',
      color: '#32D74B',
      action: () => notifyMangaAvailable(
        'Demon Slayer Vol. 3',
        'Lucas Dupont',
        { mangaId: '4', ownerId: 'user_789' }
      ),
    },
    {
      title: 'Nouveau niveau',
      description: 'Montée de niveau avec récompenses',
      icon: '🎉',
      color: '#FFD60A',
      action: () => notifyLevelUp(
        10,
        ['Badge Échangeur Expert', '50 XP Bonus', 'Avatar Doré']
      ),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      margin: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    demoButton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    buttonTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    buttonDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    disabledButton: {
      opacity: 0.5,
    },
    footer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 12,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⏳</Text>
          <Text style={styles.title}>Initialisation des notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔔</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>Centre de Notifications</Text>
          <Text style={styles.subtitle}>Testez les différents types de notifications</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{unreadCount} non lues</Text>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        {demoNotifications.map((notification, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.demoButton,
              { borderColor: notification.color + '30' }
            ]}
            onPress={notification.action}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>{notification.icon}</Text>
            <Text style={styles.buttonTitle}>{notification.title}</Text>
            <Text style={styles.buttonDescription}>{notification.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Cliquez sur les boutons ci-dessus pour tester les notifications push.{'\n'}
          Les notifications apparaîtront dans le centre de notifications accessible via l'icône 🔔 en haut à droite.
        </Text>
      </View>
    </View>
  );
};

export default NotificationDemo;