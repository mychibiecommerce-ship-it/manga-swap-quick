import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { PushNotification, NotificationType } from '../services/NotificationService';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const { colors } = useSimpleTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearHistory,
  } = usePushNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'exchanges' | 'messages'>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulation d'un rafraîchissement
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'exchange_request': return '🔄';
      case 'exchange_accepted': return '✅';
      case 'exchange_declined': return '❌';
      case 'meeting_reminder': return '📅';
      case 'meeting_confirmed': return '✅';
      case 'new_message': return '💬';
      case 'manga_available': return '📖';
      case 'level_up': return '🎉';
      case 'reward_unlocked': return '🎁';
      case 'system': return '⚙️';
      case 'marketing': return '📢';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'exchange_request': return colors.warning;
      case 'exchange_accepted': return colors.success;
      case 'exchange_declined': return colors.error;
      case 'meeting_reminder': return colors.primary;
      case 'new_message': return colors.secondary;
      case 'manga_available': return colors.success;
      case 'level_up': return '#FFD700';
      case 'reward_unlocked': return '#FF6B9D';
      default: return colors.textSecondary;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleNotificationPress = async (notification: PushNotification) => {
    // Marquer comme lue
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigation selon le type
    const { data } = notification;
    
    switch (notification.type) {
      case 'exchange_request':
      case 'exchange_accepted':
        onNavigate?.('exchange', { exchangeId: data?.exchangeId });
        break;
      case 'new_message':
        onNavigate?.('chat', { conversationId: data?.conversationId });
        break;
      case 'manga_available':
        onNavigate?.('swap', { mangaId: data?.mangaId });
        break;
      case 'level_up':
      case 'reward_unlocked':
        onNavigate?.('profile');
        break;
      case 'meeting_reminder':
        onNavigate?.('exchange', { exchangeId: data?.exchangeId, tab: 'meeting' });
        break;
    }
    
    onClose();
  };

  const getFilteredNotifications = (): PushNotification[] => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'exchanges':
        return notifications.filter(n => 
          ['exchange_request', 'exchange_accepted', 'exchange_declined', 'meeting_reminder'].includes(n.type)
        );
      case 'messages':
        return notifications.filter(n => n.type === 'new_message');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const renderNotification = (notification: PushNotification, index: number) => {
    const isUnread = !notification.isRead;
    const icon = getNotificationIcon(notification.type);
    const accentColor = getNotificationColor(notification.type);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          { backgroundColor: colors.surface },
          isUnread && { backgroundColor: colors.background, borderLeftColor: accentColor }
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
              <Text style={styles.notificationIcon}>{icon}</Text>
            </View>
            
            <View style={styles.notificationMeta}>
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {formatTimeAgo(notification.timestamp)}
              </Text>
              {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>
          </View>

          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          
          <Text style={[styles.notificationBody, { color: colors.textSecondary }]} numberOfLines={2}>
            {notification.body}
          </Text>

          {notification.imageUrl && (
            <Image source={{ uri: notification.imageUrl }} style={styles.notificationImage} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filterType: typeof filter, label: string, count?: number) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: colors.background },
          isActive && { backgroundColor: colors.primary }
        ]}
        onPress={() => setFilter(filterType)}
      >
        <Text style={[
          styles.filterButtonText,
          { color: colors.textSecondary },
          isActive && { color: colors.surface }
        ]}>
          {label}
          {count !== undefined && count > 0 && ` (${count})`}
        </Text>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      paddingTop: 8,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.textLight,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonText: {
      fontSize: 12,
      fontWeight: '600',
    },
    notificationsList: {
      flex: 1,
    },
    notificationItem: {
      marginHorizontal: 20,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationIcon: {
      fontSize: 16,
    },
    notificationMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    notificationBody: {
      fontSize: 13,
      lineHeight: 18,
    },
    notificationImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginTop: 12,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Text>
            
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity style={styles.headerButton} onPress={markAllAsRead}>
                  <Ionicons name="checkmark-done" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.headerButton} onPress={clearHistory}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterContainer}
          >
            {renderFilterButton('all', 'Toutes', notifications.length)}
            {renderFilterButton('unread', 'Non lues', unreadCount)}
            {renderFilterButton('exchanges', 'Échanges')}
            {renderFilterButton('messages', 'Messages')}
          </ScrollView>

          <ScrollView
            style={styles.notificationsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(renderNotification)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptySubtitle}>
                  Vos notifications apparaîtront ici quand vous recevrez des demandes d'échanges, messages, ou autres événements.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationCenter;