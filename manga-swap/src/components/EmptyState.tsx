import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  showConfetti?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
  showConfetti = false
}) => {
  const { colors } = useSimpleTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.confetti}>✨</Text>
          <Text style={styles.confetti}>🎊</Text>
        </View>
      )}
      
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={60} color={colors.primary} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.actionIcon} />
        </TouchableOpacity>
      )}
      
      <View style={styles.tipsContainer}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Astuce</Text>
        <Text style={[styles.tipsText, { color: colors.textLight }]}>
          {getTipForScreen(icon)}
        </Text>
      </View>
    </View>
  );
};

const getTipForScreen = (icon: string): string => {
  switch (icon) {
    case 'library':
      return "Commencez par prendre des photos de vos mangas pour créer votre collection !";
    case 'search':
      return "Utilisez les filtres par ville pour trouver des échanges près de chez vous.";
    case 'chatbubbles':
      return "Les conversations démarrent automatiquement quand vous proposez un échange.";
    case 'heart':
      return "Ajoutez des mangas à votre wishlist en cliquant sur le cœur ♡.";
    case 'trophy':
      return "Chaque échange réussi vous fait gagner de l'XP et débloquer des récompenses !";
    default:
      return "Explorez l'application et découvrez toutes les fonctionnalités !";
  }
};

const WelcomeState: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { colors } = useSimpleTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeEmoji}>🎌</Text>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Bienvenue sur Manga Swap !
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          La communauté #1 d'échange de mangas en France
        </Text>
      </View>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📚</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Échangez vos mangas gratuitement
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🤝</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Rencontrez d'autres passionnés
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>⭐</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Gagnez de l'XP et des badges
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: colors.primary }]}
        onPress={onStart}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Commencer l'aventure !</Text>
        <Ionicons name="rocket" size={24} color="#FFFFFF" style={styles.startIcon} />
      </TouchableOpacity>
      
      <Text style={[styles.bottomText, { color: colors.textLight }]}>
        100% gratuit • 0% commission • ∞% passion
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  confettiContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  confetti: {
    fontSize: 24,
    opacity: 0.7,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  actionIcon: {
    marginLeft: 4,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    maxWidth: 300,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  
  // Welcome State Styles
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 30,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  startIcon: {
    marginLeft: 4,
  },
  bottomText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EmptyState;
export { WelcomeState };