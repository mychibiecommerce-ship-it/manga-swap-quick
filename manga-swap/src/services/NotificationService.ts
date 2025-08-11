import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types de notifications
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  imageUrl?: string;
  actionButtons?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  action: 'open' | 'reply' | 'accept' | 'decline' | 'view';
  data?: any;
}

export type NotificationType = 
  | 'exchange_request'     // Demande d'échange reçue
  | 'exchange_accepted'    // Échange accepté
  | 'exchange_declined'    // Échange refusé
  | 'meeting_reminder'     // Rappel de rendez-vous
  | 'meeting_confirmed'    // RDV confirmé par l'autre partie
  | 'new_message'          // Nouveau message dans le chat
  | 'manga_available'      // Manga de la wishlist disponible
  | 'level_up'             // Nouveau niveau atteint
  | 'reward_unlocked'      // Récompense débloquée
  | 'system'               // Notification système
  | 'marketing';           // Notification marketing

// Configuration des notifications par type
const NOTIFICATION_CONFIG = {
  exchange_request: {
    sound: 'exchange_sound.wav',
    vibrationPattern: [0, 250, 250, 250],
    priority: 'high' as const,
    categoryId: 'EXCHANGE_CATEGORY',
    actions: [
      { id: 'accept', title: '✅ Accepter', action: 'accept' as const },
      { id: 'view', title: '👀 Voir détails', action: 'view' as const },
      { id: 'decline', title: '❌ Refuser', action: 'decline' as const }
    ]
  },
  exchange_accepted: {
    sound: 'success_sound.wav',
    vibrationPattern: [0, 100, 100, 100],
    priority: 'high' as const,
    categoryId: 'EXCHANGE_CATEGORY',
    actions: [
      { id: 'chat', title: '💬 Discuter', action: 'open' as const },
      { id: 'view', title: '📋 Voir échange', action: 'view' as const }
    ]
  },
  meeting_reminder: {
    sound: 'reminder_sound.wav',
    vibrationPattern: [0, 300, 100, 300],
    priority: 'urgent' as const,
    categoryId: 'MEETING_CATEGORY',
    actions: [
      { id: 'confirm', title: '✅ Je serai là', action: 'accept' as const },
      { id: 'reschedule', title: '📅 Reporter', action: 'open' as const }
    ]
  },
  new_message: {
    sound: 'message_sound.wav',
    vibrationPattern: [0, 100],
    priority: 'normal' as const,
    categoryId: 'MESSAGE_CATEGORY',
    actions: [
      { id: 'reply', title: '💬 Répondre', action: 'reply' as const },
      { id: 'view', title: '👀 Voir', action: 'view' as const }
    ]
  },
  manga_available: {
    sound: 'notification_sound.wav',
    vibrationPattern: [0, 200, 100, 200],
    priority: 'normal' as const,
    categoryId: 'WISHLIST_CATEGORY',
    actions: [
      { id: 'view', title: '📖 Voir manga', action: 'view' as const },
      { id: 'contact', title: '📞 Contacter', action: 'open' as const }
    ]
  },
  level_up: {
    sound: 'level_up_sound.wav',
    vibrationPattern: [0, 100, 50, 100, 50, 100],
    priority: 'normal' as const,
    categoryId: 'GAMIFICATION_CATEGORY',
    actions: [
      { id: 'view_rewards', title: '🎁 Voir récompenses', action: 'view' as const }
    ]
  }
};

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private expoPushToken: string | null = null;
  private notificationHistory: PushNotification[] = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialisation du service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configuration des handlers de notifications
      await this.setupNotificationHandlers();
      
      // Configuration des catégories d'actions
      await this.setupNotificationCategories();
      
      // Demande des permissions
      await this.registerForPushNotifications();
      
      // Chargement de l'historique
      await this.loadNotificationHistory();
      
      this.isInitialized = true;
      console.log('📱 NotificationService initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation NotificationService:', error);
    }
  }

  // Configuration des handlers
  private async setupNotificationHandlers(): Promise<void> {
    // Handler pour les notifications reçues en foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const notificationType = notification.request.content.data?.type as NotificationType;
        const config = NOTIFICATION_CONFIG[notificationType];
        
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: config?.priority === 'urgent' 
            ? Notifications.AndroidNotificationPriority.HIGH 
            : Notifications.AndroidNotificationPriority.DEFAULT,
        };
      },
    });

    // Handler pour les actions sur notifications
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse.bind(this));
    
    // Handler pour les notifications reçues
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived.bind(this));
  }

  // Configuration des catégories d'actions
  private async setupNotificationCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('EXCHANGE_CATEGORY', [
        {
          identifier: 'accept',
          buttonTitle: '✅ Accepter',
          options: { opensAppToForeground: true }
        },
        {
          identifier: 'decline',
          buttonTitle: '❌ Refuser',
          options: { opensAppToForeground: false }
        },
        {
          identifier: 'view',
          buttonTitle: '👀 Voir',
          options: { opensAppToForeground: true }
        }
      ]);

      await Notifications.setNotificationCategoryAsync('MESSAGE_CATEGORY', [
        {
          identifier: 'reply',
          buttonTitle: '💬 Répondre',
          options: { 
            opensAppToForeground: false,
            isDestructive: false,
            isAuthenticationRequired: false
          },
          textInput: {
            submitButtonTitle: 'Envoyer',
            placeholder: 'Votre réponse...'
          }
        }
      ]);
    }
  }

  // Enregistrement pour les push notifications
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('⚠️ Les notifications push ne fonctionnent que sur un appareil physique');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permission de notification refusée');
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      // Sauvegarder le token localement
      await AsyncStorage.setItem('expoPushToken', token);
      
      console.log('🔑 Token push obtenu:', token);
      return token;
    } catch (error) {
      console.error('❌ Erreur obtention token push:', error);
      return null;
    }
  }

  // Handler pour les notifications reçues
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const pushNotification: PushNotification = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data,
      type: notification.request.content.data?.type || 'system',
      timestamp: new Date(),
      isRead: false,
      priority: 'normal',
      category: notification.request.content.categoryIdentifier,
    };

    this.addToHistory(pushNotification);
    
    // Émission d'un événement pour l'interface
    this.emitNotificationEvent('received', pushNotification);
  }

  // Handler pour les réponses aux notifications
  private async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const { notification, actionIdentifier } = response;
    const notificationData = notification.request.content.data;
    
    console.log('🔔 Action notification:', actionIdentifier, notificationData);

    // Marquer comme lue
    await this.markAsRead(notification.request.identifier);

    // Traitement selon l'action
    switch (actionIdentifier) {
      case 'accept':
        this.handleAcceptAction(notificationData);
        break;
      case 'decline':
        this.handleDeclineAction(notificationData);
        break;
      case 'reply':
        // @ts-ignore - userText existe sur iOS
        this.handleReplyAction(notificationData, response.userText);
        break;
      case 'view':
      case 'open':
      default:
        this.handleOpenAction(notificationData);
        break;
    }
  }

  // Actions spécifiques
  private handleAcceptAction(data: any): void {
    console.log('✅ Échange accepté via notification:', data);
    // Logique pour accepter l'échange
    this.emitNotificationEvent('action', { type: 'accept', data });
  }

  private handleDeclineAction(data: any): void {
    console.log('❌ Échange refusé via notification:', data);
    // Logique pour refuser l'échange
    this.emitNotificationEvent('action', { type: 'decline', data });
  }

  private handleReplyAction(data: any, message?: string): void {
    console.log('💬 Réponse via notification:', message, data);
    // Logique pour envoyer la réponse
    this.emitNotificationEvent('action', { type: 'reply', data, message });
  }

  private handleOpenAction(data: any): void {
    console.log('👀 Ouverture app via notification:', data);
    // Logique pour naviguer vers la page appropriée
    this.emitNotificationEvent('action', { type: 'open', data });
  }

  // Envoi de notifications locales
  async sendLocalNotification(
    type: NotificationType,
    title: string,
    body: string,
    data?: any,
    options?: {
      delay?: number;
      imageUrl?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }
  ): Promise<string> {
    const config = NOTIFICATION_CONFIG[type];
    const notificationId = `local_${Date.now()}`;

    const notificationContent: Notifications.NotificationContentInput = {
      title,
      body,
      data: { ...data, type, id: notificationId },
      sound: config?.sound || 'default',
      priority: config?.priority === 'urgent' 
        ? Notifications.AndroidNotificationPriority.HIGH 
        : Notifications.AndroidNotificationPriority.DEFAULT,
      vibrate: config?.vibrationPattern,
      categoryIdentifier: config?.categoryId,
    };

    if (options?.imageUrl) {
      notificationContent.attachments = [{
        identifier: 'image',
        url: options.imageUrl,
        options: { thumbnailHidden: false }
      }];
    }

    const trigger = options?.delay 
      ? { seconds: options.delay }
      : null;

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: notificationContent,
      trigger,
    });

    return notificationId;
  }

  // Programmation de notifications
  async scheduleNotification(
    type: NotificationType,
    title: string,
    body: string,
    scheduledDate: Date,
    data?: any
  ): Promise<string> {
    const config = NOTIFICATION_CONFIG[type];
    const notificationId = `scheduled_${Date.now()}`;

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title,
        body,
        data: { ...data, type, id: notificationId },
        sound: config?.sound || 'default',
        categoryIdentifier: config?.categoryId,
      },
      trigger: scheduledDate,
    });

    return notificationId;
  }

  // Gestion de l'historique
  private async addToHistory(notification: PushNotification): Promise<void> {
    this.notificationHistory.unshift(notification);
    
    // Limiter à 100 notifications
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100);
    }
    
    await this.saveNotificationHistory();
  }

  private async loadNotificationHistory(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('notificationHistory');
      if (saved) {
        this.notificationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique notifications:', error);
    }
  }

  private async saveNotificationHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('❌ Erreur sauvegarde historique notifications:', error);
    }
  }

  // Marquer comme lu
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveNotificationHistory();
      this.emitNotificationEvent('read', notification);
    }
  }

  // Marquer toutes comme lues
  async markAllAsRead(): Promise<void> {
    this.notificationHistory.forEach(n => n.isRead = true);
    await this.saveNotificationHistory();
    this.emitNotificationEvent('allRead', null);
  }

  // Émission d'événements pour l'interface
  private emitNotificationEvent(event: string, data: any): void {
    // Ici vous pouvez utiliser un EventEmitter ou un système de callback
    console.log(`📡 Événement notification: ${event}`, data);
  }

  // Getters publics
  getNotificationHistory(): PushNotification[] {
    return [...this.notificationHistory];
  }

  getUnreadCount(): number {
    return this.notificationHistory.filter(n => !n.isRead).length;
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Suppression de notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Nettoyage
  async clearHistory(): Promise<void> {
    this.notificationHistory = [];
    await AsyncStorage.removeItem('notificationHistory');
  }
}

export default NotificationService.getInstance();