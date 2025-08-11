import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ChatConversation {
  id: string;
  exchangeId: string;
  otherUserPseudo: string;
  otherUserAvatar?: string;
  mangaTitle: string;
  mangaImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'pending' | 'accepted' | 'meeting_planned' | 'completed';
}

const mockChats: ChatConversation[] = [
  {
    id: 'chat1',
    exchangeId: 'exchange1',
    otherUserPseudo: 'MangaFan92',
    mangaTitle: 'One Piece Vol. 1',
    mangaImage: 'https://cdn.myanimelist.net/images/manga/3/55539.jpg',
    lastMessage: 'Parfait pour le rendez-vous demain !',
    lastMessageTime: '14:32',
    unreadCount: 2,
    status: 'meeting_planned',
  },
  {
    id: 'chat2',
    exchangeId: 'exchange2',
    otherUserPseudo: 'NinjaReader',
    mangaTitle: 'Naruto Vol. 5',
    mangaImage: 'https://cdn.myanimelist.net/images/manga/3/249658.jpg',
    lastMessage: 'Je suis intéressé par votre Dragon Ball !',
    lastMessageTime: '10:15',
    unreadCount: 0,
    status: 'pending',
  },
  {
    id: 'chat3',
    exchangeId: 'exchange3',
    otherUserPseudo: 'TitanHunter',
    mangaTitle: 'Attack on Titan Vol. 3',
    mangaImage: 'https://cdn.myanimelist.net/images/manga/2/37846.jpg',
    lastMessage: 'Merci pour cet excellent échange ! 🎉',
    lastMessageTime: 'Hier',
    unreadCount: 0,
    status: 'completed',
  },
];

const ChatScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ChatScreenNavigationProp>();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return { name: 'time-outline', color: theme.warning };
      case 'accepted':
        return { name: 'checkmark-circle-outline', color: theme.secondary };
      case 'meeting_planned':
        return { name: 'calendar-outline', color: theme.primary };
      case 'completed':
        return { name: 'checkmark-done-circle', color: theme.success };
      default:
        return { name: 'help-circle-outline', color: theme.textLight };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Accepté';
      case 'meeting_planned':
        return 'RDV programmé';
      case 'completed':
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  };

  const renderChatItem = ({ item, index }: { item: ChatConversation; index: number }) => {
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={[styles.chatItem, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
      >
        <TouchableOpacity
          style={styles.chatContainer}
          onPress={() => navigation.navigate('ChatDetail', { exchangeId: item.exchangeId })}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.mangaImage }} style={styles.mangaImage} />
            <View style={[styles.statusIndicator, { backgroundColor: statusIcon.color }]}>
              <Ionicons name={statusIcon.name as any} size={12} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                {item.otherUserPseudo}
              </Text>
              <Text style={[styles.timeText, { color: theme.textLight }]}>
                {item.lastMessageTime}
              </Text>
            </View>
            
            <Text style={[styles.mangaTitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.mangaTitle}
            </Text>
            
            <View style={styles.messageRow}>
              <Text 
                style={[
                  styles.lastMessage, 
                  { 
                    color: item.unreadCount > 0 ? theme.text : theme.textSecondary,
                    fontWeight: item.unreadCount > 0 ? '600' : 'normal',
                  }
                ]} 
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
              
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.statusRow}>
              <Ionicons name={statusIcon.name as any} size={14} color={statusIcon.color} />
              <Text style={[styles.statusText, { color: statusIcon.color }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    chatItem: {
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    chatContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    mangaImage: {
      width: 50,
      height: 75,
      borderRadius: 8,
    },
    statusIndicator: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.card,
    },
    chatContent: {
      flex: 1,
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
    },
    timeText: {
      fontSize: 12,
    },
    mangaTitle: {
      fontSize: 14,
      marginBottom: 6,
    },
    messageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    lastMessage: {
      fontSize: 14,
      flex: 1,
    },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    unreadCount: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '500',
    },
  });

  if (mockChats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="chatbubbles-outline" 
            size={80} 
            color={theme.textLight} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Aucune conversation
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Vos conversations d'échange{'\n'}apparaîtront ici
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mockChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChatScreen;