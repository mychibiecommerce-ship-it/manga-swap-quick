import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types de navigation
type ScreenName = 'swap' | 'chat' | 'collection' | 'wishlist' | 'profile' | 'exchange' | 'swapperProfile';

interface NavigationParams {
  mangaId?: string;
  conversationId?: string;
  swapperId?: string;
  userId?: string;
  userName?: string;
  exchange?: any;
}

interface NavigationState {
  currentScreen: ScreenName;
  params: NavigationParams;
  history: Array<{ screen: ScreenName; params: NavigationParams }>;
  canGoBack: boolean;
}

interface NavigationContextType {
  state: NavigationState;
  
  // Navigation actions
  navigateTo: (screen: ScreenName, params?: NavigationParams) => void;
  goBack: () => void;
  resetTo: (screen: ScreenName, params?: NavigationParams) => void;
  
  // Navigation helpers
  navigateToExchange: (mangaId: string, fromScreen?: ScreenName) => void;
  navigateToChat: (userId: string, userName: string) => void;
  navigateToSwapperProfile: (swapperId: string) => void;
  
  // State helpers
  isCurrentScreen: (screen: ScreenName) => boolean;
  getPreviousScreen: () => { screen: ScreenName; params: NavigationParams } | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>({
    currentScreen: 'swap',
    params: {},
    history: [{ screen: 'swap', params: {} }],
    canGoBack: false,
  });

  const navigateTo = (screen: ScreenName, params: NavigationParams = {}) => {
    setState(prevState => ({
      currentScreen: screen,
      params,
      history: [...prevState.history, { screen, params }],
      canGoBack: true,
    }));
  };

  const goBack = () => {
    setState(prevState => {
      if (prevState.history.length <= 1) return prevState;
      
      const newHistory = prevState.history.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      
      return {
        currentScreen: previous.screen,
        params: previous.params,
        history: newHistory,
        canGoBack: newHistory.length > 1,
      };
    });
  };

  const resetTo = (screen: ScreenName, params: NavigationParams = {}) => {
    setState({
      currentScreen: screen,
      params,
      history: [{ screen, params }],
      canGoBack: false,
    });
  };

  // Navigation helpers spécialisés
  const navigateToExchange = (mangaId: string, fromScreen: ScreenName = 'swap') => {
    navigateTo('exchange', { mangaId, fromScreen });
  };

  const navigateToChat = (userId: string, userName: string) => {
    // Créer ou trouver la conversation existante
    const conversationId = `conv_${userId}_${Date.now()}`;
    navigateTo('chat', { conversationId, userId, userName });
  };

  const navigateToSwapperProfile = (swapperId: string) => {
    navigateTo('swapperProfile', { swapperId });
  };

  // State helpers
  const isCurrentScreen = (screen: ScreenName) => state.currentScreen === screen;

  const getPreviousScreen = () => {
    if (state.history.length <= 1) return null;
    return state.history[state.history.length - 2];
  };

  const contextValue: NavigationContextType = {
    state,
    navigateTo,
    goBack,
    resetTo,
    navigateToExchange,
    navigateToChat,
    navigateToSwapperProfile,
    isCurrentScreen,
    getPreviousScreen,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook personnalisé
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation doit être utilisé dans un NavigationProvider');
  }
  return context;
};

export type { ScreenName, NavigationParams };