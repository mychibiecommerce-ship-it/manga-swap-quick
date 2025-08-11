import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import cacheManager from '../utils/cacheManager';

interface WidgetData {
  id: string;
  type: 'recent_exchanges' | 'trending_manga' | 'quick_stats' | 'calendar_events';
  title: string;
  data: any;
  lastUpdated: Date;
  refreshInterval: number; // en millisecondes
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  badge?: number;
  enabled: boolean;
}

interface WidgetConfig {
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  autoRefresh: boolean;
}

export const useWidgets = () => {
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Configuration des widgets par défaut
  const defaultWidgetConfigs: Record<string, WidgetConfig> = {
    recent_exchanges: { enabled: true, position: 0, size: 'medium', autoRefresh: true },
    trending_manga: { enabled: true, position: 1, size: 'small', autoRefresh: true },
    quick_stats: { enabled: true, position: 2, size: 'small', autoRefresh: false },
    calendar_events: { enabled: false, position: 3, size: 'large', autoRefresh: true }
  };

  useEffect(() => {
    initializeWidgets();
    setupAppStateListener();
  }, []);

  const initializeWidgets = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadWidgets(),
        loadQuickActions()
      ]);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des widgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWidgets = async () => {
    const widgetPromises = Object.entries(defaultWidgetConfigs)
      .filter(([_, config]) => config.enabled)
      .map(([type, _]) => createWidget(type as any));

    const loadedWidgets = await Promise.all(widgetPromises);
    setWidgets(loadedWidgets.filter(Boolean) as WidgetData[]);
  };

  const loadQuickActions = async () => {
    // Charger les actions rapides depuis le cache ou créer par défaut
    const cachedActions = await cacheManager.get<QuickAction[]>('quick_actions');
    
    if (cachedActions) {
      setQuickActions(cachedActions);
    } else {
      const defaultActions = await createDefaultQuickActions();
      setQuickActions(defaultActions);
      await cacheManager.set('quick_actions', defaultActions);
    }
  };

  const createWidget = async (type: WidgetData['type']): Promise<WidgetData | null> => {
    try {
      let data: any;
      let title: string;
      let refreshInterval: number;

      switch (type) {
        case 'recent_exchanges':
          data = await loadRecentExchanges();
          title = 'Échanges récents';
          refreshInterval = 5 * 60 * 1000; // 5 minutes
          break;

        case 'trending_manga':
          data = await loadTrendingManga();
          title = 'Tendances';
          refreshInterval = 30 * 60 * 1000; // 30 minutes
          break;

        case 'quick_stats':
          data = await loadQuickStats();
          title = 'Mes statistiques';
          refreshInterval = 60 * 60 * 1000; // 1 heure
          break;

        case 'calendar_events':
          data = await loadCalendarEvents();
          title = 'Prochaines sorties';
          refreshInterval = 60 * 60 * 1000; // 1 heure
          break;

        default:
          return null;
      }

      return {
        id: `widget_${type}_${Date.now()}`,
        type,
        title,
        data,
        lastUpdated: new Date(),
        refreshInterval
      };
    } catch (error) {
      console.error(`Erreur lors de la création du widget ${type}:`, error);
      return null;
    }
  };

  const loadRecentExchanges = async (): Promise<any[]> => {
    // Simuler des échanges récents
    return [
      {
        id: '1',
        manga: 'Attack on Titan Vol. 34',
        partner: 'Marie D.',
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        manga: 'One Piece Vol. 105',
        partner: 'Jean L.',
        status: 'in_progress',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const loadTrendingManga = async (): Promise<any[]> => {
    // Simuler des mangas tendance
    return [
      { id: '1', title: 'Chainsaw Man', trend: '+15%' },
      { id: '2', title: 'Jujutsu Kaisen', trend: '+8%' },
      { id: '3', title: 'Spy x Family', trend: '+12%' }
    ];
  };

  const loadQuickStats = async (): Promise<any> => {
    // Simuler des statistiques rapides
    return {
      totalExchanges: 47,
      successRate: 92,
      rating: 4.8,
      collectionSize: 156
    };
  };

  const loadCalendarEvents = async (): Promise<any[]> => {
    // Simuler des événements de calendrier
    return [
      {
        id: '1',
        title: 'Attack on Titan Final',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        type: 'anime_episode'
      },
      {
        id: '2',
        title: 'One Piece Chapter 1095',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        type: 'manga_chapter'
      }
    ];
  };

  const createDefaultQuickActions = async (): Promise<QuickAction[]> => {
    return [
      {
        id: 'search_manga',
        label: 'Rechercher',
        icon: 'search',
        action: () => {}, // À implémenter selon votre navigation
        enabled: true
      },
      {
        id: 'add_manga',
        label: 'Ajouter manga',
        icon: 'add-circle',
        action: () => {},
        enabled: true
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: 'chatbubble',
        action: () => {},
        badge: 3, // Simuler 3 messages non lus
        enabled: true
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'notifications',
        action: () => {},
        badge: 1,
        enabled: true
      },
      {
        id: 'scan_barcode',
        label: 'Scanner',
        icon: 'scan',
        action: () => {},
        enabled: true
      },
      {
        id: 'nearby_swappers',
        label: 'À proximité',
        icon: 'location',
        action: () => {},
        enabled: true
      }
    ];
  };

  const refreshWidget = useCallback(async (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    try {
      const updatedWidget = await createWidget(widget.type);
      if (updatedWidget) {
        setWidgets(prev => prev.map(w => 
          w.id === widgetId ? { ...updatedWidget, id: widgetId } : w
        ));
      }
    } catch (error) {
      console.error(`Erreur lors du rafraîchissement du widget ${widgetId}:`, error);
    }
  }, [widgets]);

  const refreshAllWidgets = useCallback(async () => {
    setLastRefresh(new Date());
    const refreshPromises = widgets.map(widget => refreshWidget(widget.id));
    await Promise.all(refreshPromises);
  }, [widgets, refreshWidget]);

  const updateQuickAction = useCallback(async (actionId: string, updates: Partial<QuickAction>) => {
    setQuickActions(prev => {
      const updated = prev.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      );
      // Sauvegarder en cache
      cacheManager.set('quick_actions', updated);
      return updated;
    });
  }, []);

  const toggleWidget = useCallback(async (widgetType: WidgetData['type'], enabled: boolean) => {
    if (enabled) {
      // Ajouter le widget
      const newWidget = await createWidget(widgetType);
      if (newWidget) {
        setWidgets(prev => [...prev, newWidget].sort((a, b) => 
          defaultWidgetConfigs[a.type].position - defaultWidgetConfigs[b.type].position
        ));
      }
    } else {
      // Supprimer le widget
      setWidgets(prev => prev.filter(w => w.type !== widgetType));
    }

    // Sauvegarder la configuration
    const config = { ...defaultWidgetConfigs[widgetType], enabled };
    await cacheManager.set(`widget_config_${widgetType}`, config);
  }, []);

  // Gestion du cycle de vie de l'app
  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App devient active, rafraîchir les widgets si nécessaire
        const timeSinceLastRefresh = Date.now() - lastRefresh.getTime();
        if (timeSinceLastRefresh > 5 * 60 * 1000) { // 5 minutes
          refreshAllWidgets();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  // Auto-refresh des widgets
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    widgets.forEach(widget => {
      const config = defaultWidgetConfigs[widget.type];
      if (config.autoRefresh) {
        const interval = setInterval(() => {
          refreshWidget(widget.id);
        }, widget.refreshInterval);
        
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [widgets, refreshWidget]);

  // Gestionnaires de performance
  const getWidgetPerformanceInfo = useCallback(() => {
    return widgets.map(widget => ({
      id: widget.id,
      type: widget.type,
      lastUpdated: widget.lastUpdated,
      dataSize: JSON.stringify(widget.data).length,
      refreshInterval: widget.refreshInterval
    }));
  }, [widgets]);

  const optimizeWidgetPerformance = useCallback(async () => {
    // Nettoyer les widgets obsolètes
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24h
    setWidgets(prev => prev.filter(widget => 
      widget.lastUpdated.getTime() > cutoffTime
    ));

    // Nettoyer le cache des widgets
    await cacheManager.clear();
  }, []);

  return {
    widgets,
    quickActions,
    isLoading,
    lastRefresh,
    refreshWidget,
    refreshAllWidgets,
    updateQuickAction,
    toggleWidget,
    getWidgetPerformanceInfo,
    optimizeWidgetPerformance
  };
};

// Hook spécialisé pour les raccourcis rapides
export const useQuickActions = () => {
  const { quickActions, updateQuickAction } = useWidgets();

  const executeQuickAction = useCallback((actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action && action.enabled) {
      action.action();
    }
  }, [quickActions]);

  const getEnabledActions = useCallback(() => {
    return quickActions.filter(action => action.enabled);
  }, [quickActions]);

  const getActionsWithBadges = useCallback(() => {
    return quickActions.filter(action => action.enabled && action.badge && action.badge > 0);
  }, [quickActions]);

  return {
    quickActions,
    executeQuickAction,
    updateQuickAction,
    getEnabledActions,
    getActionsWithBadges
  };
};