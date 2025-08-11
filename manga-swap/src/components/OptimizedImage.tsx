import React, { useState, useRef, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useSimpleTheme } from '../context/SimpleTheme';

interface OptimizedImageProps {
  uri: string;
  style?: any;
  placeholder?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  quality?: 'low' | 'medium' | 'high';
  enableLazyLoading?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  placeholder = true,
  resizeMode = 'cover',
  quality = 'medium',
  enableLazyLoading = true
}) => {
  const { colors } = useSimpleTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!enableLazyLoading);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);

  // Optimisation des URLs d'images selon la qualité
  const getOptimizedUri = (originalUri: string, quality: string) => {
    if (!originalUri.includes('http')) return originalUri;
    
    // Simuler une optimisation d'URL (remplacer par votre CDN)
    const qualityParams = {
      low: '?w=150&q=60',
      medium: '?w=300&q=80', 
      high: '?w=600&q=95'
    };
    
    return originalUri + (qualityParams[quality as keyof typeof qualityParams] || qualityParams.medium);
  };

  // Intersection Observer simulé pour le lazy loading
  useEffect(() => {
    if (!enableLazyLoading) return;

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100); // Délai simulé

    return () => clearTimeout(timer);
  }, [enableLazyLoading]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setIsError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  const renderPlaceholder = () => (
    <View style={[styles.placeholder, style, { backgroundColor: colors.surface }]}>
      {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
      {isError && (
        <View style={styles.errorContainer}>
          <View style={[styles.errorIcon, { backgroundColor: colors.border }]} />
        </View>
      )}
    </View>
  );

  if (!shouldLoad) {
    return renderPlaceholder();
  }

  return (
    <View ref={viewRef} style={style}>
      {(isLoading || isError) && renderPlaceholder()}
      
      {!isError && (
        <Animated.Image
          source={{ uri: getOptimizedUri(uri, quality) }}
          style={[
            style,
            {
              opacity: fadeAnim,
              position: isLoading ? 'absolute' : 'relative'
            }
          ]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default OptimizedImage;