import { Animated, Easing } from 'react-native';

// Animations prédéfinies pour l'application
export class AppAnimations {
  
  // Animation de fondu
  static fadeIn(animatedValue: Animated.Value, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    });
  }

  static fadeOut(animatedValue: Animated.Value, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    });
  }

  // Animation de glissement
  static slideInUp(animatedValue: Animated.Value, duration: number = 400) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  }

  static slideOutDown(animatedValue: Animated.Value, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue: 100,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
  }

  // Animation de rebond
  static bounceIn(animatedValue: Animated.Value, duration: number = 600) {
    return Animated.spring(animatedValue, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    });
  }

  // Animation de pulsation
  static pulse(animatedValue: Animated.Value) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Animation de rotation
  static rotate(animatedValue: Animated.Value, duration: number = 1000) {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  }

  // Animation de transition entre écrans
  static screenTransition(fromValue: Animated.Value, toValue: Animated.Value) {
    return Animated.parallel([
      Animated.timing(fromValue, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
  }

  // Animation de succès
  static successPulse(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.3,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]);
  }

  // Animation d'erreur (shake)
  static shake(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);
  }
}

// Hook pour animations communes
export const useAnimatedValue = (initialValue: number = 0) => {
  return new Animated.Value(initialValue);
};

// Transitions predefined
export const transitions = {
  // Transition carte manga
  mangaCard: {
    from: { opacity: 0, transform: [{ translateY: 50 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
    config: { duration: 400, easing: Easing.out(Easing.cubic) }
  },
  
  // Transition modal
  modal: {
    from: { opacity: 0, transform: [{ scale: 0.8 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
    config: { duration: 300, easing: Easing.out(Easing.back(1.2)) }
  },
  
  // Transition navigation
  navigation: {
    from: { transform: [{ translateX: 100 }] },
    to: { transform: [{ translateX: 0 }] },
    config: { duration: 250, easing: Easing.out(Easing.cubic) }
  }
};