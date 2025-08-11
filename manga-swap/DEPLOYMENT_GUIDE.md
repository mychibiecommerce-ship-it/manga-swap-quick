# 🚀 Guide de Déploiement - Manga Swap

## 📋 **CHECKLIST PRE-DÉPLOIEMENT**

### ✅ **1. Configuration de l'Application**

#### **A. Fichier app.json/app.config.js**
```json
{
  "expo": {
    "name": "Manga Swap",
    "slug": "manga-swap",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4A90E2"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mangaswap.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#4A90E2"
      },
      "package": "com.mangaswap.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

#### **B. Variables d'Environnement (.env)**
```env
# API Configuration
API_BASE_URL=https://api.mangaswap.com
MYANIMELIST_CLIENT_ID=your_mal_client_id
ANILIST_CLIENT_ID=your_anilist_client_id

# Firebase Config (si utilisé)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id

# Supabase Config (si utilisé)
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Push Notifications
EXPO_PUSH_TOKEN=your_expo_push_token

# Environment
NODE_ENV=production
```

### ✅ **2. Assets et Images**

#### **A. Icônes Requises**
- `icon.png` (1024x1024) - Icône principale
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon
- `splash.png` (1284x2778) - Écran de démarrage

#### **B. Optimisation des Images**
```bash
# Compresser toutes les images
npm install -g imagemin-cli
imagemin assets/images/*.png --out-dir=assets/images/optimized --plugin=pngquant
```

### ✅ **3. Performance et Optimisation**

#### **A. Bundle Size Analysis**
```bash
# Analyser la taille du bundle
npx expo export --platform web
npx bundlesize
```

#### **B. Code Optimization**
- ✅ Images optimisées (OptimizedImage implémenté)
- ✅ Cache intelligent (CacheManager implémenté)
- ✅ Lazy loading (useVirtualizedList implémenté)
- ✅ Error boundaries
- ✅ Minification automatique

### ✅ **4. Tests et Validation**

#### **A. Tests Fonctionnels**
- [ ] Navigation entre tous les onglets
- [ ] Recherche et filtrage
- [ ] Ajout/suppression de mangas
- [ ] Chat et messagerie
- [ ] Système de recommandations
- [ ] Notifications push
- [ ] Gestion hors ligne

#### **B. Tests Devices**
- [ ] iPhone (iOS 14+)
- [ ] Android (API 21+)
- [ ] Tablettes
- [ ] Différentes tailles d'écran

## 🏗️ **DÉPLOIEMENT STEP-BY-STEP**

### **Option 1: Expo Application Services (EAS) - RECOMMANDÉ**

#### **1. Installation EAS CLI**
```bash
npm install -g @expo/eas-cli
eas login
```

#### **2. Configuration EAS**
```bash
eas build:configure
```

Cela créera `eas.json`:
```json
{
  "cli": {
    "version": ">= 0.60.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### **3. Build de Production**
```bash
# Build Android (APK pour test)
eas build --platform android --profile preview

# Build iOS (nécessite compte Apple Developer)
eas build --platform ios --profile production

# Build pour les deux plateformes
eas build --platform all --profile production
```

#### **4. Test Internal**
```bash
# Créer un build de test interne
eas build --platform android --profile preview
# Partager le lien de téléchargement généré avec vos amis
```

### **Option 2: Expo Go (Test Rapide)**

#### **1. Publier sur Expo**
```bash
npx expo publish
```

#### **2. Partager via QR Code**
- Vos amis installent Expo Go
- Ils scannent le QR code
- Test immédiat sans installation

### **Option 3: Build Local (Avancé)**

#### **1. Éjecter d'Expo (si nécessaire)**
```bash
npx expo eject
```

#### **2. Build Android Local**
```bash
cd android
./gradlew assembleRelease
```

#### **3. Build iOS Local (macOS + Xcode)**
```bash
cd ios
xcodebuild -workspace MangaSwap.xcworkspace -scheme MangaSwap archive
```

## 📱 **DISTRIBUTION POUR TESTS**

### **A. TestFlight (iOS)**
1. Build avec EAS ou Xcode
2. Upload sur App Store Connect
3. Ajouter testeurs via email
4. Distribution automatique

### **B. Google Play Console (Android)**
1. Upload AAB/APK
2. Créer une release de test interne
3. Ajouter testeurs via email/groupe
4. Distribution via Play Store

### **C. Firebase App Distribution**
```bash
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute app-release.apk \
  --app 1:123456789:android:abcd1234 \
  --groups "testers" \
  --release-notes "Version 1.0 - Test initial"
```

## 🔧 **CONFIGURATION PRODUCTION**

### **1. Environnement Variables**
```typescript
// src/config/env.ts
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.mangaswap.com',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  ENABLE_LOGGING: process.env.NODE_ENV !== 'production',
  CACHE_DURATION: process.env.NODE_ENV === 'production' ? 60 * 60 * 1000 : 5 * 60 * 1000,
};
```

### **2. Analytics et Monitoring**
```bash
# Installer Sentry pour crash reporting
npx expo install @sentry/react-native

# Configuration Sentry
# Dans app.json:
{
  "expo": {
    "hooks": {
      "postPublish": [
        {
          "file": "sentry-expo/upload-sourcemaps",
          "config": {
            "organization": "your-org",
            "project": "manga-swap"
          }
        }
      ]
    }
  }
}
```

### **3. Performance Monitoring**
```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  static trackScreenLoad(screenName: string) {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      console.log(`Screen ${screenName} loaded in ${duration}ms`);
    };
  }
}
```

## 🚨 **CHECKLIST FINAL AVANT RELEASE**

### **Code Quality**
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de warnings console en production
- [ ] Tests passent
- [ ] Code review effectué

### **Sécurité**
- [ ] Clés API sécurisées
- [ ] Pas de données sensibles en dur
- [ ] HTTPS partout
- [ ] Validation des inputs

### **UX/UI**
- [ ] Toutes les fonctionnalités testées
- [ ] Animations fluides
- [ ] Gestion d'erreurs appropriée
- [ ] Messages utilisateur clairs

### **Performance**
- [ ] Temps de chargement < 3s
- [ ] Bundle size optimisé
- [ ] Images compressées
- [ ] Cache fonctionnel

## 📊 **MONITORING POST-DÉPLOIEMENT**

### **1. Métriques à Surveiller**
- Crashes et erreurs
- Temps de chargement
- Engagement utilisateur
- Taux de rétention
- Performance réseau

### **2. Feedback Utilisateur**
- Système de rating in-app
- Formulaire de feedback
- Analytics comportementales
- Reviews app stores

## 🎯 **STRATÉGIE DE RELEASE**

### **Phase 1: Alpha (Amis proches) - 5-10 testeurs**
- Version Expo Go ou build interne
- Tests de base et feedback général
- Correction bugs majeurs

### **Phase 2: Beta (Communauté élargie) - 50-100 testeurs**
- TestFlight/Play Console internal testing
- Tests de charge et stress
- Optimisations performance

### **Phase 3: Soft Launch (Région limitée)**
- Release publique limitée
- Monitoring intensif
- Ajustements finaux

### **Phase 4: Global Launch**
- Release mondiale
- Marketing et promotion
- Support utilisateur

---

## 📞 **SUPPORT ET RESSOURCES**

- **Documentation Expo**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **React Native**: https://reactnative.dev/
- **Community Discord**: https://discord.gg/expo

---

*Guide créé pour Manga Swap v1.0 - Mise à jour: $(date)*