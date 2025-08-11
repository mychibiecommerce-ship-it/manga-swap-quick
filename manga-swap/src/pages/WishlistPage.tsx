import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

interface WishlistPageProps {
  onNavigateToChat?: (userId: string, userName: string) => void;
}

// Données mock des wishlists des autres utilisateurs
const mockWishlists = [
  {
    userId: '1',
    userName: 'Marie Dubois',
    userAvatar: 'https://picsum.photos/100/100?random=21',
    city: 'Paris',
    distance: '2.5 km',
    wishlist: [
      {
        id: '1',
        title: 'One Piece',
        volume: 104,
        author: 'Eiichiro Oda',
        urgency: 'high',
        since: '3 jours',
      },
      {
        id: '2',
        title: 'Attack on Titan',
        volume: 33,
        author: 'Hajime Isayama',
        urgency: 'medium',
        since: '1 semaine',
      },
    ],
  },
  {
    userId: '2',
    userName: 'Alex Chen',
    userAvatar: 'https://picsum.photos/100/100?random=22',
    city: 'Lyon',
    distance: '350 km',
    wishlist: [
      {
        id: '3',
        title: 'Demon Slayer',
        volume: 23,
        author: 'Koyoharu Gotouge',
        urgency: 'high',
        since: '1 jour',
      },
      {
        id: '4',
        title: 'My Hero Academia',
        volume: 36,
        author: 'Kohei Horikoshi',
        urgency: 'low',
        since: '2 semaines',
      },
    ],
  },
  {
    userId: '3',
    userName: 'Sophie Martin',
    userAvatar: 'https://picsum.photos/100/100?random=23',
    city: 'Marseille',
    distance: '775 km',
    wishlist: [
      {
        id: '5',
        title: 'Naruto',
        volume: 72,
        author: 'Masashi Kishimoto',
        urgency: 'medium',
        since: '5 jours',
      },
    ],
  },
];

const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigateToChat }) => {
  const { colors } = useSimpleTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'urgency' | 'recent'>('distance');

  const handleContactUser = (userId: string, userName: string) => {
    if (onNavigateToChat) {
      onNavigateToChat(userId, userName);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      case 'low': return 'Pas pressé';
      default: return '';
    }
  };

  const filteredWishlists = mockWishlists
    .filter(user => 
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.wishlist.some(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'urgency':
          // Trier par le niveau d'urgence le plus élevé dans la wishlist
          const aMaxUrgency = Math.max(...a.wishlist.map(item => 
            item.urgency === 'high' ? 3 : item.urgency === 'medium' ? 2 : 1
          ));
          const bMaxUrgency = Math.max(...b.wishlist.map(item => 
            item.urgency === 'high' ? 3 : item.urgency === 'medium' ? 2 : 1
          ));
          return bMaxUrgency - aMaxUrgency;
        case 'recent':
          // Trier par la demande la plus récente
          return 0; // Simplified for demo
        default:
          return 0;
      }
    });

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
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    sortContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sortButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    sortButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    sortButtonTextActive: {
      color: '#FFFFFF',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    userCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    userAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    userLocation: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    distance: {
      fontSize: 12,
      color: colors.textLight,
    },
    wishlistSection: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    wishlistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    wishlistIcon: {
      marginRight: 12,
    },
    wishlistInfo: {
      flex: 1,
    },
    wishlistTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    wishlistDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    wishlistMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    urgencyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    urgencyText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    sinceText: {
      fontSize: 12,
      color: colors.textLight,
    },
    contactButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 12,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
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
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Wishlists Communautaires</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher utilisateurs, mangas..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.sortContainer}>
          {[
            { key: 'distance', label: 'Distance' },
            { key: 'urgency', label: 'Urgence' },
            { key: 'recent', label: 'Récent' }
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortButton,
                sortBy === sort.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(sort.key as any)}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === sort.key && styles.sortButtonTextActive
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredWishlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Aucune wishlist trouvée</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos critères de recherche{'\n'}ou découvrez d'autres collectionneurs
            </Text>
          </View>
        ) : (
          filteredWishlists.map((user) => (
            <View key={user.userId} style={styles.userCard}>
              <View style={styles.userHeader}>
                <Image source={{ uri: user.userAvatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.userName}</Text>
                  <Text style={styles.userLocation}>📍 {user.city}</Text>
                  <Text style={styles.distance}>📏 {user.distance}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleContactUser(user.userId, user.userName)}
                >
                  <Text style={styles.contactButtonText}>Contacter</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.wishlistSection}>
                <Text style={styles.sectionTitle}>
                  🎯 Recherche ({user.wishlist.length})
                </Text>
                {user.wishlist.map((item) => (
                  <View key={item.id} style={styles.wishlistItem}>
                    <Ionicons 
                      name="heart" 
                      size={24} 
                      color={getUrgencyColor(item.urgency)} 
                      style={styles.wishlistIcon} 
                    />
                    <View style={styles.wishlistInfo}>
                      <Text style={styles.wishlistTitle}>{item.title}</Text>
                      <Text style={styles.wishlistDetails}>
                        Volume {item.volume} • {item.author}
                      </Text>
                      <View style={styles.wishlistMeta}>
                        <View style={[
                          styles.urgencyBadge, 
                          { backgroundColor: getUrgencyColor(item.urgency) }
                        ]}>
                          <Text style={styles.urgencyText}>
                            {getUrgencyText(item.urgency)}
                          </Text>
                        </View>
                        <Text style={styles.sinceText}>Depuis {item.since}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default WishlistPage;