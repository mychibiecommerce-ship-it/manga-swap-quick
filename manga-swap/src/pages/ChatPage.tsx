import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  PanGestureHandler,
  State
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable'; // Removed for chat messages
import { useSimpleTheme } from '../context/SimpleTheme';
import EmptyState from '../components/EmptyState';

interface ChatPageProps {
  onNavigateToExchange?: (mangaId: string) => void;
}

// Données vides pour la production - Les conversations apparaîtront quand les utilisateurs commenceront à échanger
const mockConversations: any[] = [];

const mockSwapRequests: any[] = [];

const mockMessages: any[] = [];

const ChatPage: React.FC<ChatPageProps> = ({ onNavigateToExchange }) => {
  const { colors } = useSimpleTheme();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'requests'>('conversations');
  const [newMessage, setNewMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'archived' | 'unread' | 'pinned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(mockConversations);
  const [swapRequests, setSwapRequests] = useState(mockSwapRequests);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleNavigateToExchange = (mangaId: string) => {
    if (onNavigateToExchange) {
      onNavigateToExchange(mangaId);
    }
  };

  // Fonctions utilitaires
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return timestamp.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': case 'confirmed': return colors.success;
      case 'rejected': case 'cancelled': return colors.error;
      case 'completed': return colors.primary;
      default: return colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Accepté';
      case 'confirmed': return 'Confirmé';
      case 'rejected': return 'Refusé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'normal': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  // Fonctions de gestion
  const handleArchive = (itemId: string) => {
    if (activeTab === 'conversations') {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === itemId ? { ...conv, isArchived: !conv.isArchived } : conv
        )
      );
    } else {
      setSwapRequests(prev => 
        prev.map(req => 
          req.id === itemId ? { ...req, isArchived: !req.isArchived } : req
        )
      );
    }
  };

  const handleDelete = (itemId: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer cette conversation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            if (activeTab === 'conversations') {
              setConversations(prev => prev.filter(conv => conv.id !== itemId));
            } else {
              setSwapRequests(prev => prev.filter(req => req.id !== itemId));
            }
          }
        }
      ]
    );
  };

  const handlePin = (itemId: string) => {
    if (activeTab === 'conversations') {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === itemId ? { ...conv, isPinned: !conv.isPinned } : conv
        )
      );
    } else {
      setSwapRequests(prev => 
        prev.map(req => 
          req.id === itemId ? { ...req, isPinned: !req.isPinned } : req
        )
      );
    }
  };

  const handleMarkAsRead = (itemId: string) => {
    if (activeTab === 'conversations') {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === itemId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    }
  };

  const handleBulkAction = (action: 'archive' | 'delete' | 'pin' | 'markRead') => {
    selectedItems.forEach(itemId => {
      switch (action) {
        case 'archive':
          handleArchive(itemId);
          break;
        case 'delete':
          handleDelete(itemId);
          break;
        case 'pin':
          handlePin(itemId);
          break;
        case 'markRead':
          handleMarkAsRead(itemId);
          break;
      }
    });
    setSelectedItems([]);
    setSelectionMode(false);
  };

  const toggleSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setSelectedItems(prev => [...prev, itemId]);
    }
  };

  // Filtrage des données
  const getFilteredData = () => {
    const data = activeTab === 'conversations' ? conversations : swapRequests;
    
    return data
      .filter(item => {
        // Filtre par statut
        switch (filterStatus) {
          case 'archived':
            return item.isArchived;
          case 'unread':
            return 'unreadCount' in item && item.unreadCount > 0;
          case 'pinned':
            return item.isPinned;
          case 'all':
          default:
            return !item.isArchived;
        }
      })
      .filter(item => {
        // Filtre par recherche
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          item.otherUser.name.toLowerCase().includes(query) ||
          ('manga' in item && item.manga.title.toLowerCase().includes(query)) ||
          ('requestedManga' in item && item.requestedManga.title.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        // Tri : épinglés en premier, puis par priorité, puis par date
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        const aTime = 'lastMessage' in a ? a.lastMessage.timestamp : a.timestamp;
        const bTime = 'lastMessage' in b ? b.lastMessage.timestamp : b.timestamp;
        return bTime.getTime() - aTime.getTime();
      });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    // Tabs et filtres
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 2,
      marginBottom: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    inactiveTabText: {
      color: colors.textSecondary,
    },
    // Barre de recherche et filtres
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    filterButton: {
      marginLeft: 8,
      padding: 4,
    },
    filtersRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterChipsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    activeFilterChipText: {
      color: '#FFFFFF',
    },
    // Mode sélection
    selectionHeader: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    selectionTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    selectionActions: {
      flexDirection: 'row',
      gap: 16,
    },
    // Liste des conversations
    conversationsList: {
      flex: 1,
    },
    conversationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    selectedConversationItem: {
      backgroundColor: colors.primary + '20',
    },
    pinnedConversationItem: {
      backgroundColor: colors.secondary + '10',
    },
    conversationAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    conversationName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    conversationTime: {
      fontSize: 12,
      color: colors.textLight,
    },
    conversationPreview: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    conversationLastMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    unreadLastMessage: {
      color: colors.text,
      fontWeight: '600',
    },
    conversationMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    unreadBadge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    unreadBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: colors.card,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    priorityIcon: {
      fontSize: 12,
    },
    pinIcon: {
      fontSize: 14,
    },
    // Actions de swipe
    swipeActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 16,
    },
    swipeAction: {
      width: 60,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
      borderRadius: 8,
    },
    archiveAction: {
      backgroundColor: '#FFA500',
    },
    deleteAction: {
      backgroundColor: colors.error,
    },
    pinAction: {
      backgroundColor: colors.secondary,
    },
    markReadAction: {
      backgroundColor: colors.primary,
    },
    // Chat individuel
    chatContainer: {
      flex: 1,
    },
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
    },
    chatHeaderInfo: {
      flex: 1,
    },
    chatHeaderName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    chatHeaderManga: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    swapButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 12,
      gap: 4,
    },
    swapButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    swapConversationButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 4,
    },
    chatHeaderActions: {
      flexDirection: 'row',
      gap: 12,
    },
    messagesList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    messageItem: {
      marginVertical: 4,
      maxWidth: '80%',
    },
    myMessage: {
      alignSelf: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    myMessageBubble: {
      backgroundColor: colors.primary,
    },
    otherMessageBubble: {
      backgroundColor: colors.card,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
    },
    myMessageText: {
      color: '#FFFFFF',
    },
    otherMessageText: {
      color: colors.text,
    },
    messageTime: {
      fontSize: 11,
      marginTop: 4,
      textAlign: 'right',
    },
    myMessageTime: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    otherMessageTime: {
      color: colors.textLight,
    },
    // Input de message
    messageInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    messageInput: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 12,
      fontSize: 16,
      color: colors.text,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // État vide
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
    },
  });

  const renderConversationItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedItems.includes(item.id);
    const isUnread = 'unreadCount' in item && item.unreadCount > 0;

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.conversationItem,
            isSelected && styles.selectedConversationItem,
            item.isPinned && styles.pinnedConversationItem,
          ]}
          onPress={() => {
            if (selectionMode) {
              toggleSelection(item.id);
            } else if (item.type === 'exchange') {
              setSelectedConversation(item.id);
            }
          }}
          onLongPress={() => {
            if (!selectionMode) {
              setSelectionMode(true);
              setSelectedItems([item.id]);
            }
          }}
        >
          {selectionMode && (
            <View style={{ marginRight: 12 }}>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={24}
                color={isSelected ? colors.primary : colors.textLight}
              />
            </View>
          )}

          <Image source={{ uri: item.otherUser.avatar }} style={styles.conversationAvatar} />
          
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <Text 
                style={[styles.conversationName, isUnread && { fontWeight: '700' }]} 
                numberOfLines={1}
              >
                {item.otherUser.name}
              </Text>
              <Text style={styles.conversationTime}>
                {formatTimestamp('lastMessage' in item ? item.lastMessage.timestamp : item.timestamp)}
              </Text>
            </View>

            <View style={styles.conversationPreview}>
              <Text 
                style={[
                  styles.conversationLastMessage,
                  isUnread && styles.unreadLastMessage
                ]} 
                numberOfLines={1}
              >
                {item.type === 'exchange' 
                  ? item.lastMessage.text
                  : `Demande d'échange : ${item.requestedManga.title} vol.${item.requestedManga.volume}`
                }
              </Text>

              <View style={styles.conversationMeta}>
                {getPriorityIcon(item.priority) && (
                  <Text style={styles.priorityIcon}>{getPriorityIcon(item.priority)}</Text>
                )}
                
                {item.isPinned && (
                  <Text style={styles.pinIcon}>📌</Text>
                )}

                {'unreadCount' in item && item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                )}

                {!selectionMode && item.type === 'exchange' && (
                  <TouchableOpacity 
                    style={styles.swapConversationButton}
                    onPress={() => handleNavigateToExchange(item.manga.id)}
                  >
                    <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConversationsList = () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return (
        <EmptyState
          icon="chatbubbles"
          title={filterStatus === 'archived' 
            ? 'Aucune conversation archivée'
            : searchQuery 
              ? 'Aucune conversation trouvée'
              : 'Aucune conversation'
          }
          subtitle={filterStatus === 'archived' 
            ? 'Les conversations archivées apparaîtront ici'
            : searchQuery 
              ? 'Essayez avec d\'autres mots-clés'
              : 'Commencez par parcourir les mangas et proposer des échanges'
          }
          actionText={!searchQuery && filterStatus === 'all' ? 'Découvrir des mangas' : undefined}
          onAction={!searchQuery && filterStatus === 'all' ? () => console.log('Navigate to Swap page') : undefined}
        />
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={filteredData}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderMessageItem = ({ item }: { item: any }) => (
    <View style={[styles.messageItem, item.isFromMe ? styles.myMessage : styles.otherMessage]}>
      <View style={[
        styles.messageBubble,
        item.isFromMe ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={[
        styles.messageTime,
        item.isFromMe ? styles.myMessageTime : styles.otherMessageTime
      ]}>
        {formatTimestamp(item.timestamp)}
      </Text>
    </View>
  );

  const renderChat = () => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return null;

    return (
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header du chat */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{conversation.otherUser.name}</Text>
            <Text style={styles.chatHeaderManga}>
              {conversation.manga.title} - Volume {conversation.manga.volume}
            </Text>
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={() => handleNavigateToExchange(conversation.manga.id)}>
            <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
            <Text style={styles.swapButtonText}>Swap</Text>
          </TouchableOpacity>

          <View style={styles.chatHeaderActions}>
            <TouchableOpacity onPress={() => handlePin(conversation.id)}>
              <Ionicons 
                name={conversation.isPinned ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleArchive(conversation.id)}>
              <Ionicons name="archive-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(conversation.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={mockMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted
        />

        {/* Input de message */}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Tapez votre message..."
            placeholderTextColor={colors.textLight}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  if (selectedConversation) {
    return renderChat();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {selectionMode ? (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={() => {
            setSelectionMode(false);
            setSelectedItems([]);
          }}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.selectionTitle}>
            {selectedItems.length} sélectionné{selectedItems.length > 1 ? 's' : ''}
          </Text>
          
          <View style={styles.selectionActions}>
            <TouchableOpacity onPress={() => handleBulkAction('archive')}>
              <Ionicons name="archive-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBulkAction('pin')}>
              <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBulkAction('markRead')}>
              <Ionicons name="mail-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBulkAction('delete')}>
              <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💬 Messages</Text>
          
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'conversations' && styles.activeTab]}
              onPress={() => setActiveTab('conversations')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'conversations' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                💬 Conversations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
              onPress={() => setActiveTab('requests')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'requests' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                🔄 Mes Demandes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher conversations..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtres */}
          <View style={styles.filtersRow}>
            <View style={styles.filterChipsContainer}>
              {[
                { key: 'all', label: 'Toutes', icon: '📬' },
                { key: 'unread', label: 'Non lues', icon: '🔴' },
                { key: 'pinned', label: 'Épinglées', icon: '📌' },
                { key: 'archived', label: 'Archivées', icon: '📁' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    filterStatus === filter.key && styles.activeFilterChip
                  ]}
                  onPress={() => setFilterStatus(filter.key as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterStatus === filter.key && styles.activeFilterChipText
                  ]}>
                    {filter.icon} {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
                  </View>
      </View>
      )}

      {/* Liste des conversations */}
      {renderConversationsList()}
    </View>
  );
};

export default ChatPage;