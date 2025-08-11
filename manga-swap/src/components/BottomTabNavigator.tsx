import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

// Import des pages
import SwapPage from '../pages/SwapPage';
import ChatPage from '../pages/ChatPage';
import CollectionPage from '../pages/CollectionPage';
import WishlistPage from '../pages/WishlistPage';
import ProfilePage from '../pages/ProfilePage';
import GlobalHeader from './GlobalHeader';

type TabName = 'swap' | 'chat' | 'collection' | 'wishlist' | 'profile';

interface Tab {
  name: TabName;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

// Réorganisation avec Swap au centre
const tabs: Tab[] = [
  { name: 'chat', label: 'Chat', icon: 'chatbubbles', component: ChatPage },
  { name: 'collection', label: 'Collection', icon: 'library', component: CollectionPage },
  { name: 'swap', label: 'Swap', icon: 'swap-horizontal', component: SwapPage }, // Au centre
  { name: 'wishlist', label: 'Wishlists', icon: 'heart', component: WishlistPage },
  { name: 'profile', label: 'Profil', icon: 'person', component: ProfilePage },
];

const BottomTabNavigator = () => {
  const { colors } = useSimpleTheme();
  const [activeTab, setActiveTab] = useState<TabName>('swap');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(null);
  
  // Hauteur approximative de la barre pour réserver l'espace du contenu
  const TAB_BAR_HEIGHT = 92;
  
  // Animation pour l'icône swap
  const swapIconAnimation = useRef(new Animated.Value(0)).current;
  const swapIconScale = useRef(new Animated.Value(1)).current;
  
  // Animations hover pour chaque onglet
  const tabHoverAnimations = useRef({
    chat: new Animated.Value(0),
    collection: new Animated.Value(0),
    swap: new Animated.Value(0),
    wishlist: new Animated.Value(0),
    profile: new Animated.Value(0),
  }).current;

  // Animation continue de rotation
  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(swapIconAnimation, {
        toValue: 1,
        duration: 3000, // 3 secondes pour une rotation complète
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
    
    // Animation de pulsation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(swapIconScale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(swapIconScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  // Animation d'activation/désactivation
  const animateTabPress = () => {
    Animated.sequence([
      Animated.timing(swapIconScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(swapIconScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animations hover pour les onglets
  const animateTabHover = (tabName: TabName, isHovering: boolean) => {
    Animated.timing(tabHoverAnimations[tabName], {
      toValue: isHovering ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigateToChat = (userId: string, userName: string) => {
    setActiveTab('chat');
    setSelectedConversationId(userId);
  };

  const handleNavigateToExchange = (mangaId: string) => {
    setActiveTab('swap');
    setSelectedMangaId(mangaId);
  };

  const handleNavigateToProfile = () => {
    setActiveTab('profile');
  };

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || SwapPage;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
    },
    content: {
      flex: 1,
      // Réserve l'espace pour la barre collante
      paddingBottom: TAB_BAR_HEIGHT,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      paddingBottom: 12,
      paddingTop: 12,
      paddingHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      // Collant en bas de l'écran
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    centerTabContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginTop: -18, // Élévation du bouton central
    },
    centerTab: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
      borderWidth: 4,
      borderColor: colors.surface,
    },
    centerTabActive: {
      backgroundColor: colors.primary,
      transform: [{ scale: 1.05 }],
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    miniLogoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    miniLogoText: {
      fontSize: 16,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 1,
    },
    miniLogoSubtext: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 1,
      marginTop: -4,
    },
    miniLogoEmoji: {
      fontSize: 8,
      position: 'absolute',
      top: -2,
      right: -8,
    },
    centerTabLogo: {
      width: 100,
      height: 100,
      tintColor: '#FFFFFF',
    },
    centerTabIcon: {
      fontSize: 32,
      color: '#FFFFFF',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    centerTabLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 4,
      textAlign: 'center',
    },
    tabIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    activeTabLabel: {
      color: colors.primary,
    },
    inactiveTabLabel: {
      color: colors.textLight,
    },
    activeTabIcon: {
      color: colors.primary,
    },
    inactiveTabIcon: {
      color: colors.textLight,
    },
  });

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'wishlist':
        return <WishlistPage onNavigateToChat={handleNavigateToChat} />;
      case 'chat':
        return <ChatPage onNavigateToExchange={handleNavigateToExchange} />;
      case 'swap':
        return <SwapPage selectedMangaId={selectedMangaId} onClearSelectedManga={() => setSelectedMangaId(null)} />;
      case 'collection':
        return <CollectionPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <ActiveComponent />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header global persistant */}
      <GlobalHeader onNavigateToProfile={handleNavigateToProfile} />
      
      {/* Contenu de la page active */}
      <View style={styles.content}>
        {renderActiveComponent()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.name;
          const isCenterTab = tab.name === 'swap';
          
          if (isCenterTab) {
            return (
              <View key={tab.name} style={styles.centerTabContainer}>
                <TouchableOpacity
                  style={[
                    styles.centerTab,
                    isActive && styles.centerTabActive
                  ]}
                  onPress={() => {
                    setActiveTab(tab.name);
                    animateTabPress();
                  }}
                  onPressIn={() => animateTabHover(tab.name, true)}
                  onPressOut={() => animateTabHover(tab.name, false)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: swapIconAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                        {
                          scale: swapIconScale,
                        },
                        {
                          translateY: tabHoverAnimations[tab.name].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -8], // Monte de 8px
                          }),
                        },
                      ],
                    }}
                  >
                    <Ionicons 
                      name={tab.icon as any} 
                      size={32} 
                      color="#FFFFFF" // Toujours blanc
                    />
                  </Animated.View>
                </TouchableOpacity>
                <Text style={styles.centerTabLabel}>
                  {tab.label}
                </Text>
              </View>
            );
          }
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => setActiveTab(tab.name)}
              onPressIn={() => animateTabHover(tab.name, true)}
              onPressOut={() => animateTabHover(tab.name, false)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  alignItems: 'center',
                  transform: [
                    {
                      translateY: tabHoverAnimations[tab.name].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6], // Monte de 6px pour les autres onglets
                      }),
                    },
                  ],
                }}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={24} 
                  color={isActive ? colors.primary : colors.textLight} 
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default BottomTabNavigator;