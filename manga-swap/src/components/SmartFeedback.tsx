import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

interface SmartFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const SmartFeedback: React.FC<SmartFeedbackProps> = ({
  type,
  message,
  visible,
  onDismiss,
  autoHide = true,
  duration = 4000,
  action,
}) => {
  const { colors } = useSimpleTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      if (autoHide && onDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.primary;
      default: return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      backgroundColor: getBackgroundColor(),
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
    iconContainer: {
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    message: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    actionContainer: {
      marginTop: 8,
    },
    actionButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    dismissButton: {
      marginLeft: 12,
      padding: 4,
    },
  });

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIconName()} size={24} color="#FFFFFF" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        
        {action && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default SmartFeedback;