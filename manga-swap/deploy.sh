#!/bin/bash

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
