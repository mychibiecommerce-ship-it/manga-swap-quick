import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

interface SwapperProfilePageProps {
  swapperId: string;
  onBack: () => void;
}

const mockSwapperProfiles = {
  'MangaFan92': {
    id: 'MangaFan92',
    name: 'Marie Dubois',
    username: 'MangaFan92',
    avatar: 'https://picsum.photos/150/150?random=1',
    rating: 4.8,
    totalExchanges: 47,
    level: 15,
    xp: 2350,
    xpToNextLevel: 400,
    joinDate: '2023-03-15',
    city: 'Paris',
    description: 'Passionnée de manga depuis 10 ans ! Je collectionne principalement les shonen et josei. Toujours à la recherche de nouveaux titres à découvrir 📚✨',
    badges: ['🏆 Top Swapper', '⭐ Excellent', '🚀 Rapide', '💯 Fiable'],
    interests: ['Shonen', 'Josei', 'Romance', 'Action'],
    collection: [
      { title: 'One Piece', volumes: '1-50', status: 'completed' },
      { title: 'Naruto', volumes: '1-72', status: 'completed' },
      { title: 'Death Note', volumes: '1-12', status: 'completed' },
    ],
    recentActivity: [
      { type: 'exchange', title: 'Échange réalisé avec Alex', date: '2024-01-10' },
      { type: 'join', title: 'A rejoint la communauté', date: '2023-03-15' },
    ]
  },
  'NinjaReader': {
    id: 'NinjaReader',
    name: 'Alex Chen',
    username: 'NinjaReader',
    avatar: 'https://picsum.photos/150/150?random=2',
    rating: 4.6,
    totalExchanges: 32,
    level: 12,
    xp: 1850,
    xpToNextLevel: 200,
    joinDate: '2023-07-22',
    city: 'Lyon',
    description: 'Fan inconditionnel de Naruto et des mangas ninja ! J\'échange principalement des shonen et seinen.',
    badges: ['⚡ Ultra Rapide', '💎 Qualité Premium', '🎯 Précis'],
    interests: ['Shonen', 'Seinen', 'Ninja', 'Action'],
    collection: [
      { title: 'Naruto', volumes: '1-72', status: 'completed' },
      { title: 'Boruto', volumes: '1-15', status: 'ongoing' },
    ],
    recentActivity: [
      { type: 'exchange', title: 'Échange avec Marie', date: '2024-01-08' },
    ]
  },
  'TitanHunter': {
    id: 'TitanHunter',
    name: 'Sophie Martin',
    username: 'TitanHunter',
    avatar: 'https://picsum.photos/150/150?random=3',
    rating: 5.0,
    totalExchanges: 63,
    level: 22,
    xp: 4200,
    xpToNextLevel: 800,
    joinDate: '2022-11-10',
    city: 'Marseille',
    description: 'Collectionneuse expérimentée spécialisée dans les mangas sombres et dramatiques. État impeccable garanti !',
    badges: ['👑 Master Swapper', '🌟 5 Étoiles', '📚 Collectionneuse', '🔥 Populaire'],
    interests: ['Seinen', 'Drama', 'Thriller', 'Psychological'],
    collection: [
      { title: 'Attack on Titan', volumes: '1-34', status: 'completed' },
      { title: 'Tokyo Ghoul', volumes: '1-14', status: 'completed' },
    ],
    recentActivity: [
      { type: 'exchange', title: 'Échange parfait !', date: '2024-01-05' },
    ]
  },
  'SlayerFan': {
    id: 'SlayerFan',
    name: 'Lucas Dupont',
    username: 'SlayerFan',
    avatar: 'https://picsum.photos/150/150?random=4',
    rating: 4.3,
    totalExchanges: 18,
    level: 6,
    xp: 650,
    xpToNextLevel: 350,
    joinDate: '2023-12-01',
    city: 'Toulouse',
    description: 'Nouveau dans la communauté mais très motivé ! Fan de Demon Slayer et des nouveaux mangas.',
    badges: ['🆕 Nouveau', '💪 Motivé'],
    interests: ['Shonen', 'Action', 'Adventure'],
    collection: [
      { title: 'Demon Slayer', volumes: '1-23', status: 'completed' },
    ],
    recentActivity: [
      { type: 'join', title: 'A rejoint Manga Swap', date: '2023-12-01' },
    ]
  },
  'HeroCollector': {
    id: 'HeroCollector',
    name: 'Emma Wilson',
    username: 'HeroCollector',
    avatar: 'https://picsum.photos/150/150?random=5',
    rating: 4.9,
    totalExchanges: 55,
    level: 18,
    xp: 3100,
    xpToNextLevel: 500,
    joinDate: '2023-01-20',
    city: 'Nice',
    description: 'Héroïne des échanges ! Spécialisée dans les mangas de super-héros et les histoires inspirantes.',
    badges: ['🦸‍♀️ Héroïne', '⭐ Excellente', '🎨 Créative'],
    interests: ['Superhero', 'Adventure', 'Comedy', 'School'],
    collection: [
      { title: 'My Hero Academia', volumes: '1-38', status: 'ongoing' },
      { title: 'One Punch Man', volumes: '1-26', status: 'ongoing' },
    ],
    recentActivity: [
      { type: 'exchange', title: 'Super échange !', date: '2024-01-12' },
    ]
  }
};

