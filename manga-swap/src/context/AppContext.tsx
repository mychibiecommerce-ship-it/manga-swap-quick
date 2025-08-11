import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour l'état global
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  city: string;
  rating: number;
}

interface Manga {
  id: string;
  title: string;
  author: string;
  volume: number;
  image: string;
  condition: string;
  description: string;
  ownerId: string;
  status: 'offering' | 'seeking';
  isPublic: boolean;
}

interface Exchange {
  id: string;
  manga1Id: string;
  manga2Id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'meeting' | 'completed' | 'cancelled';
  meetingLocation?: string;
  meetingDate?: Date;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'location' | 'image';
}

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  exchangeId?: string;
  isArchived: boolean;
  isPinned: boolean;
}

interface AppState {
  // Utilisateur
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Données
  mangas: Manga[];
  myCollection: Manga[];
  wishlist: string[]; // IDs des mangas
  conversations: Conversation[];
  exchanges: Exchange[];
  
  // Navigation
  currentTab: string;
  navigationStack: string[];
  
  // UI State
  isLoading: boolean;
  notifications: any[];
  searchQuery: string;
  selectedCity: string;
  selectedCondition: string;
}

// Actions possibles
type AppAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_MANGAS'; payload: Manga[] }
  | { type: 'ADD_TO_COLLECTION'; payload: Manga }
  | { type: 'REMOVE_FROM_COLLECTION'; payload: string }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'UPDATE_SEARCH'; payload: string }
  | { type: 'SET_FILTERS'; payload: { city?: string; condition?: string } }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'CREATE_EXCHANGE'; payload: Exchange }
  | { type: 'UPDATE_EXCHANGE'; payload: { id: string; updates: Partial<Exchange> } }
  | { type: 'SET_TAB'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> };

// État initial
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  mangas: [],
  myCollection: [],
  wishlist: [],
  conversations: [],
  exchanges: [],
  currentTab: 'swap',
  navigationStack: [],
  isLoading: false,
  notifications: [],
  searchQuery: '',
  selectedCity: '',
  selectedCondition: '',
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      };
      
    case 'LOGOUT':
      return {
        ...initialState,
      };
      
    case 'SET_MANGAS':
      return {
        ...state,
        mangas: action.payload,
      };
      
    case 'ADD_TO_COLLECTION':
      return {
        ...state,
        myCollection: [...state.myCollection, action.payload],
      };
      
    case 'REMOVE_FROM_COLLECTION':
      return {
        ...state,
        myCollection: state.myCollection.filter(m => m.id !== action.payload),
      };
      
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        wishlist: [...state.wishlist.filter(id => id !== action.payload), action.payload],
      };
      
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(id => id !== action.payload),
      };
      
    case 'UPDATE_SEARCH':
      return {
        ...state,
        searchQuery: action.payload,
      };
      
    case 'SET_FILTERS':
      return {
        ...state,
        selectedCity: action.payload.city || state.selectedCity,
        selectedCondition: action.payload.condition || state.selectedCondition,
      };
      
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv => 
          conv.id === action.payload.conversationId
            ? { ...conv, lastMessage: action.payload.message }
            : conv
        ),
      };
      
    case 'CREATE_EXCHANGE':
      return {
        ...state,
        exchanges: [action.payload, ...state.exchanges],
      };
      
    case 'UPDATE_EXCHANGE':
      return {
        ...state,
        exchanges: state.exchanges.map(ex => 
          ex.id === action.payload.id
            ? { ...ex, ...action.payload.updates }
            : ex
        ),
      };
      
    case 'SET_TAB':
      return {
        ...state,
        currentTab: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
      };
      
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Actions simplifiées
  login: (user: User) => void;
  logout: () => void;
  addToWishlist: (mangaId: string) => void;
  removeFromWishlist: (mangaId: string) => void;
  addToCollection: (manga: Manga) => void;
  removeFromCollection: (mangaId: string) => void;
  updateSearch: (query: string) => void;
  setFilters: (filters: { city?: string; condition?: string }) => void;
  createExchange: (manga1Id: string, manga2Id: string, user1Id: string, user2Id: string) => void;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions simplifiées
  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addToWishlist = (mangaId: string) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: mangaId });
  };

  const removeFromWishlist = (mangaId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: mangaId });
  };

  const addToCollection = (manga: Manga) => {
    dispatch({ type: 'ADD_TO_COLLECTION', payload: manga });
  };

  const removeFromCollection = (mangaId: string) => {
    dispatch({ type: 'REMOVE_FROM_COLLECTION', payload: mangaId });
  };

  const updateSearch = (query: string) => {
    dispatch({ type: 'UPDATE_SEARCH', payload: query });
  };

  const setFilters = (filters: { city?: string; condition?: string }) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const createExchange = (manga1Id: string, manga2Id: string, user1Id: string, user2Id: string) => {
    const exchange: Exchange = {
      id: Date.now().toString(),
      manga1Id,
      manga2Id,
      user1Id,
      user2Id,
      status: 'pending',
      messages: [],
    };
    dispatch({ type: 'CREATE_EXCHANGE', payload: exchange });
  };

  // Persistance
  const saveState = async () => {
    try {
      const dataToSave = {
        currentUser: state.currentUser,
        myCollection: state.myCollection,
        wishlist: state.wishlist,
        conversations: state.conversations,
        exchanges: state.exchanges,
      };
      await AsyncStorage.setItem('mangaSwapState', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('mangaSwapState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'RESTORE_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    addToWishlist,
    removeFromWishlist,
    addToCollection,
    removeFromCollection,
    updateSearch,
    setFilters,
    createExchange,
    saveState,
    loadState,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};

// Export des types
export type { User, Manga, Exchange, Message, Conversation, AppState };