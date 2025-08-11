import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

interface NotificationBannerProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
  duration?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 4000
}) => {
  const { colors } = useSimpleTheme();
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.success };
      case 'error':
        return { backgroundColor: colors.error };
      case 'warning':
        return { backgroundColor: colors.warning };
      case 'info':
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 50,
      left: 16,
      right: 16,
      zIndex: 1000,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    icon: {
      marginRight: 12,
    },
    messageText: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '500',
    },
    closeButton: {
      marginLeft: 12,
      padding: 4,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        getNotificationStyle(),
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name={getIcon()} size={24} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.messageText}>{message}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
        <Ionicons name="close" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationBanner;