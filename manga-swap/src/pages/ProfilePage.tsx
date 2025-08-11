import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  Switch,
  Modal,
  TextInput
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import EditProfilePage from './EditProfilePage';
import NotificationDemo from '../components/NotificationDemo';

// Données utilisateur
const userProfile = {
  id: '1',
  name: 'Alexandre Martin',
  email: 'alex.martin@email.com',
  phone: '+33 6 12 34 56 78',
  avatar: 'https://picsum.photos/200/200?random=user',
  city: 'Paris',
  joinDate: new Date('2023-06-15'),
  // Gamification
  xp: 1250,
  level: 8,
  nextLevelXP: 1500,
  exchangesCompleted: 15,
  satisfaction: 4.8,
  badges: [
    { id: 'first_exchange', name: 'Premier Échange', icon: '🎯', description: 'Votre tout premier échange' },
    { id: 'manga_lover', name: 'Manga Lover', icon: '📚', description: '10 échanges réalisés' },
    { id: 'city_explorer', name: 'Explorateur Urbain', icon: '🏙️', description: 'Échangé dans 3 villes différentes' },
    { id: 'speed_exchanger', name: 'Échangeur Éclair', icon: '⚡', description: 'Échange réalisé en moins de 24h' },
    { id: 'collector', name: 'Collectionneur', icon: '🏆', description: 'Collection de 50+ mangas' },
  ],
  achievements: [
    { id: 'weekly_exchanger', name: 'Échangeur de la semaine', progress: 3, total: 5, icon: '🔥' },
    { id: 'manga_master', name: 'Maître Manga', progress: 25, total: 50, icon: '👑' },
    { id: 'social_butterfly', name: 'Papillon Social', progress: 8, total: 10, icon: '🦋' },
  ]
};

// Récompenses MangaSwap
const mangaSwapRewards = [
  { 
    id: 'avatar_frame', 
    name: 'Cadre Avatar Exclusif',
    cost: 500,
    type: 'cosmetic',
    icon: '🖼️',
    description: 'Un cadre doré pour votre avatar',
    unlocked: true 
  },
  { 
    id: 'title_legendary', 
    name: 'Titre "Légende du Manga"',
    cost: 1000,
    type: 'title',
    icon: '👑',
    description: 'Titre exclusif affiché sur votre profil',
    unlocked: false 
  },
  { 
    id: 'early_access', 
    name: 'Accès Anticipé MangaSwap',
    cost: 2000,
    type: 'feature',
    icon: '🚀',
    description: 'Accès aux nouvelles fonctionnalités en avant-première',
    unlocked: false 
  },
];

