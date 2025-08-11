import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import OptimizedImage from './OptimizedImage';
import ExternalAPIService from '../services/ExternalAPIService';

interface CalendarEvent {
  id: string;
  title: string;
  episodeNumber: number;
  airDate: Date;
  image: string;
  description: string;
  mangaId?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  image: string;
  source: string;
  tags: string[];
}

interface MangaCalendarProps {
  onEventPress?: (event: CalendarEvent) => void;
  onNewsPress?: (news: NewsItem) => void;
}

const MangaCalendar: React.FC<MangaCalendarProps> = ({ onEventPress, onNewsPress }) => {
  const { colors } = useSimpleTheme();
  const [activeTab, setActiveTab] = useState<'calendar' | 'news'>('calendar');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [events, newsItems] = await Promise.all([
        ExternalAPIService.getAnimeCalendar('current'),
        ExternalAPIService.getMangaNews(10)
      ]);

      setCalendarEvents(events);
      setNews(newsItems);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilEvent = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Dans ${diffHours}h`;
    } else if (diffMs > 0) {
      return 'Bientôt';
    } else {
      return 'Passé';
    }
  };

  const renderCalendarEvent = (event: CalendarEvent) => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventCard, { backgroundColor: colors.surface }]}
      onPress={() => onEventPress?.(event)}
      activeOpacity={0.7}
    >
      <OptimizedImage uri={event.image} style={styles.eventImage} quality="medium" />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={[styles.episodeBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.episodeText}>Ep. {event.episodeNumber}</Text>
          </View>
        </View>

        <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.eventFooter}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.primary }]}>
              {formatDate(event.airDate)}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(event.airDate)}
            </Text>
          </View>
          
          <View style={[styles.countdownBadge, { backgroundColor: colors.warning }]}>
            <Ionicons name="time" size={14} color="white" />
            <Text style={styles.countdownText}>
              {getTimeUntilEvent(event.airDate)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNewsItem = (item: NewsItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.newsCard, { backgroundColor: colors.surface }]}
      onPress={() => onNewsPress?.(item)}
      activeOpacity={0.7}
    >
      <OptimizedImage uri={item.image} style={styles.newsImage} quality="medium" />
      
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.newsSource, { color: colors.primary }]}>
            {item.source}
          </Text>
        </View>

        <Text style={[styles.newsText, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.newsFooter}>
          <View style={styles.newsTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
              </View>
            ))}
          </View>
          
          <Text style={[styles.newsDate, { color: colors.textSecondary }]}>
            {item.publishedAt.toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCalendarTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Calendrier des sorties
        </Text>
      </View>

      {calendarEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucun événement prévu cette semaine
          </Text>
        </View>
      ) : (
        calendarEvents.map(renderCalendarEvent)
      )}
    </ScrollView>
  );

  const renderNewsTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="newspaper" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Actualités manga
        </Text>
      </View>

      {news.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucune actualité disponible
          </Text>
        </View>
      ) : (
        news.map(renderNewsItem)
      )}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          📅 Chargement du calendrier...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'calendar' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setActiveTab('calendar')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={activeTab === 'calendar' ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'calendar' ? colors.primary : colors.textSecondary }
          ]}>
            Calendrier
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'news' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setActiveTab('news')}
        >
          <Ionicons
            name="newspaper"
            size={20}
            color={activeTab === 'news' ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'news' ? colors.primary : colors.textSecondary }
          ]}>
            Actualités
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'calendar' ? renderCalendarTab() : renderNewsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  episodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  episodeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  countdownText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  newsCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MangaCalendar;