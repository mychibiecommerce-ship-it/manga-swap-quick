import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService, { PushNotification, NotificationType } from '../services/NotificationService';

interface UsePushNotificationsReturn {
  // État
  isInitialized: boolean;
  notifications: PushNotification[];
  unreadCount: number;
  expoPushToken: string | null;
  
  // Actions
  sendNotification: (type: NotificationType, title: string, body: string, data?: any) => Promise<string>;
  scheduleNotification: (type: NotificationType, title: string, body: string, date: Date, data?: any) => Promise<string>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // Notifications prédéfinies pour Manga Swap
  notifyExchangeRequest: (fromUser: string, mangaTitle: string, data?: any) => Promise<string>;
  notifyExchangeAccepted: (fromUser: string, mangaTitle: string, data?: any) => Promise<string>;
  notifyNewMessage: (fromUser: string, message: string, data?: any) => Promise<string>;
  notifyMeetingReminder: (location: string, time: string, data?: any) => Promise<string>;
  notifyMangaAvailable: (mangaTitle: string, owner: string, data?: any) => Promise<string>;
  notifyLevelUp: (newLevel: number, rewards?: string[]) => Promise<string>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Initialisation
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      
      // Récupération de l'état initial
      const history = NotificationService.getNotificationHistory();
      const token = NotificationService.getExpoPushToken();
      const unread = NotificationService.getUnreadCount();
      
      setNotifications(history);
      setExpoPushToken(token);
      setUnreadCount(unread);
      setIsInitialized(true);
      
      console.log('✅ usePushNotifications initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation usePushNotifications:', error);
    }
  };

  // Mise à jour de l'état quand les notifications changent
  const updateNotificationState = useCallback(() => {
    const history = NotificationService.getNotificationHistory();
    const unread = NotificationService.getUnreadCount();
    
    setNotifications(history);
    setUnreadCount(unread);
  }, []);

  // Écouter les changements de notifications
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(() => {
      updateNotificationState();
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(() => {
      updateNotificationState();
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [updateNotificationState]);

  // Actions de base
  const sendNotification = useCallback(async (
    type: NotificationType,
    title: string,
    body: string,
    data?: any
  ): Promise<string> => {
    const id = await NotificationService.sendLocalNotification(type, title, body, data);
    updateNotificationState();
    return id;
  }, [updateNotificationState]);

  const scheduleNotification = useCallback(async (
    type: NotificationType,
    title: string,
    body: string,
    date: Date,
    data?: any
  ): Promise<string> => {
    const id = await NotificationService.scheduleNotification(type, title, body, date, data);
    return id;
  }, []);

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    await NotificationService.markAsRead(notificationId);
    updateNotificationState();
  }, [updateNotificationState]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    await NotificationService.markAllAsRead();
    updateNotificationState();
  }, [updateNotificationState]);

  const clearHistory = useCallback(async (): Promise<void> => {
    await NotificationService.clearHistory();
    updateNotificationState();
  }, [updateNotificationState]);

  // Notifications prédéfinies pour Manga Swap
  const notifyExchangeRequest = useCallback(async (
    fromUser: string,
    mangaTitle: string,
    data?: any
  ): Promise<string> => {
    return sendNotification(
      'exchange_request',
      `🔄 Demande d'échange`,
      `${fromUser} souhaite échanger "${mangaTitle}" avec vous`,
      { ...data, fromUser, mangaTitle, action: 'exchange_request' }
    );
  }, [sendNotification]);

  const notifyExchangeAccepted = useCallback(async (
    fromUser: string,
    mangaTitle: string,
    data?: any
  ): Promise<string> => {
    return sendNotification(
      'exchange_accepted',
      `✅ Échange accepté !`,
      `${fromUser} a accepté l'échange pour "${mangaTitle}"`,
      { ...data, fromUser, mangaTitle, action: 'exchange_accepted' }
    );
  }, [sendNotification]);

  const notifyNewMessage = useCallback(async (
    fromUser: string,
    message: string,
    data?: any
  ): Promise<string> => {
    const truncatedMessage = message.length > 50 
      ? message.substring(0, 50) + '...' 
      : message;
    
    return sendNotification(
      'new_message',
      `💬 ${fromUser}`,
      truncatedMessage,
      { ...data, fromUser, message, action: 'new_message' }
    );
  }, [sendNotification]);

  const notifyMeetingReminder = useCallback(async (
    location: string,
    time: string,
    data?: any
  ): Promise<string> => {
    return sendNotification(
      'meeting_reminder',
      `📅 Rappel de rendez-vous`,
      `N'oubliez pas votre rendez-vous à ${time} à ${location}`,
      { ...data, location, time, action: 'meeting_reminder' }
    );
  }, [sendNotification]);

  const notifyMangaAvailable = useCallback(async (
    mangaTitle: string,
    owner: string,
    data?: any
  ): Promise<string> => {
    return sendNotification(
      'manga_available',
      `📖 Manga disponible !`,
      `"${mangaTitle}" de votre wishlist est maintenant proposé par ${owner}`,
      { ...data, mangaTitle, owner, action: 'manga_available' }
    );
  }, [sendNotification]);

  const notifyLevelUp = useCallback(async (
    newLevel: number,
    rewards?: string[]
  ): Promise<string> => {
    const rewardText = rewards && rewards.length > 0 
      ? ` Récompenses: ${rewards.join(', ')}`
      : '';
    
    return sendNotification(
      'level_up',
      `🎉 Nouveau niveau !`,
      `Félicitations ! Vous êtes maintenant niveau ${newLevel} !${rewardText}`,
      { newLevel, rewards, action: 'level_up' }
    );
  }, [sendNotification]);

  return {
    // État
    isInitialized,
    notifications,
    unreadCount,
    expoPushToken,
    
    // Actions
    sendNotification,
    scheduleNotification,
    markAsRead,
    markAllAsRead,
    clearHistory,
    
    // Notifications prédéfinies
    notifyExchangeRequest,
    notifyExchangeAccepted,
    notifyNewMessage,
    notifyMeetingReminder,
    notifyMangaAvailable,
    notifyLevelUp,
  };
};