const ProfilePage = () => {
  const { colors, isDark, toggleTheme } = useSimpleTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showEditProfilePage, setShowEditProfilePage] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editCity, setEditCity] = useState(userProfile.city);
  const [notifications, setNotifications] = useState(true);

  if (showEditProfilePage) {
    return <EditProfilePage onBack={() => setShowEditProfilePage(false)} />;
  }

  const getLevelProgress = () => {
    const currentLevelXP = (userProfile.level - 1) * 200; // XP nécessaire pour le niveau actuel
    const progressInLevel = userProfile.xp - currentLevelXP;
    const xpForNextLevel = userProfile.nextLevelXP - currentLevelXP;
    return (progressInLevel / xpForNextLevel) * 100;
  };

  const getRankTitle = (level: number) => {
    if (level >= 50) return 'Légende Manga';
    if (level >= 30) return 'Maître Échangeur';
    if (level >= 20) return 'Expert Manga';
    if (level >= 10) return 'Collectionneur';
    if (level >= 5) return 'Amateur Confirmé';
    return 'Débutant';
  };

  const handleSaveProfile = () => {
    // Ici, on sauvegarderait les modifications
    setShowEditModal(false);
    Alert.alert('Succès', 'Profil mis à jour avec succès !');
  };

  const handleRedeemReward = (reward: typeof mangaSwapRewards[0]) => {
    if (userProfile.xp >= reward.cost) {
      Alert.alert(
        'Échanger des XP',
        `Voulez-vous échanger ${reward.cost} XP contre "${reward.name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Confirmer', 
            onPress: () => {
              Alert.alert('Succès', `Vous avez obtenu : ${reward.name} !`);
              setShowRewardsModal(false);
            }
          }
        ]
      );
    } else {
      Alert.alert('XP insuffisants', `Il vous manque ${reward.cost - userProfile.xp} XP pour cette récompense.`);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },
    profileSection: {
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 15,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: '#FFFFFF',
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 15,
      padding: 6,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 5,
    },
    rank: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 15,
    },
    levelContainer: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    levelText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginRight: 10,
    },
    xpText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 15,
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressBar: {
      height: 12,
      backgroundColor: colors.surface,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: 6,
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    badgesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    badgeItem: {
      width: '30%',
      alignItems: 'center',
      marginBottom: 15,
    },
    badgeIcon: {
      fontSize: 30,
      marginBottom: 5,
    },
    badgeName: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '600',
    },
    achievementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 10,
    },
    achievementIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    achievementInfo: {
      flex: 1,
    },
    achievementName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 5,
    },
    achievementProgressBar: {
      height: 6,
      backgroundColor: colors.surface,
      borderRadius: 3,
      overflow: 'hidden',
    },
    achievementProgressFill: {
      height: '100%',
      backgroundColor: colors.warning,
      borderRadius: 3,
    },
    achievementProgress: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      marginRight: 15,
      width: 24,
      alignItems: 'center',
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
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
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      marginBottom: 15,
      fontSize: 16,
      color: colors.text,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: colors.textLight,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    rewardItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rewardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    rewardIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    rewardName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    rewardCost: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    rewardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    rewardButton: {
      backgroundColor: colors.success,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    rewardButtonDisabled: {
      backgroundColor: colors.textLight,
    },
    rewardButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec profil */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              <TouchableOpacity 
                style={styles.editAvatarButton} 
                onPress={() => setShowEditProfilePage(true)}
              >
                <Ionicons name="pencil" size={16} color={colors.surface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.rank}>{getRankTitle(userProfile.level)}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Niveau {userProfile.level}</Text>
              <Text style={styles.xpText}>{userProfile.xp} XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Progression */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Progression</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getLevelProgress()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {userProfile.nextLevelXP - userProfile.xp} XP pour le niveau {userProfile.level + 1}
              </Text>
            </View>
                  </View>

        {/* Demo des notifications */}
        <NotificationDemo />

        {/* Statistiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userProfile.exchangesCompleted}</Text>
                <Text style={styles.statLabel}>Échanges réalisés</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userProfile.satisfaction}⭐</Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userProfile.level}</Text>
                <Text style={styles.statLabel}>Niveau actuel</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userProfile.badges.length}</Text>
                <Text style={styles.statLabel}>Badges obtenus</Text>
              </View>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏅 Badges obtenus</Text>
            <View style={styles.badgesGrid}>
              {userProfile.badges.map((badge) => (
                <TouchableOpacity 
                  key={badge.id} 
                  style={styles.badgeItem}
                  onPress={() => Alert.alert(badge.name, badge.description)}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Objectifs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Objectifs en cours</Text>
            {userProfile.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <View style={styles.achievementProgressBar}>
                    <View 
                      style={[
                        styles.achievementProgressFill, 
                        { width: `${(achievement.progress / achievement.total) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.achievementProgress}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Récompenses MangaSwap */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Récompenses MangaSwap</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setShowRewardsModal(true)}
            >
              <Text style={styles.buttonText}>Voir les récompenses ({userProfile.xp} XP)</Text>
            </TouchableOpacity>
          </View>

          {/* Paramètres */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setShowEditModal(true)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuText}>Modifier le profil</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.textLight, true: colors.primary }}
                thumbColor={notifications ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuText}>Mode {isDark ? 'clair' : 'sombre'}</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.textLight, true: colors.primary }}
                thumbColor={isDark ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="help-circle-outline" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuText}>Aide et support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="log-out-outline" size={24} color={colors.error} />
              </View>
              <Text style={[styles.menuText, { color: colors.error }]}>Se déconnecter</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de modification du profil */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nom"
              placeholderTextColor={colors.textLight}
              value={editName}
              onChangeText={setEditName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Ville"
              placeholderTextColor={colors.textLight}
              value={editCity}
              onChangeText={setEditCity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.buttonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal des récompenses */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRewardsModal}
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎁 Récompenses MangaSwap</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowRewardsModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.progressText, { marginBottom: 20 }]}>
              Vos XP: {userProfile.xp}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {mangaSwapRewards.map((reward) => (
                <View key={reward.id} style={styles.rewardItem}>
                  <View style={styles.rewardHeader}>
                    <Text style={styles.rewardIcon}>{reward.icon}</Text>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <Text style={styles.rewardCost}>{reward.cost} XP</Text>
                  </View>
                  <Text style={styles.rewardDescription}>{reward.description}</Text>
                  <TouchableOpacity
                    style={[
                      styles.rewardButton,
                      (userProfile.xp < reward.cost || reward.unlocked) && styles.rewardButtonDisabled
                    ]}
                    onPress={() => handleRedeemReward(reward)}
                    disabled={userProfile.xp < reward.cost || reward.unlocked}
                  >
                    <Text style={styles.rewardButtonText}>
                      {reward.unlocked ? 'Déjà obtenu' : 'Échanger'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfilePage;