import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isMe: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'user1',
    senderName: 'MangaFan92',
    message: 'Bonjour, je suis intéressé par votre One Piece !',
    timestamp: '10:30',
    isMe: false,
  },
  {
    id: '2',
    senderId: 'current_user',
    senderName: 'Moi',
    message: 'Salut ! Parfait, quel manga me proposez-vous en échange ?',
    timestamp: '10:32',
    isMe: true,
  },
  {
    id: '3',
    senderId: 'user1',
    senderName: 'MangaFan92',
    message: 'J\'ai Dragon Ball volume 1 en excellent état, ça vous intéresse ?',
    timestamp: '10:35',
    isMe: false,
  },
  {
    id: '4',
    senderId: 'current_user',
    senderName: 'Moi',
    message: 'Oui c\'est parfait ! On peut se voir demain vers 15h ?',
    timestamp: '10:40',
    isMe: true,
  },
  {
    id: '5',
    senderId: 'user1',
    senderName: 'MangaFan92',
    message: 'Parfait pour le rendez-vous demain ! À 15h au café près de la gare.',
    timestamp: '14:32',
    isMe: false,
  },
];

const ChatDetailScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<ChatDetailRouteProp>();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'current_user',
        senderName: 'Moi',
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isMe: true,
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 50}
        style={[
          styles.messageContainer,
          item.isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isMe 
              ? [styles.myMessage, { backgroundColor: theme.primary }]
              : [styles.otherMessage, { backgroundColor: theme.card }],
          ]}
        >
          {!item.isMe && (
            <Text style={[styles.senderName, { color: theme.textSecondary }]}>
              {item.senderName}
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              { color: item.isMe ? '#FFFFFF' : theme.text },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: item.isMe ? 'rgba(255,255,255,0.7)' : theme.textLight },
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </Animatable.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    chatContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    messageContainer: {
      marginVertical: 4,
      maxWidth: '80%',
    },
    myMessageContainer: {
      alignSelf: 'flex-end',
    },
    otherMessageContainer: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      padding: 12,
      borderRadius: 16,
      elevation: 1,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      shadowColor: theme.shadow,
    },
    myMessage: {
      borderBottomRightRadius: 4,
    },
    otherMessage: {
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    senderName: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    timestamp: {
      fontSize: 11,
      marginTop: 4,
      textAlign: 'right',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 12,
      fontSize: 16,
      backgroundColor: theme.background,
      color: theme.text,
      maxHeight: 100,
    },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      shadowColor: theme.shadow,
    },
    sendButtonDisabled: {
      backgroundColor: theme.textLight,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    quickAction: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.surfaceVariant,
      marginRight: 8,
    },
    quickActionText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

  const quickActionMessages = [
    "👋 Salut !",
    "📅 Quand êtes-vous disponible ?",
    "📍 Où se retrouver ?",
    "✅ D'accord !",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Actions rapides */}
      <View style={styles.quickActions}>
        {quickActionMessages.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickAction}
            onPress={() => setNewMessage(action)}
          >
            <Text style={styles.quickActionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Tapez votre message..."
          placeholderTextColor={theme.textLight}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;