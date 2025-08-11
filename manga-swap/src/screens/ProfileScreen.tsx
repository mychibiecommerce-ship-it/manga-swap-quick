import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../context/ThemeContext';
import { mockUsers, mockRewards } from '../data/mockData';

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [user] = useState(mockUsers[0]); // Current user
  const [showRewards, setShowRewards] = useState(false);

  const getXPForNextLevel = (level: number) => level * 200;
  const xpForCurrentLevel = getXPForNextLevel(user.level - 1);
  const xpForNextLevel = getXPForNextLevel(user.level);
  const currentLevelXP = user.experience - xpForCurrentLevel;
  const neededXPForNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (currentLevelXP / neededXPForNext) * 100;

  const getLevelIcon = (level: number) => {
    if (level >= 10) return '👑'; // Roi
    if (level >= 7) return '⭐'; // Expert
    if (level >= 5) return '🥇'; // Champion
    if (level >= 3) return '🥈'; // Avancé
    if (level >= 2) return '🥉'; // Intermédiaire
    return '🌱'; // Débutant
  };

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Roi du Manga';
    if (level >= 7) return 'Expert';
    if (level >= 5) return 'Champion';
    if (level >= 3) return 'Échangeur Avancé';
    if (level >= 2) return 'Intermédiaire';
    return 'Débutant';
  };

  const openMyChibiReward = (url: string) => {
    Alert.alert(
      'Récupérer la récompense',
      'Vous allez être redirigé vers MyChibi.fr pour récupérer votre récompense !',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ouvrir MyChibi.fr',
          onPress: () => {
            Linking.openURL(url).catch(() => {
              Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
            });
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.surface,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    profileInfo: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 36,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    userCity: {
      fontSize: 16,
      marginBottom: 8,
    },
    userDescription: {
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    levelContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowColor: theme.shadow,
    },
    levelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    levelIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    levelInfo: {
      alignItems: 'center',
    },
    levelNumber: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primary,
    },
    levelTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    xpContainer: {
      marginTop: 16,
    },
    xpText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    xpNumbers: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    xpNumber: {
      fontSize: 12,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowColor: theme.shadow,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
    rewardsSection: {
      margin: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.surfaceVariant,
    },
    toggleText: {
      fontSize: 12,
      marginLeft: 4,
    },
    rewardsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    rewardCard: {
      width: '48%',
      backgroundColor: theme.card,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowColor: theme.shadow,
    },
    rewardImage: {
      width: '100%',
      height: 120,
      backgroundColor: theme.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rewardImageText: {
      fontSize: 40,
    },
    rewardContent: {
      padding: 12,
    },
    rewardTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    rewardDescription: {
      fontSize: 12,
      marginBottom: 8,
      lineHeight: 16,
    },
    rewardLevel: {
      fontSize: 11,
      marginBottom: 8,
    },
    rewardButton: {
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    rewardButtonText: {
      fontSize: 12,
      fontWeight: '600',
    },
    unlockedButton: {
      backgroundColor: theme.success,
    },
    lockedButton: {
      backgroundColor: theme.textLight,
    },
    settingsSection: {
      margin: 16,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.card,
      marginBottom: 8,
      borderRadius: 12,
      elevation: 1,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      shadowColor: theme.shadow,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingText: {
      fontSize: 16,
    },
    settingArrow: {
      marginLeft: 8,
    },
  });

  const unlockedRewards = mockRewards.filter(reward => reward.levelRequired <= user.level);
  const lockedRewards = mockRewards.filter(reward => reward.levelRequired > user.level);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec infos profil */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.pseudo.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{user.pseudo}</Text>
          <Text style={[styles.userCity, { color: theme.textSecondary }]}>
            📍 {user.city}
          </Text>
          {user.description && (
            <Text style={[styles.userDescription, { color: theme.textLight }]}>
              "{user.description}"
            </Text>
          )}
        </View>

        {/* Niveau et XP */}
        <Animatable.View animation="bounceIn" delay={300} style={styles.levelContainer}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelIcon}>{getLevelIcon(user.level)}</Text>
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>Niveau {user.level}</Text>
              <Text style={[styles.levelTitle, { color: theme.text }]}>
                {getLevelTitle(user.level)}
              </Text>
            </View>
          </View>

          <View style={styles.xpContainer}>
            <Text style={[styles.xpText, { color: theme.textSecondary }]}>
              {currentLevelXP} / {neededXPForNext} XP
            </Text>
            <View style={styles.progressBar}>
              <Animatable.View
                animation="slideInLeft"
                delay={500}
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progressPercentage, 100)}%` },
                ]}
              />
            </View>
            <View style={styles.xpNumbers}>
              <Text style={[styles.xpNumber, { color: theme.textLight }]}>
                {xpForCurrentLevel} XP
              </Text>
              <Text style={[styles.xpNumber, { color: theme.textLight }]}>
                {xpForNextLevel} XP
              </Text>
            </View>
          </View>
        </Animatable.View>
      </Animatable.View>

      {/* Statistiques */}
      <Animatable.View animation="fadeInUp" delay={600} style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>
            {user.exchangeCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Échanges{'\n'}réalisés
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.secondary }]}>
            {user.experience}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Points{'\n'}d'expérience
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.accent }]}>
            {unlockedRewards.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Récompenses{'\n'}débloquées
          </Text>
        </View>
      </Animatable.View>

      {/* Section Récompenses */}
      <Animatable.View animation="fadeInUp" delay={800} style={styles.rewardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🎁 Récompenses MyChibi
          </Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowRewards(!showRewards)}
          >
            <Ionicons
              name={showRewards ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textSecondary}
            />
            <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
              {showRewards ? 'Masquer' : 'Afficher'}
            </Text>
          </TouchableOpacity>
        </View>

        {showRewards && (
          <Animatable.View animation="slideInDown" style={styles.rewardsGrid}>
            {/* Récompenses débloquées */}
            {unlockedRewards.map((reward, index) => (
              <Animatable.View
                key={reward.id}
                animation="bounceIn"
                delay={index * 100}
                style={styles.rewardCard}
              >
                <View style={styles.rewardImage}>
                  <Text style={styles.rewardImageText}>🎁</Text>
                </View>
                <View style={styles.rewardContent}>
                  <Text style={[styles.rewardTitle, { color: theme.text }]}>
                    {reward.title}
                  </Text>
                  <Text style={[styles.rewardDescription, { color: theme.textSecondary }]}>
                    {reward.description}
                  </Text>
                  <Text style={[styles.rewardLevel, { color: theme.success }]}>
                    ✓ Niveau {reward.levelRequired} atteint
                  </Text>
                  <TouchableOpacity
                    style={[styles.rewardButton, styles.unlockedButton]}
                    onPress={() => openMyChibiReward(reward.redeemUrl)}
                  >
                    <Text style={[styles.rewardButtonText, { color: '#FFFFFF' }]}>
                      Récupérer sur MyChibi.fr
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            ))}

            {/* Récompenses verrouillées */}
            {lockedRewards.map((reward, index) => (
              <Animatable.View
                key={reward.id}
                animation="fadeIn"
                delay={(unlockedRewards.length + index) * 100}
                style={[styles.rewardCard, { opacity: 0.6 }]}
              >
                <View style={styles.rewardImage}>
                  <Text style={styles.rewardImageText}>🔒</Text>
                </View>
                <View style={styles.rewardContent}>
                  <Text style={[styles.rewardTitle, { color: theme.textLight }]}>
                    {reward.title}
                  </Text>
                  <Text style={[styles.rewardDescription, { color: theme.textLight }]}>
                    {reward.description}
                  </Text>
                  <Text style={[styles.rewardLevel, { color: theme.warning }]}>
                    Niveau {reward.levelRequired} requis
                  </Text>
                  <View style={[styles.rewardButton, styles.lockedButton]}>
                    <Text style={[styles.rewardButtonText, { color: '#FFFFFF' }]}>
                      Verrouillé
                    </Text>
                  </View>
                </View>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}
      </Animatable.View>

      {/* Paramètres */}
      <Animatable.View animation="fadeInUp" delay={1000} style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
          ⚙️ Paramètres
        </Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="person-outline"
              size={24}
              color={theme.textSecondary}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Modifier le profil
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={24}
              color={theme.textSecondary}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Mode sombre
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.surfaceVariant, true: theme.primary + '40' }}
            thumbColor={isDark ? theme.primary : theme.textLight}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.textSecondary}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Notifications
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={theme.textSecondary}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Aide et support
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={theme.textSecondary}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Conditions d'utilisation
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnexion', style: 'destructive' },
              ]
            );
          }}
        >
          <View style={styles.settingLeft}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.error}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: theme.error }]}>
              Déconnexion
            </Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

export default ProfileScreen;