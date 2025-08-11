import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';
import NotificationCenter from './NotificationCenter';

const mockCurrentUser = {
  name: 'Alexandre Martin',
  username: 'AlexManga',
  avatar: 'https://picsum.photos/200/200?random=user',
  level: 8,
  xp: 1250,
};

const mockNotifications = [
  {
    id: '1',
    type: 'exchange_request',
    title: 'Nouvelle demande d\'échange',
    message: 'Marie souhaite échanger avec vous',
    time: '2min',
    read: false,
    icon: '🔄',
  },
  {
    id: '2',
    type: 'exchange_accepted',
    title: 'Échange accepté',
    message: 'Lucas a accepté votre demande d\'échange',
    time: '1h',
    read: false,
    icon: '✅',
  },
  {
    id: '3',
    type: 'system',
    title: 'Nouveau badge débloqué',
    message: 'Vous avez obtenu le badge "Manga Lover"',
    time: '3h',
    read: true,
    icon: '🏆',
  },
  {
    id: '4',
    type: 'chat',
    title: 'Nouveau message',
    message: 'Sophie: "Parfait pour l\'échange !"',
    time: '5h',
    read: true,
    icon: '💬',
  },
];

interface GlobalHeaderProps {
  onNavigateToProfile?: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onNavigateToProfile }) => {
  const { colors } = useSimpleTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Utilisation conditionnelle du hook pour éviter l'erreur d'initialisation
  let unreadCount = 0;
  try {
    const notifications = usePushNotifications();
    unreadCount = notifications.unreadCount;
  } catch (error) {
    // Hook pas encore initialisé, utiliser la valeur par défaut
    console.log('Hook notifications pas encore prêt');
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getLevelIcon = (level: number) => {
    if (level >= 20) return '👑';
    if (level >= 15) return '🥇';
    if (level >= 10) return '🥈';
    if (level >= 5) return '🥉';
    return '🏅';
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return '#FFD700';
    if (level >= 15) return '#FF6B6B';
    if (level >= 10) return '#4ECDC4';
    if (level >= 5) return '#45B7D1';
    return '#95A5A6';
  };

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoImage: {
      width: '100%',
      height: 60,
      marginRight: 15,
      flex: 1,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    iconButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 8,
    },
    initialsContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initialsText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 4,
    },
    levelIcon: {
      fontSize: 12,
      marginRight: 2,
    },
    levelText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    // Modal des notifications
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    notificationsList: {
      maxHeight: 400,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.background,
      borderRadius: 15,
      padding: 15,
      marginBottom: 10,
    },
    unreadNotification: {
      backgroundColor: colors.primary + '10',
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    notificationIcon: {
      fontSize: 24,
      marginRight: 12,
      marginTop: 2,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    notificationMessage: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    notificationTime: {
      fontSize: 11,
      color: colors.textLight,
      marginTop: 5,
    },
    emptyNotifications: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 10,
    },
  });

  return (
    <>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Image 
            source={require('../../assets/images/manga-swap-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.rightSection}>
          {/* Bouton Notifications */}
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications" size={20} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profil utilisateur */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={onNavigateToProfile}
            activeOpacity={0.7}
          >
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{getInitials(mockCurrentUser.name)}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(mockCurrentUser.level) }]}>
              <Text style={styles.levelIcon}>{getLevelIcon(mockCurrentUser.level)}</Text>
              <Text style={styles.levelText}>{mockCurrentUser.level}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Centre de notifications */}
      <NotificationCenter
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigate={(screen, params) => {
          // Ici vous pouvez ajouter la logique de navigation
          console.log('Navigation:', screen, params);
          setShowNotifications(false);
        }}
      />
    </>
  );
};

export default GlobalHeader;