const SwapperProfilePage: React.FC<SwapperProfilePageProps> = ({ swapperId, onBack }) => {
  const { colors } = useSimpleTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'reviews'>('overview');
  
  const swapper = mockSwapperProfiles[swapperId as keyof typeof mockSwapperProfiles];
  
  if (!swapper) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Profil introuvable</Text>
      </View>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const getLevelIcon = (level: number) => {
    if (level >= 20) return '👑';
    if (level >= 15) return '🥇';
    if (level >= 10) return '🥈';
    if (level >= 5) return '🥉';
    return '🏅';
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return '#FFD700'; // Or
    if (level >= 15) return '#FF6B6B'; // Rouge
    if (level >= 10) return '#4ECDC4'; // Turquoise
    if (level >= 5) return '#45B7D1';  // Bleu
    return '#95A5A6'; // Gris
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
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    username: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      marginRight: 8,
    },
    star: {
      fontSize: 16,
    },
    ratingText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 2,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
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
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    badgesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    badge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    badgeText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    interest: {
      backgroundColor: colors.secondary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    interestText: {
      fontSize: 12,
      color: colors.secondary,
      fontWeight: '500',
    },
    collectionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    collectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    collectionVolumes: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    activityDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    errorText: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 50,
    },
    // Styles pour le niveau et XP
    levelContainer: {
      alignItems: 'center',
      marginTop: 12,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    levelIcon: {
      fontSize: 18,
      marginRight: 6,
    },
    levelText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    xpContainer: {
      alignItems: 'center',
      marginTop: 12,
      paddingHorizontal: 20,
    },
    xpText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    xpBar: {
      width: '100%',
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    xpProgress: {
      height: '100%',
      borderRadius: 4,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header du profil */}
        <Animatable.View style={styles.profileHeader} animation="fadeInUp" duration={800}>
          <Image source={{ uri: swapper.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{swapper.name}</Text>
          <Text style={styles.username}>@{swapper.username}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(Math.floor(swapper.rating))}
            </View>
            <Text style={styles.ratingText}>{swapper.rating}/5</Text>
          </View>

          {/* Affichage du niveau */}
          <View style={styles.levelContainer}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(swapper.level) }]}>
              <Text style={styles.levelIcon}>{getLevelIcon(swapper.level)}</Text>
              <Text style={styles.levelText}>Niveau {swapper.level}</Text>
            </View>
          </View>

          {/* Barre de progression XP */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>
              {swapper.xp} XP • {swapper.xpToNextLevel} XP jusqu'au niveau {swapper.level + 1}
            </Text>
            <View style={styles.xpBar}>
              <View 
                style={[
                  styles.xpProgress, 
                  { 
                    width: `${(swapper.xp / (swapper.xp + swapper.xpToNextLevel)) * 100}%`,
                    backgroundColor: getLevelColor(swapper.level)
                  }
                ]} 
              />
            </View>
          </View>
        </Animatable.View>

        {/* Statistiques */}
        <Animatable.View animation="fadeInUp" delay={200} duration={800}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{swapper.totalExchanges}</Text>
              <Text style={styles.statLabel}>Échanges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{swapper.rating}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getLevelColor(swapper.level) }]}>
                {getLevelIcon(swapper.level)} {swapper.level}
              </Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{swapper.city}</Text>
              <Text style={styles.statLabel}>Ville</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'overview' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              Vue d'ensemble
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'collection' && styles.activeTab]}
            onPress={() => setActiveTab('collection')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'collection' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              Collection
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'reviews' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              Avis
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu des tabs */}
        <View style={styles.content}>
          {activeTab === 'overview' && (
            <Animatable.View animation="fadeIn" duration={400}>
              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>À propos</Text>
                <Text style={styles.description}>{swapper.description}</Text>
              </View>

              {/* Badges */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Badges</Text>
                <View style={styles.badgesContainer}>
                  {swapper.badges.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Centres d'intérêt */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
                <View style={styles.interestsContainer}>
                  {swapper.interests.map((interest, index) => (
                    <View key={index} style={styles.interest}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animatable.View>
          )}

          {activeTab === 'collection' && (
            <Animatable.View animation="fadeIn" duration={400}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Collection</Text>
                {swapper.collection.map((item, index) => (
                  <View key={index} style={styles.collectionItem}>
                    <View>
                      <Text style={styles.collectionTitle}>{item.title}</Text>
                      <Text style={styles.collectionVolumes}>Volumes {item.volumes}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: 
                      item.status === 'completed' ? colors.success + '20' : colors.secondary + '20' 
                    }]}>
                      <Text style={[styles.badgeText, { color: 
                        item.status === 'completed' ? colors.success : colors.secondary 
                      }]}>
                        {item.status === 'completed' ? 'Complète' : 'En cours'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animatable.View>
          )}

          {activeTab === 'reviews' && (
            <Animatable.View animation="fadeIn" duration={400}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activité récente</Text>
                {swapper.recentActivity.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Ionicons 
                        name={activity.type === 'exchange' ? 'swap-horizontal' : 'person-add'} 
                        size={16} 
                        color={colors.primary} 
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animatable.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SwapperProfilePage;