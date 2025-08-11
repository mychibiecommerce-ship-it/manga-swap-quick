#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Préparation du build pour déploiement...\n');

// 1. Vérifier les fichiers requis
const requiredFiles = [
  'src/components/BottomTabNavigator.tsx',
  'src/pages/SwapPage.tsx',
  'src/pages/ChatPage.tsx',
  'src/pages/CollectionPage.tsx',
  'src/pages/ProfilePage.tsx',
  'App.tsx',
  'package.json'
];

console.log('📋 Vérification des fichiers requis...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Des fichiers requis sont manquants. Arrêt du script.');
  process.exit(1);
}

// 2. Vérifier la configuration app.json
console.log('\n📱 Vérification de app.json...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  const requiredFields = [
    'expo.name',
    'expo.slug',
    'expo.version',
    'expo.ios.bundleIdentifier',
    'expo.android.package'
  ];

  let configValid = true;
  requiredFields.forEach(field => {
    const keys = field.split('.');
    let value = appJson;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (value) {
      console.log(`✅ ${field}: ${value}`);
    } else {
      console.log(`❌ ${field} - MANQUANT`);
      configValid = false;
    }
  });

  if (!configValid) {
    console.log('\n⚠️  Configuration app.json incomplète. Génération automatique...');
    
    // Générer la configuration manquante
    if (!appJson.expo.ios) appJson.expo.ios = {};
    if (!appJson.expo.android) appJson.expo.android = {};
    
    appJson.expo.ios.bundleIdentifier = appJson.expo.ios.bundleIdentifier || 'com.mangaswap.app';
    appJson.expo.android.package = appJson.expo.android.package || 'com.mangaswap.app';
    
    fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
    console.log('✅ Configuration mise à jour automatiquement');
  }

} catch (error) {
  console.log(`❌ Erreur lecture app.json: ${error.message}`);
  process.exit(1);
}

// 3. Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const criticalDeps = [
    'expo',
    'react',
    'react-native',
    '@expo/vector-icons',
    'react-navigation'
  ];

  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`⚠️  ${dep} - Pourrait être requis`);
    }
  });

} catch (error) {
  console.log(`❌ Erreur lecture package.json: ${error.message}`);
}

// 4. Créer le fichier de build info
console.log('\n📝 Création des métadonnées de build...');
const buildInfo = {
  version: require('../package.json').version,
  buildDate: new Date().toISOString(),
  platform: process.platform,
  nodeVersion: process.version,
  features: [
    'Performance Optimization',
    'Social Features (Reviews & Profiles)',
    'AI Recommendations', 
    'External API Integration',
    'Push Notifications',
    'Smart Caching',
    'Optimized Images'
  ]
};

fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
console.log('✅ build-info.json créé');

// 5. Nettoyer les fichiers temporaires
console.log('\n🧹 Nettoyage des fichiers temporaires...');
const tempFiles = [
  'npm-debug.log',
  'yarn-error.log',
  '.DS_Store'
];

tempFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Supprimé: ${file}`);
    }
  } catch (error) {
    console.log(`⚠️  Impossible de supprimer ${file}: ${error.message}`);
  }
});

// 6. Générer le script de déploiement
console.log('\n📜 Génération du script de déploiement...');
const deployScript = `#!/bin/bash

echo "🚀 Déploiement Manga Swap"
echo "========================="

# Vérification préalable
if ! command -v npx &> /dev/null; then
    echo "❌ npx non trouvé. Installez Node.js"
    exit 1
fi

# Options de build
echo "Choisissez le type de build:"
echo "1) Test rapide (Expo Go)"
echo "2) Build Android APK"
echo "3) Build iOS + Android (EAS)"
echo "4) Build de production"

read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo "🔄 Publication pour Expo Go..."
        npx expo publish
        echo "✅ Terminé! Partagez le QR code avec vos testeurs"
        ;;
    2)
        echo "📱 Build Android APK..."
        npx eas build --platform android --profile preview
        ;;
    3)
        echo "📱 Build multi-plateforme..."
        npx eas build --platform all --profile preview
        ;;
    4)
        echo "🏭 Build de production..."
        npx eas build --platform all --profile production
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo "🎉 Déploiement lancé avec succès!"
`;

fs.writeFileSync('deploy.sh', deployScript);
fs.chmodSync('deploy.sh', '755');
console.log('✅ deploy.sh créé et rendu exécutable');

// 7. Résumé final
console.log('\n' + '='.repeat(50));
console.log('🎉 PRÉPARATION TERMINÉE!');
console.log('='.repeat(50));
console.log('');
console.log('📋 Prochaines étapes:');
console.log('1. Testez l\'app localement: npm start');
console.log('2. Installez EAS CLI: npm install -g @expo/eas-cli');
console.log('3. Connectez-vous: eas login');
console.log('4. Lancez le déploiement: ./deploy.sh');
console.log('');
console.log('📚 Consultez DEPLOYMENT_GUIDE.md pour plus de détails');
console.log('🐛 En cas de problème, vérifiez les logs dans la console');
console.log('');