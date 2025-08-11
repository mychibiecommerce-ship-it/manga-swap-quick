import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useMangaCover } from '../hooks/useMangaCover';
import OptimizedImage from './OptimizedImage';
import { useSimpleTheme } from '../context/SimpleTheme';

interface MangaCoverProps {
  title: string;
  author?: string;
  volume?: number;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  fallbackUrl?: string;
  showLoader?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

const MangaCover: React.FC<MangaCoverProps> = ({
  title,
  author,
  volume,
  style,
  size = 'medium',
  fallbackUrl,
  showLoader = true,
  quality = 'medium'
}) => {
  const { colors } = useSimpleTheme();
  const { coverUrl, thumbnailUrl, isLoading, error, source } = useMangaCover({
    title,
    author,
    volume,
    fallbackUrl
  });

  // Dimensions selon la taille
  const dimensions = {
    small: { width: 60, height: 80 },
    medium: { width: 100, height: 140 },
    large: { width: 150, height: 210 }
  };

  const currentDimensions = dimensions[size];
  
  // URL à utiliser selon la qualité demandée
  const imageUrl = quality === 'low' || size === 'small' 
    ? thumbnailUrl || coverUrl 
    : coverUrl || thumbnailUrl;

  const renderContent = () => {
    if (isLoading && showLoader) {
      return (
        <View style={[
          styles.container,
          currentDimensions,
          { backgroundColor: colors.surface },
          style
        ]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (imageUrl) {
      return (
        <View style={[styles.container, style]}>
          <OptimizedImage
            uri={imageUrl}
            style={[currentDimensions, styles.image]}
            quality={quality}
            enableLazyLoading={true}
          />
          
          {/* Badge source pour debug */}
          {__DEV__ && source && (
            <View style={[styles.sourceBadge, { backgroundColor: getSourceColor(source) }]}>
              <Text style={styles.sourceText}>{source.toUpperCase()}</Text>
            </View>
          )}
        </View>
      );
    }

    // Fallback par défaut
    return (
      <View style={[
        styles.container,
        styles.fallback,
        currentDimensions,
        { backgroundColor: colors.border },
        style
      ]}>
        <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
          {title.substring(0, 2).toUpperCase()}
        </Text>
      </View>
    );
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'myanimelist': return '#2E51A2';
      case 'anilist': return '#02A9FF';
      case 'mangadx': return '#FF6740';
      case 'google': return '#4285F4';
      case 'fallback': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  return renderContent();
};

// Composant pour une grille de couvertures
export const MangaCoverGrid: React.FC<{
  mangas: Array<{title: string, author?: string, volume?: number}>;
  onMangaPress?: (manga: any) => void;
  columns?: number;
  size?: 'small' | 'medium' | 'large';
}> = ({ mangas, onMangaPress, columns = 3, size = 'medium' }) => {
  const { colors } = useSimpleTheme();

  return (
    <View style={styles.grid}>
      {mangas.map((manga, index) => (
        <TouchableOpacity
          key={`${manga.title}_${manga.volume || index}`}
          style={[
            styles.gridItem,
            { width: `${100 / columns - 2}%` }
          ]}
          onPress={() => onMangaPress?.(manga)}
          activeOpacity={0.7}
        >
          <MangaCover
            title={manga.title}
            author={manga.author}
            volume={manga.volume}
            size={size}
            quality="medium"
          />
          
          <Text
            style={[styles.gridTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {manga.title}
          </Text>
          
          {manga.volume && (
            <Text style={[styles.gridVolume, { color: colors.textSecondary }]}>
              Vol. {manga.volume}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    borderRadius: 8,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '700',
  },
  sourceBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridItem: {
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  gridVolume: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default MangaCover;