import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';
import SmartRecommendations from '../components/SmartRecommendations';
import MangaCalendar from '../components/MangaCalendar';
import { useWidgets } from '../hooks/useWidgets';

const DiscoveryPage: React.FC = () => {
  const { colors } = useSimpleTheme();
  const [activeSection, setActiveSection] = useState<'recommendations' | 'calendar' | 'trending'>('recommendations');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { widgets, quickActions, refreshAllWidgets } = useWidgets();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllWidgets();
    setIsRefreshing(false);
  };

  const sections = [
    { key: 'recommendations', label: 'Pour vous', icon: 'heart' },
    { key: 'calendar', label: 'Calendrier', icon: 'calendar' },
    { key: 'trending', label: 'Tendances', icon: 'trending-up' }
  ];

  const renderQuickActions = () => (
    <View style={[styles.quickActionsContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions rapides</Text>
      <View style={styles.quickActionsList}>
        {quickActions.slice(0, 6).map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionButton, { backgroundColor: colors.background }]}
            onPress={action.action}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon as any} size={24} color={colors.primary} />
              {action.badge && action.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>{action.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWidgets = () => (
    <View style={styles.widgetsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Aperçu</Text>
      {widgets.map((widget) => (
        <View key={widget.id} style={[styles.widgetCard, { backgroundColor: colors.surface }]}>
          <View style={styles.widgetHeader}>
            <Text style={[styles.widgetTitle, { color: colors.text }]}>{widget.title}</Text>
            <Text style={[styles.widgetUpdated, { color: colors.textSecondary }]}>
              {widget.lastUpdated.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          {/* Contenu du widget basé sur le type */}
          {widget.type === 'recent_exchanges' && (
            <View style={styles.widgetContent}>
              {widget.data.slice(0, 2).map((exchange: any) => (
                <View key={exchange.id} style={styles.exchangeItem}>
                  <Text style={[styles.exchangeManga, { color: colors.text }]} numberOfLines={1}>
                    {exchange.manga}
                  </Text>
                  <Text style={[styles.exchangePartner, { color: colors.textSecondary }]}>
                    avec {exchange.partner}
                  </Text>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: exchange.status === 'completed' ? colors.success : colors.warning }
                  ]} />
                </View>
              ))}
            </View>
          )}

          {widget.type === 'trending_manga' && (
            <View style={styles.widgetContent}>
              {widget.data.slice(0, 3).map((manga: any) => (
                <View key={manga.id} style={styles.trendingItem}>
                  <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={1}>
                    {manga.title}
                  </Text>
                  <Text style={[styles.trendingChange, { color: colors.success }]}>
                    {manga.trend}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {widget.type === 'quick_stats' && (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {widget.data.totalExchanges}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Échanges
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {widget.data.successRate}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Succès
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {widget.data.rating}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Note
                </Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderRecommendationsSection = () => (
    <SmartRecommendations
      userId="current-user"
      onMangaPress={(mangaId) => {
        console.log('Manga sélectionné:', mangaId);
        // Navigation vers les détails du manga
      }}
      onRefresh={handleRefresh}
      maxItems={5}
    />
  );

  const renderCalendarSection = () => (
    <MangaCalendar
      onEventPress={(event) => {
        console.log('Événement sélectionné:', event);
        // Navigation vers les détails de l'événement
      }}
      onNewsPress={(news) => {
        console.log('Actualité sélectionnée:', news);
        // Navigation vers l'article complet
      }}
    />
  );

  const renderTrendingSection = () => (
    <ScrollView style={styles.trendingContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.trendingCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🔥 Populaire cette semaine</Text>
        <View style={styles.trendingList}>
          {[
            { title: 'Chainsaw Man', change: '+25%' },
            { title: 'Jujutsu Kaisen', change: '+18%' },
            { title: 'Attack on Titan', change: '+15%' },
            { title: 'Demon Slayer', change: '+12%' },
            { title: 'One Piece', change: '+8%' }
          ].map((item, index) => (
            <View key={index} style={styles.trendingListItem}>
              <View style={styles.trendingRank}>
                <Text style={[styles.rankNumber, { color: colors.primary }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.trendingItemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.trendingItemChange, { color: colors.success }]}>
                {item.change}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.trendingCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📈 Nouvelles découvertes</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Mangas qui gagnent en popularité rapidement
        </Text>
        {/* Contenu des nouvelles découvertes */}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header avec titre et section tabs */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>🌟 Découverte</Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sectionTabs}
          contentContainerStyle={styles.sectionTabsContent}
        >
          {sections.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[
                styles.sectionTab,
                {
                  backgroundColor: activeSection === section.key ? colors.primary : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setActiveSection(section.key as any)}
            >
              <Ionicons
                name={section.icon as any}
                size={16}
                color={activeSection === section.key ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.sectionTabText,
                {
                  color: activeSection === section.key ? 'white' : colors.textSecondary
                }
              ]}>
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenu scrollable */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Actions rapides (toujours visibles) */}
        {renderQuickActions()}

        {/* Widgets d'aperçu (toujours visibles) */}
        {renderWidgets()}

        {/* Section principale basée sur l'onglet actif */}
        <View style={styles.mainSection}>
          {activeSection === 'recommendations' && renderRecommendationsSection()}
          {activeSection === 'calendar' && renderCalendarSection()}
          {activeSection === 'trending' && renderTrendingSection()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  sectionTabs: {
    maxHeight: 40,
  },
  sectionTabsContent: {
    gap: 8,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  quickActionsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickActionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  quickActionIcon: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  widgetsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  widgetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  widgetUpdated: {
    fontSize: 12,
  },
  widgetContent: {
    gap: 8,
  },
  exchangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exchangeManga: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  exchangePartner: {
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  trendingChange: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  mainSection: {
    flex: 1,
    marginHorizontal: 16,
  },
  trendingContent: {
    flex: 1,
  },
  trendingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  trendingList: {
    gap: 12,
  },
  trendingListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendingItemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  trendingItemChange: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default DiscoveryPage;